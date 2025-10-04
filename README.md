# Milap.AI - Missing Person Tracking System

<div align="center">
  <img src="./frontend/src/components/Hero/milapai_4.png" alt="Milap.AI Logo" width="200"/>
  
  **An intelligent missing person tracking and reunification platform powered by AI face recognition**

  [![React](https://img.shields.io/badge/React-18.1.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![Flask](https://img.shields.io/badge/Flask-Python-lightgrey.svg)](https://flask.palletsprojects.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
  [![License](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Face Recognition System](#-face-recognition-system)
- [Security](#-security)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**Milap.AI** is a comprehensive missing person tracking system that leverages cutting-edge AI-powered face recognition technology to help reunite missing persons with their families. The platform provides a seamless interface for reporting missing persons, tracking cases, and utilizing real-time face detection to identify individuals.

### Key Highlights

- 🎯 **Real-time Face Recognition** - Advanced AI-powered facial detection using OpenCV and face_recognition library
- 📱 **WhatsApp Notifications** - Instant alerts when a missing person is identified
- 🗺️ **Location Tracking** - Geographic tracking of missing person sightings
- 👤 **User Dashboard** - Comprehensive case management for families and authorities
- 🔐 **Secure Authentication** - JWT-based auth with Google OAuth integration
- 📊 **Admin Panel** - Advanced analytics and case management for administrators

---

## ✨ Features

### For Users
- 🔍 **Report Missing Persons** - Submit detailed reports with photos and information
- 📸 **Upload Multiple Photos** - Support for multiple image uploads per case
- 📈 **Track Case Status** - Real-time updates on case progress
- 🔔 **Instant Notifications** - WhatsApp alerts when matches are found
- 🗺️ **Map Integration** - View locations of potential sightings
- 👥 **Profile Management** - Manage personal information and cases

### For Administrators
- 📊 **Dashboard Analytics** - Comprehensive statistics and insights
- ✅ **Case Approval System** - Review and approve missing person reports
- 👁️ **Monitor Active Cases** - Track all ongoing investigations
- 🎯 **Location Management** - Manage detection nodes and coverage areas

### AI Face Recognition
- 🤖 **Real-time Detection** - Live webcam-based face recognition
- 🔄 **Smart Cooldown System** - Prevents duplicate notifications (300s cooldown)
- 📦 **Batch Processing** - Efficient frame processing (every 10th frame)
- 🎯 **High Accuracy** - Advanced face encoding and matching algorithms
- 💾 **Session Tracking** - Prevents repeated detections in same session

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.1.0
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM v6
- **Icons**: Font Awesome, Heroicons, Lucide React
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Components**: Radix UI

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT + Google OAuth
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **CORS**: Enabled

### AI/ML (Face Recognition)
- **Framework**: Flask
- **Face Recognition**: face_recognition (dlib)
- **Computer Vision**: OpenCV
- **Image Processing**: Pillow (PIL)
- **HTTP Client**: requests
- **Environment**: python-dotenv

### External Services
- **Database**: MongoDB Atlas
- **Authentication**: Google OAuth 2.0
- **Notifications**: UltraMsg WhatsApp API

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                    React Frontend (Port 3000)                │
│           UI Components │ State Management │ Routing         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │
┌────────────────────────┴────────────────────────────────────┐
│                     APPLICATION LAYER                        │
├──────────────────────────────┬──────────────────────────────┤
│   Node.js Backend (Port 5000)│  Flask AI Service (Port 5001)│
│   • REST API Endpoints       │  • Face Recognition Engine   │
│   • JWT Authentication       │  • Webcam Integration        │
│   • File Upload Handler      │  • Real-time Detection       │
│   • Business Logic           │  • Notification Service      │
└──────────────┬───────────────┴────────────┬─────────────────┘
               │                            │
               │                            │
┌──────────────┴────────────────────────────┴─────────────────┐
│                      DATA LAYER                              │
├──────────────────────────────────────────────────────────────┤
│  MongoDB Atlas                                               │
│  • Users Collection         • Cases Collection               │
│  • Admin Collection         • Location Tracking              │
│  • Resolved Cases          • Nodes Collection               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  • Google OAuth 2.0         • UltraMsg WhatsApp API          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before installation, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Visual C++ Build Tools** (for face_recognition on Windows)

### System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **Webcam**: Required for face recognition features

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd milap.ai
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Set Up Python Environment for Face Recognition

#### On Windows (PowerShell)
```powershell
cd ../model
python -m venv flask_env
.\flask_env\Scripts\Activate.ps1
pip install -r requirements_flask.txt
```

#### On macOS/Linux
```bash
cd ../model
python3 -m venv flask_env
source flask_env/bin/activate
pip install -r requirements_flask.txt
```

---

## ⚙️ Environment Setup

### 1. Backend Environment Variables

Create `backend/.env`:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret (256-bit key)
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Port
PORT=5000
```

### 2. Frontend Environment Variables

Create `frontend/.env`:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Google OAuth Client ID
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Flask AI Service Environment Variables

Create `model/.env`:

```env
# Backend API Configuration
API_BASE_URL=http://localhost:5000

# WhatsApp Notification Service (UltraMsg)
WHATSAPP_INSTANCE_ID=instance106119
WHATSAPP_API_TOKEN=your_ultramsg_api_token

# Face Detection Settings
DETECTION_COOLDOWN=300
LOG_COOLDOWN=30
```

### 📚 Detailed Setup Guide

For step-by-step environment configuration instructions, see:
- 📄 [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Quick setup guide
- 📄 [ENV_SETUP_README.md](./ENV_SETUP_README.md) - Detailed configuration
- 📄 [CREDENTIALS_REFERENCE.md](./CREDENTIALS_REFERENCE.md) - API credentials

---

## ▶️ Running the Application

### Start All Services

You'll need **3 separate terminal windows**:

#### Terminal 1: Backend Server
```bash
cd backend
node index.js
```
✅ Server should start at `http://localhost:5000`

#### Terminal 2: Frontend Development Server
```bash
cd frontend
npm start
```
✅ Frontend should open at `http://localhost:3000`

#### Terminal 3: Flask AI Service

**Windows PowerShell:**
```powershell
cd model
.\flask_env\Scripts\Activate.ps1
python flask_app.py
```

**macOS/Linux:**
```bash
cd model
source flask_env/bin/activate
python flask_app.py
```
✅ Flask service should start at `http://localhost:5001`

### Verify Installation

1. Open browser to `http://localhost:3000`
2. You should see the Milap.AI homepage
3. Navigate to "Face Recognition" to test AI service
4. Backend logs should show MongoDB connection success

---

## 📁 Project Structure

```
milap.ai/
│
├── backend/                      # Node.js Express Backend
│   ├── controllers/             # Request handlers
│   │   └── authController.js    # Authentication logic
│   ├── middlewares/             # Express middlewares
│   │   ├── adminAuth.js         # Admin authorization
│   │   └── error.middleware.js  # Error handling
│   ├── models/                  # Mongoose schemas
│   │   ├── Admin.js             # Admin user model
│   │   ├── Case.js              # Missing person case
│   │   ├── Users.js             # User model
│   │   ├── Person.js            # Person details
│   │   ├── location.js          # Location data
│   │   └── LocationTracking.js  # Tracking records
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── adminAuth.js         # Admin routes
│   │   ├── cases.js             # Case management
│   │   ├── users.js             # User operations
│   │   ├── location.js          # Location tracking
│   │   └── missing.js           # Missing person ops
│   ├── services/                # Business logic
│   │   └── GeolocationService.js
│   ├── uploads/                 # Uploaded images
│   ├── .env                     # Environment variables
│   ├── db.js                    # MongoDB connection
│   ├── index.js                 # Server entry point
│   └── package.json             # Dependencies
│
├── frontend/                    # React Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Hero/          # Landing page
│   │   │   ├── navbar/        # Navigation
│   │   │   ├── Profile/       # User dashboard
│   │   │   ├── Login/         # Authentication
│   │   │   ├── Admin/         # Admin panel
│   │   │   └── ...
│   │   ├── context/           # React Context
│   │   ├── App.js             # Root component
│   │   └── index.js           # Entry point
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies
│   └── tailwind.config.js     # Tailwind config
│
├── model/                      # Flask AI Service
│   ├── flask_env/             # Python virtual environment
│   ├── templates/             # HTML templates
│   │   └── index.html         # Face recognition UI
│   ├── .env                   # Environment variables
│   ├── flask_app.py           # Flask application
│   └── requirements_flask.txt # Python dependencies
│
├── images/                     # Approved case images
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── SETUP_CHECKLIST.md         # Setup guide
├── ENV_SETUP_README.md        # Environment guide
└── CREDENTIALS_REFERENCE.md   # API credentials
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Google OAuth Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "google_oauth_token"
}
```

### Case Management Endpoints

#### Create Missing Person Case
```http
POST /api/cases/create
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "name": "Jane Doe",
  "age": 25,
  "description": "Last seen wearing blue jacket",
  "lastSeenLocation": "Downtown Square",
  "image": <file>
}
```

#### Get User Cases
```http
GET /api/cases/user/:userId
Authorization: Bearer <jwt_token>
```

#### Get All Cases (Admin)
```http
GET /api/admin/cases
Authorization: Bearer <admin_jwt_token>
```

#### Approve Case (Admin)
```http
PUT /api/admin/cases/:caseId/approve
Authorization: Bearer <admin_jwt_token>
```

### Location Tracking Endpoints

#### Add Location Tracking
```http
POST /api/location/track
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "caseId": "case_id_here",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "timestamp": "2025-10-04T10:30:00Z"
}
```

---

## 🤖 Face Recognition System

### How It Works

1. **Image Collection**: Approved cases are downloaded from the backend
2. **Face Encoding**: Images are processed to create unique face encodings
3. **Live Detection**: Webcam feed is analyzed frame-by-frame
4. **Matching Algorithm**: Detected faces are compared against known encodings
5. **Notification**: When a match is found, WhatsApp alert is sent

### Technical Details

- **Detection Rate**: Every 10th frame processed (optimized for performance)
- **Cooldown Period**: 300 seconds between notifications for same person
- **Match Threshold**: Configurable face distance threshold
- **Session Tracking**: Prevents duplicate processing in same session

### Using Face Recognition

1. Navigate to "Face Recognition" in navbar
2. Allow browser camera permissions
3. System automatically loads approved cases
4. Point camera at individuals to detect matches
5. Notifications sent automatically on detection

### Performance Optimization

```python
# Frame processing optimization
frame_count % 10 == 0  # Process every 10th frame

# Cooldown system
DETECTION_COOLDOWN = 300  # 5 minutes between notifications

# Session tracking
detected_in_current_session = set()  # Prevents duplicates
```

---

## 🔒 Security

### Implemented Security Measures

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Environment Variables**: Sensitive data stored in .env files
- ✅ **CORS Protection**: Configured CORS policies
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **File Upload Restrictions**: Image type and size validation
- ✅ **Admin Authorization**: Separate middleware for admin routes
- ✅ **Git Ignore**: Sensitive files excluded from version control

### Best Practices

1. **Never commit .env files** to version control
2. **Rotate API keys** regularly
3. **Use HTTPS** in production
4. **Regular security audits** of dependencies
5. **MongoDB Atlas IP whitelist** for database access

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation as needed

---

## 👥 Team

<div align="center">

### **Priyansh**
*Full Stack Developer & Project Lead*

### **Abhijeet Singh**
*Backend Developer & AI Integration*

</div>

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🆘 Support

### Common Issues

#### MongoDB Connection Failed
- Verify MONGO_URI in backend/.env
- Check MongoDB Atlas network access (IP whitelist)
- Ensure correct username/password

#### Face Recognition Not Working
- Verify Flask service is running on port 5001
- Check camera permissions in browser
- Ensure python virtual environment is activated
- Verify all Python dependencies installed

#### WhatsApp Notifications Not Sending
- Check UltraMsg API token validity
- Verify WHATSAPP_API_TOKEN in model/.env
- Check UltraMsg account credits

### Getting Help

- 📧 **Email**: support@milapai.com
- 🐛 **Issues**: [GitHub Issues](link-to-issues)
- 📖 **Documentation**: Check markdown files in root directory

---

## 🎯 Future Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced ML models for better accuracy
- [ ] SMS notification integration
- [ ] Multi-language support
- [ ] Real-time collaborative case management
- [ ] Integration with law enforcement databases
- [ ] Blockchain for case authenticity
- [ ] AI-powered age progression

---

## 🙏 Acknowledgments

- **Face Recognition Library**: [ageitgey/face_recognition](https://github.com/ageitgey/face_recognition)
- **React Community**: For amazing frontend framework
- **MongoDB**: For scalable database solution
- **All Contributors**: Thank you for your support!

---

<div align="center">
  <p>Made with ❤️ by the Milap.AI Team</p>
  <p>© 2025 Milap.AI. All rights reserved.</p>
</div>
