const axios = require('axios');

class GeolocationService {
    // Get coordinates from location name using multiple APIs
    static async getCoordinatesFromLocation(locationName) {
        try {
            console.log(`🌍 Getting coordinates for: ${locationName}`);
            
            // First try with Nominatim (OpenStreetMap) - free and reliable
            const nominatimCoords = await this.getNominatimCoordinates(locationName);
            if (nominatimCoords) {
                console.log(`✅ Found coordinates via Nominatim: ${nominatimCoords.lat}, ${nominatimCoords.lng}`);
                return nominatimCoords;
            }

            // Fallback to GeoJS IP-based location (limited but free)
            const geojsCoords = await this.getGeoJSCoordinates();
            if (geojsCoords) {
                console.log(`✅ Found coordinates via GeoJS: ${geojsCoords.lat}, ${geojsCoords.lng}`);
                return geojsCoords;
            }

            // If all fails, return default coordinates (New Delhi, India)
            console.log('⚠️ Using default coordinates (New Delhi)');
            return {
                lat: 28.6139,
                lng: 77.2090,
                source: 'default'
            };

        } catch (error) {
            console.error('❌ Error getting coordinates:', error);
            return {
                lat: 28.6139,
                lng: 77.2090,
                source: 'default'
            };
        }
    }

    // Get coordinates using Nominatim (OpenStreetMap)
    static async getNominatimCoordinates(locationName) {
        try {
            const encodedLocation = encodeURIComponent(locationName);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`;
            
            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'MissingPersonApp/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    source: 'nominatim',
                    display_name: result.display_name
                };
            }

            return null;
        } catch (error) {
            console.error('Nominatim API error:', error.message);
            return null;
        }
    }

    // Get coordinates using GeoJS (IP-based, less accurate but free)
    static async getGeoJSCoordinates() {
        try {
            const response = await axios.get('https://get.geojs.io/v1/ip/geo.json', {
                timeout: 5000
            });

            if (response.data && response.data.latitude && response.data.longitude) {
                return {
                    lat: parseFloat(response.data.latitude),
                    lng: parseFloat(response.data.longitude),
                    source: 'geojs',
                    city: response.data.city,
                    country: response.data.country
                };
            }

            return null;
        } catch (error) {
            console.error('GeoJS API error:', error.message);
            return null;
        }
    }

    // Get approximate coordinates for Indian cities (fallback)
    static getIndianCityCoordinates(locationName) {
        const indianCities = {
            'delhi': { lat: 28.6139, lng: 77.2090 },
            'mumbai': { lat: 19.0760, lng: 72.8777 },
            'bangalore': { lat: 12.9716, lng: 77.5946 },
            'chennai': { lat: 13.0827, lng: 80.2707 },
            'kolkata': { lat: 22.5726, lng: 88.3639 },
            'hyderabad': { lat: 17.3850, lng: 78.4867 },
            'pune': { lat: 18.5204, lng: 73.8567 },
            'ahmedabad': { lat: 23.0225, lng: 72.5714 },
            'jaipur': { lat: 26.9124, lng: 75.7873 },
            'lucknow': { lat: 26.8467, lng: 80.9462 },
            'kanpur': { lat: 26.4499, lng: 80.3319 },
            'nagpur': { lat: 21.1458, lng: 79.0882 },
            'indore': { lat: 22.7196, lng: 75.8577 },
            'thane': { lat: 19.2183, lng: 72.9781 },
            'bhopal': { lat: 23.2599, lng: 77.4126 },
            'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
            'pimpri': { lat: 18.6298, lng: 73.7997 },
            'patna': { lat: 25.5941, lng: 85.1376 },
            'vadodara': { lat: 22.3072, lng: 73.1812 },
            'ghaziabad': { lat: 28.6692, lng: 77.4538 },
            'ludhiana': { lat: 30.9010, lng: 75.8573 },
            'agra': { lat: 27.1767, lng: 78.0081 },
            'nashik': { lat: 19.9975, lng: 73.7898 },
            'faridabad': { lat: 28.4089, lng: 77.3178 },
            'meerut': { lat: 28.9845, lng: 77.7064 },
            'rajkot': { lat: 22.3039, lng: 70.8022 },
            'kalyan': { lat: 19.2437, lng: 73.1355 },
            'vasai': { lat: 19.4559, lng: 72.8066 },
            'varanasi': { lat: 25.3176, lng: 82.9739 }
        };

        const searchLocation = locationName.toLowerCase().trim();
        
        // Direct match
        if (indianCities[searchLocation]) {
            return {
                ...indianCities[searchLocation],
                source: 'city_lookup'
            };
        }

        // Partial match
        for (const [city, coords] of Object.entries(indianCities)) {
            if (searchLocation.includes(city) || city.includes(searchLocation)) {
                return {
                    ...coords,
                    source: 'city_lookup'
                };
            }
        }

        return null;
    }

    // Validate coordinates
    static isValidCoordinates(lat, lng) {
        return (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180
        );
    }

    // Calculate distance between two coordinates (in kilometers)
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    static toRadians(degrees) {
        return degrees * (Math.PI/180);
    }
}

module.exports = GeolocationService;
