from flask import Flask, render_template, Response, jsonify, request
from flask_cors import CORS
import cv2
import json
import threading
import time
import requests
import face_recognition
import numpy as np
import os
from PIL import Image
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend integration

# Global variables
camera = None
face_recognizer = None
detection_active = False
latest_detection = None
detected_persons = {}  # Track detected persons with timestamps to prevent duplicates

# API Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000/api')

# WhatsApp Configuration
WHATSAPP_INSTANCE_ID = os.getenv('WHATSAPP_INSTANCE_ID')
WHATSAPP_API_TOKEN = os.getenv('WHATSAPP_API_TOKEN')

# Configuration
DETECTION_COOLDOWN = int(os.getenv('DETECTION_COOLDOWN', 300))  # 5 minutes cooldown between notifications for same person

class WebFaceRecognizer:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_phone_numbers = []
        self.known_adhaar_numbers = []
        self.detection_results = []
        self.person_details_cache = {}  # Cache for person details
        
    def load_encoding_images(self, images_path="./images"):
        """Load and encode images fetched from database"""
        if not os.path.exists(images_path):
            print(f"Images directory {images_path} not found, creating it...")
            os.makedirs(images_path)
            return False
            
        image_files = [f for f in os.listdir(images_path) if f.endswith((".jpg", ".png", ".jpeg"))]
        print(f"Found {len(image_files)} image files from database")
        
        loaded_count = 0
        for filename in image_files:
            image_path = os.path.join(images_path, filename)
            # Extract name from filename (before first underscore)
            name = filename.split("_")[0]
            name_key = name.lower()
            
            print(f"Processing database image: {filename} for person: {name} (key: {name_key})")
            
            # Get phone number and adhaar from cached database details
            phone_number, adhaar_number = self.get_person_details(name)
            if not phone_number:
                print(f"No cached contact details found for {name} (key: {name_key}), skipping...")
                continue
                
            if name in self.known_face_names:
                print(f"Encoding already exists for {name}, skipping...")
                continue  # Skip duplicates
                
            try:
                # Load and encode the image
                image = cv2.imread(image_path)
                if image is None:
                    print(f"Could not read image: {image_path}")
                    continue
                    
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                face_encodings = face_recognition.face_encodings(rgb_image)
                
                if len(face_encodings) > 0:
                    self.known_face_encodings.append(face_encodings[0])
                    self.known_face_names.append(name)
                    self.known_phone_numbers.append(phone_number)
                    self.known_adhaar_numbers.append(adhaar_number)
                    loaded_count += 1
                    print(f"✅ Loaded encoding for {name}")
                else:
                    print(f"❌ No faces found in {filename}")
                    
            except Exception as e:
                print(f"Error loading/encoding image {filename}: {e}")
                
        print(f"Successfully loaded {loaded_count} face encodings")
        return loaded_count > 0
    
    def get_person_details(self, name):
        """Get person details from cached database information"""
        # Check cache using lowercase key for consistency
        name_key = name.lower()
        if name_key in self.person_details_cache:
            details = self.person_details_cache[name_key]
            print(f"Found cached details for {name} (key: {name_key})")
            return details.get('phone'), details.get('adhaar')
        
        # No cache means person not in approved database cases
        print(f"No cached details found for {name} (key: {name_key}) - not in approved cases")
        print(f"Available cache keys: {list(self.person_details_cache.keys())}")
        return None, None
    
    def detect_faces(self, frame):
        """Detect and recognize faces in frame"""
        # Resize for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        # Find faces
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        # Scale locations back up
        face_locations = [(top*4, right*4, bottom*4, left*4) 
                         for (top, right, bottom, left) in face_locations]
        
        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(
                self.known_face_encodings, face_encoding, tolerance=0.6)
            name = "Unknown"
            
            if True in matches:
                face_distances = face_recognition.face_distance(
                    self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = self.known_face_names[best_match_index]
            
            face_names.append(name)
        
        return face_locations, face_names

def get_location():
    """Get current location using GeoJS API"""
    try:
        response = requests.get("https://get.geojs.io/v1/ip/geo.json", timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error getting location: {e}")
        return None

def download_images():
    """Download images from database only - no fallback to uploads folder"""
    # Only try API - uploads folder is temporary and gets cleaned after database upload
    downloaded = download_images_from_api()
    
    if downloaded == 0:
        print("No approved cases found in database. Make sure cases are approved by admin.")
    
    return downloaded

def download_images_from_api():
    """Fetch approved case images from database for face recognition"""
    global face_recognizer
    
    # Initialize a temporary cache for this session
    temp_cache = {}
    
    try:
        url = f"{API_BASE_URL}/cases/approved/face-recognition"
        print(f"Fetching approved cases from database: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        cases = response.json()
        
        print(f"Database Response: Found {len(cases)} approved cases")
        
        if not os.path.exists("./images"):
            os.makedirs("./images")
        
        processed = 0
        for case in cases:
            try:
                name = case.get('name')
                adhaar = case.get('adhaarNumber')
                contact = case.get('contactNumber')
                
                if not name or not adhaar or not contact:
                    print(f"Skipping case - missing required fields: {case.get('name', 'N/A')}")
                    continue
                
                # Cache the person details using lowercase name as key for consistency
                name_key = name.lower()
                temp_cache[name_key] = {
                    'phone': contact,
                    'adhaar': adhaar,
                    'original_name': name
                }
                print(f"Cached details for: {name} (key: {name_key})")
                
                filename = f"{name}_{adhaar}.png"
                filepath = os.path.join("./images", filename)
                
                if os.path.exists(filepath):
                    print(f"Image already exists for {name}")
                    processed += 1
                    continue
                
                # Extract and decode image from database
                image_data = case.get('image')
                if image_data:
                    try:
                        # Database stores base64 encoded images
                        if isinstance(image_data, str):
                            # Remove data URL prefix if present
                            if image_data.startswith('data:'):
                                image_data = image_data.split(',')[1]
                            
                            # Decode base64 image from database
                            image_bytes = base64.b64decode(image_data)
                            image_array = np.frombuffer(image_bytes, dtype=np.uint8)
                            
                            # Decode and save image for face recognition
                            img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
                            if img is not None:
                                cv2.imwrite(filepath, img)
                                processed += 1
                                print(f"Processed image for {name} from database")
                            else:
                                print(f"Failed to decode image for {name}")
                        else:
                            print(f"Invalid image data format for {name}")
                            
                    except Exception as decode_error:
                        print(f"Error decoding image for {name}: {decode_error}")
                        continue
                else:
                    print(f"No image data found in database for {name}")
                        
            except Exception as e:
                print(f"Error processing case {case.get('name', 'Unknown')}: {e}")
        
        # Update face_recognizer cache with the temp cache
        if face_recognizer:
            face_recognizer.person_details_cache = temp_cache
        
        print(f"Processed {processed} cases from database for face recognition")
        print(f"Cached contact details for {len(temp_cache)} persons")
        return processed
        
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to backend API at {API_BASE_URL}")
        print("Make sure your backend server is running at http://localhost:5000")
        return 0
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from database: {e}")
        return 0
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return 0

def should_process_detection(name):
    """Check if enough time has passed since last detection of this person"""
    global detected_persons
    
    current_time = time.time()
    name_key = name.lower()
    
    # Check if person was detected recently
    if name_key in detected_persons:
        time_since_last = current_time - detected_persons[name_key]['last_notification']
        
        if time_since_last < DETECTION_COOLDOWN:
            # Only print cooldown message once every 30 seconds
            last_log = detected_persons[name_key].get('last_log', 0)
            if current_time - last_log >= 30:
                remaining = int(DETECTION_COOLDOWN - time_since_last)
                print(f"⏳ Cooldown active for {name}: {remaining}s remaining (notifications paused)")
                detected_persons[name_key]['last_log'] = current_time
            return False
    
    # Update last detection time - this person will now get notification
    detected_persons[name_key] = {
        'last_notification': current_time,
        'last_log': current_time
    }
    print(f"🔓 Cooldown cleared for {name} - processing notification")
    return True

def generate_frames():
    """Generate video frames with face detection"""
    global camera, face_recognizer, detection_active, latest_detection
    
    if camera is None:
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            return
    
    frame_count = 0
    detected_in_current_session = set()  # Track who we've processed in this session
    
    while detection_active:
        if not detection_active:  # Check again before reading
            break
            
        success, frame = camera.read()
        if not success or not detection_active:
            break
        
        frame_count += 1
        
        # Process every 10th frame for better performance (reduced from 3)
        if frame_count % 10 == 0 and face_recognizer:
            try:
                face_locations, face_names = face_recognizer.detect_faces(frame)
                
                # Draw rectangles and names
                for (top, right, bottom, left), name in zip(face_locations, face_names):
                    color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
                    
                    cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                    cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
                    cv2.putText(frame, name, (left + 6, bottom - 6), 
                               cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)
                    
                    # Only check cooldown once per person per detection session
                    # This prevents repeated calls to should_process_detection
                    if name != "Unknown":
                        if name not in detected_in_current_session:
                            # First time seeing this person - check if we should notify
                            if should_process_detection(name):
                                detected_in_current_session.add(name)
                                handle_detection(name)
                        
            except Exception as e:
                print(f"Detection error: {e}")
        
        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if ret:
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

def handle_detection(name):
    """Handle when a person is detected"""
    global latest_detection, face_recognizer
    
    try:
        print(f"\n🚨 NEW DETECTION: Processing {name}...")
        
        # Get person details
        name_index = face_recognizer.known_face_names.index(name)
        phone_number = face_recognizer.known_phone_numbers[name_index]
        adhaar_number = face_recognizer.known_adhaar_numbers[name_index]
        
        # Get location
        location_data = get_location()
        
        # Store latest detection
        latest_detection = {
            'name': name,
            'adhaar_number': adhaar_number,
            'phone_number': phone_number,
            'location': location_data,
            'timestamp': time.time()
        }
        
        # Update location in database (only once per detection)
        db_success = False
        if location_data:
            db_success = update_location_in_db(name, adhaar_number, location_data)
        else:
            print("⚠️ No location data available, skipping database update")
            
        # Send WhatsApp notification (only once per detection)
        whatsapp_success = False
        if phone_number and location_data:
            whatsapp_success = send_whatsapp_notification(phone_number, name, adhaar_number, location_data)
        else:
            print("⚠️ Missing phone or location data, skipping WhatsApp notification")
        
        # Summary
        print(f"\n{'='*60}")
        print(f"📊 DETECTION SUMMARY for {name}")
        print(f"   Database Update: {'✅ Success' if db_success else '❌ Failed'}")
        print(f"   WhatsApp Alert: {'✅ Sent' if whatsapp_success else '❌ Failed'}")
        print(f"   Next notification allowed in: {DETECTION_COOLDOWN}s ({DETECTION_COOLDOWN//60} minutes)")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"Error handling detection: {e}")

def update_location_in_db(name, adhaar_number, location_data):
    """Update case location in database"""
    try:
        current_time = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
        
        data = {
            "name": name,
            "adhaar_number": adhaar_number,
            "continent_code": location_data.get('continent_code', 'N/A'),
            "region": location_data.get('region', 'N/A'),
            "latitude": location_data.get('latitude', 'N/A'),
            "longitude": location_data.get('longitude', 'N/A'),
            "ip": location_data.get('ip', 'N/A'),
            "city": location_data.get('city', 'N/A'),
            "timezone": location_data.get('timezone', 'N/A'),
            "country": location_data.get('country', 'N/A'),
            "date": current_time
        }
        
        url = f"{API_BASE_URL}/foundlocation/addlocationhistory"
        print(f"📍 Updating location in database: {url}")
        print(f"   Data: {name} at {location_data.get('city', 'N/A')}, {location_data.get('country', 'N/A')}")
        
        response = requests.post(url, json=data, timeout=10)
        response.raise_for_status()
        
        response_data = response.json()
        print(f"✅ Database response: {response_data}")
        print(f"✅ Location successfully saved to database for {name}")
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Cannot connect to backend at {API_BASE_URL}")
        print(f"   Make sure your backend server is running on port 5000")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Error: Database request timed out")
        return False
    except Exception as e:
        print(f"❌ Error updating location in database: {e}")
        return False

def send_whatsapp_notification(phone_number, name, adhaar, location):
    """Send WhatsApp notification"""
    try:
        city = location.get('city', 'N/A')
        region = location.get('region', 'N/A')
        country = location.get('country', 'N/A')
        latitude = location.get('latitude', 'N/A')
        longitude = location.get('longitude', 'N/A')

        message = f"!!!ATTENTION!!!\nYour missing person {name} (Aadhaar: {adhaar}) has been found!\n" \
                  f"Location: {city}, {region}, {country}\n" \
                  f"Coordinates: {latitude}, {longitude}\n" \
                  f"Maps: https://www.google.com/maps/place/{latitude},{longitude}\n" \
                  f"Please contact local authorities immediately.\n" \
                  f"Regards, Milap.AI - Missing Person Recovery System"

        url = f"https://api.ultramsg.com/{WHATSAPP_INSTANCE_ID}/messages/chat"
        payload = f"token={WHATSAPP_API_TOKEN}&to=+91{phone_number}&body={message}&priority=1"
        headers = {'content-type': 'application/x-www-form-urlencoded'}

        print(f"📱 Sending WhatsApp to +91{phone_number}...")
        response = requests.post(url, data=payload, headers=headers, timeout=10)
        response.raise_for_status()
        print(f"✅ WhatsApp notification successfully sent to +91{phone_number}")
        return True
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ WhatsApp API Error: {e}")
        print(f"   This usually means your WhatsApp API token is invalid or expired")
        return False
    except Exception as e:
        print(f"❌ Error sending WhatsApp: {e}")
        return False

# Flask Routes
@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/start_detection', methods=['POST'])
def start_detection():
    """Start face detection"""
    global detection_active, face_recognizer
    
    if detection_active:
        return jsonify({'status': 'already_running'})
    
    try:
        # Initialize face recognizer FIRST (before downloading)
        print("Initializing face recognizer...")
        face_recognizer = WebFaceRecognizer()
        
        # Fetch latest approved cases from database
        print("Fetching approved cases from database...")
        processed = download_images()
        
        # Load face encodings from downloaded images
        print("Loading face encodings from database images...")
        
        # Try to load face encodings
        if not face_recognizer.load_encoding_images():
            return jsonify({
                'status': 'error', 
                'message': 'No face encodings loaded. Please ensure your backend is running and has approved missing person cases in the database.'
            })
        
        detection_active = True
        return jsonify({
            'status': 'started', 
            'loaded_faces': len(face_recognizer.known_face_names),
            'message': f'Successfully loaded {len(face_recognizer.known_face_names)} approved missing person cases from database'
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/stop_detection', methods=['POST'])
def stop_detection():
    """Stop face detection"""
    global detection_active, camera, detected_persons
    
    print("🛑 Stopping detection...")
    detection_active = False
    
    # Give time for frame generation to stop
    time.sleep(0.5)
    
    # Release camera gracefully
    if camera:
        try:
            camera.release()
            cv2.destroyAllWindows()  # Clean up any OpenCV windows
            print("✅ Camera released successfully")
        except Exception as e:
            print(f"⚠️ Camera release warning (can be ignored): {e}")
        finally:
            camera = None
    
    # Clear detection history when stopping
    detected_persons.clear()
    print("✅ Detection stopped - cleared detection history")
    
    return jsonify({'status': 'stopped'})

@app.route('/api/detection_status')
def detection_status():
    """Get detection status"""
    global latest_detection
    
    return jsonify({
        'active': detection_active,
        'latest_detection': latest_detection,
        'loaded_faces': len(face_recognizer.known_face_names) if face_recognizer else 0
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': time.time()})

if __name__ == '__main__':
    print("Starting Milap.AI Face Recognition Web Server...")
    print("Server will be available at: http://localhost:5001")
    print("Video feed: http://localhost:5001/video_feed")
    print("API docs: http://localhost:5001/api/health")
    
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
