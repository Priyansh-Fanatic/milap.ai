const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const LocationTracking = require('../models/LocationTracking');
const GeolocationService = require('../services/GeolocationService');
const { protect } = require('../controllers/authController');
const adminAuth = require('../middlewares/adminAuth');

// Create a new case
router.post('/create', protect, async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            dateMissing,
            lastSeenLocation,
            incidentTime,
            description,
            contactNumber,
            address,
            adhaarNumber,
            height,
            weight,
            distinguishingMarks,
            image,
            firReport,
            reportedBy,
            reportedByUsername
        } = req.body;

        // Validate required fields
        if (!name || !age || !gender || !dateMissing || !lastSeenLocation || 
            !incidentTime || !description || !contactNumber || !address || 
            !adhaarNumber || !image || !firReport) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Create new case
        const newCase = new Case({
            reportedBy: reportedBy || req.user.id,
            reportedByUsername: reportedByUsername || req.user.name,
            name,
            age: parseInt(age),
            gender,
            dateMissing: new Date(dateMissing),
            lastSeenLocation,
            incidentTime,
            description,
            contactNumber,
            address,
            adhaarNumber,
            height,
            weight,
            distinguishingMarks,
            image,
            firReport,
            status: 'pending'
        });

        console.log('About to save case, caseId before save:', newCase.caseId);
        const savedCase = await newCase.save();
        console.log('Case saved successfully, caseId after save:', savedCase.caseId);

        res.status(201).json({
            success: true,
            message: 'Case registered successfully',
            caseId: savedCase.caseId,
            case: {
                _id: savedCase._id,
                caseId: savedCase.caseId,
                name: savedCase.name,
                status: savedCase.status,
                createdAt: savedCase.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating case:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A case with this Aadhaar number already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while creating case'
        });
    }
});

// Get all cases for a user
router.get('/my-cases', protect, async (req, res) => {
    try {
        console.log('📋 GET /my-cases request received');
        console.log('User ID:', req.user?.id);
        console.log('User name:', req.user?.name);
        
        const cases = await Case.find({ reportedBy: req.user.id })
            .sort({ createdAt: -1 })
            .select('-image -firReport'); // Exclude large base64 data for list view

        console.log('Found cases:', cases.length);
        
        res.status(200).json({
            success: true,
            cases
        });
    } catch (error) {
        console.error('Error fetching user cases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cases'
        });
    }
});

// Get all approved cases (public view - simplified)
router.get('/approved', async (req, res) => {
    try {
        const cases = await Case.find({ status: 'approved' })
            .select('-firReport -adhaarNumber -contactNumber -address -reportedBy') // Exclude sensitive data
            .sort({ createdAt: -1 });

        res.status(200).json(cases);
    } catch (error) {
        console.error('Error fetching approved cases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching approved cases'
        });
    }
});

// Get all approved cases for face recognition system (includes sensitive data for matching)
router.get('/approved/face-recognition', async (req, res) => {
    try {
        const cases = await Case.find({ status: 'approved' })
            .select('name contactNumber adhaarNumber image caseId')
            .sort({ createdAt: -1 });

        res.status(200).json(cases);
    } catch (error) {
        console.error('Error fetching approved cases for face recognition:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching approved cases for face recognition'
        });
    }
});

// Get all approved cases (public view)
router.get('/public/approved', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let query = { status: 'approved' };
        
        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { lastSeenLocation: { $regex: search, $options: 'i' } },
                { caseId: { $regex: search, $options: 'i' } }
            ];
        }

        const cases = await Case.find(query)
            .select('-firReport -adhaarNumber -contactNumber -address -reportedBy') // Exclude sensitive data
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Case.countDocuments(query);

        res.status(200).json({
            success: true,
            cases,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching approved cases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching approved cases'
        });
    }
});

// Get single case details (public view)
router.get('/public/case/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const case_ = await Case.findById(id)
            .select('-firReport -adhaarNumber -contactNumber -address -reportedBy') // Exclude sensitive data
            .populate('approvedBy', 'name role');

        if (!case_) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        // Only return approved cases for public view
        if (case_.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Case not available for public view'
            });
        }

        res.status(200).json({
            success: true,
            case: case_
        });
    } catch (error) {
        console.error('Error fetching case details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching case details'
        });
    }
});

// Get location tracking data for a case (public view)
router.get('/locations/:caseId', async (req, res) => {
    try {
        const { caseId } = req.params;
        
        // Try to get actual location tracking data
        let locations = await LocationTracking.getLocationTimeline(caseId);
        
        // If no tracking data exists, create initial tracking data with coordinates
        if (!locations || locations.length === 0) {
            const case_ = await Case.findOne({ 
                $or: [
                    { caseId: caseId },
                    { _id: caseId }
                ]
            }).select('lastSeenLocation dateMissing caseId');
            
            if (case_) {
                console.log(`📍 Creating initial location tracking for case: ${case_.caseId}`);
                
                // Get coordinates for the last seen location
                const coordinates = await GeolocationService.getCoordinatesFromLocation(case_.lastSeenLocation);
                
                // Create initial location tracking entry
                const initialLocation = new LocationTracking({
                    caseId: case_.caseId,
                    case: case_._id,
                    location: case_.lastSeenLocation,
                    coordinates: {
                        latitude: coordinates.lat,
                        longitude: coordinates.lng,
                        source: coordinates.source,
                        accuracy: coordinates.accuracy || null
                    },
                    detectionSource: 'initial_report',
                    confidence: 'High',
                    detectionTime: case_.dateMissing || new Date(),
                    reportedBy: 'system'
                });

                await initialLocation.save();
                console.log(`✅ Created initial location tracking with coordinates: ${coordinates.lat}, ${coordinates.lng}`);
                
                locations = [initialLocation];
            }
        }

        // Format location data for response
        const formattedLocations = locations.map(loc => ({
            id: loc._id,
            location: loc.location,
            timestamp: loc.detectionTime,
            source: loc.detectionSource === 'face_recognition' ? 'Face Recognition' : 
                    loc.detectionSource === 'initial_report' ? 'Initial Report' :
                    loc.detectionSource === 'cctv' ? 'CCTV Detection' : 'Manual Update',
            confidence: loc.confidence,
            coordinates: loc.coordinates && loc.coordinates.latitude && loc.coordinates.longitude ? {
                lat: loc.coordinates.latitude,
                lng: loc.coordinates.longitude,
                source: loc.coordinates.source
            } : null
        }));

        res.status(200).json({
            success: true,
            locations: formattedLocations
        });
    } catch (error) {
        console.error('Error fetching location data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching location data'
        });
    }
});

// Add location tracking data (for face recognition model updates)
router.post('/locations/:caseId/add', async (req, res) => {
    try {
        const { caseId } = req.params;
        const {
            location,
            coordinates,
            detectionSource = 'face_recognition',
            confidence = 'Medium',
            detectionDetails,
            additionalNotes
        } = req.body;

        // Validate case exists
        const case_ = await Case.findOne({ 
            $or: [
                { caseId: caseId },
                { _id: caseId }
            ]
        });

        if (!case_) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        console.log(`📍 Adding location tracking for case: ${case_.caseId} - Location: ${location}`);

        // Get coordinates if not provided
        let finalCoordinates = coordinates;
        if (!finalCoordinates || !finalCoordinates.lat || !finalCoordinates.lng) {
            console.log('🌍 Fetching coordinates for location:', location);
            const geoData = await GeolocationService.getCoordinatesFromLocation(location);
            finalCoordinates = {
                lat: geoData.lat,
                lng: geoData.lng,
                source: geoData.source,
                accuracy: geoData.accuracy
            };
        }

        // Create new location tracking entry
        const locationTracking = new LocationTracking({
            caseId: case_.caseId,
            case: case_._id,
            location,
            coordinates: {
                latitude: finalCoordinates.lat,
                longitude: finalCoordinates.lng,
                source: finalCoordinates.source || 'manual',
                accuracy: finalCoordinates.accuracy || null
            },
            detectionSource,
            confidence,
            detectionDetails,
            additionalNotes,
            reportedBy: 'system'
        });

        await locationTracking.save();
        console.log(`✅ Location tracking added with coordinates: ${finalCoordinates.lat}, ${finalCoordinates.lng}`);

        res.status(201).json({
            success: true,
            message: 'Location tracking data added successfully',
            locationId: locationTracking._id,
            coordinates: finalCoordinates
        });
    } catch (error) {
        console.error('Error adding location data:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding location data'
        });
    }
});

// Bulk update coordinates for existing cases (Admin only)
router.post('/admin/update-coordinates', adminAuth(['super_admin', 'node_admin']), async (req, res) => {
    try {
        console.log('🔄 Starting bulk coordinate update for existing cases...');
        
        // Get all approved cases without location tracking
        const casesWithoutTracking = await Case.find({ 
            status: 'approved',
            lastSeenLocation: { $exists: true, $ne: '' }
        }).select('caseId lastSeenLocation dateMissing');

        const results = {
            total: casesWithoutTracking.length,
            updated: 0,
            errors: []
        };

        for (const case_ of casesWithoutTracking) {
            try {
                // Check if location tracking already exists
                const existingTracking = await LocationTracking.findOne({ caseId: case_.caseId });
                
                if (!existingTracking) {
                    console.log(`📍 Processing case: ${case_.caseId} - ${case_.lastSeenLocation}`);
                    
                    // Get coordinates for the location
                    const coordinates = await GeolocationService.getCoordinatesFromLocation(case_.lastSeenLocation);
                    
                    // Create location tracking entry
                    const locationTracking = new LocationTracking({
                        caseId: case_.caseId,
                        case: case_._id,
                        location: case_.lastSeenLocation,
                        coordinates: {
                            latitude: coordinates.lat,
                            longitude: coordinates.lng,
                            source: coordinates.source,
                            accuracy: coordinates.accuracy || null
                        },
                        detectionSource: 'initial_report',
                        confidence: 'High',
                        detectionTime: case_.dateMissing || new Date(),
                        reportedBy: 'admin_bulk_update'
                    });

                    await locationTracking.save();
                    results.updated++;
                    
                    console.log(`✅ Updated case ${case_.caseId} with coordinates: ${coordinates.lat}, ${coordinates.lng}`);
                    
                    // Add small delay to avoid overwhelming the APIs
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error(`❌ Error processing case ${case_.caseId}:`, error.message);
                results.errors.push({
                    caseId: case_.caseId,
                    error: error.message
                });
            }
        }

        console.log(`🎉 Bulk update completed. Updated: ${results.updated}/${results.total} cases`);
        
        res.status(200).json({
            success: true,
            message: 'Bulk coordinate update completed',
            results
        });
    } catch (error) {
        console.error('Error in bulk coordinate update:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating coordinates'
        });
    }
});

// Admin routes for case management
router.get('/admin/pending', adminAuth(['super_admin', 'node_admin', 'supervisor']), async (req, res) => {
    try {
        // Check if user is admin (you'll need to implement admin check)
        if (!req.user.isAdmin && !req.user.role?.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const pendingCases = await Case.find({ status: 'pending' })
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            cases: pendingCases
        });
    } catch (error) {
        console.error('Error fetching pending cases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending cases'
        });
    }
});

// Approve case
router.patch('/approve/:caseId', adminAuth(['super_admin', 'node_admin', 'supervisor']), async (req, res) => {
    try {
        // Check if user is admin (middleware already validates role)
        console.log('🟢 Approve case request by admin:', req.user.email, 'Role:', req.user.role);

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.caseId,
            {
                status: 'approved',
                approvedBy: req.user.id,
                approvedAt: new Date()
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Case approved successfully',
            case: updatedCase
        });
    } catch (error) {
        console.error('Error approving case:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving case'
        });
    }
});

// Reject case
router.patch('/reject/:caseId', adminAuth(['super_admin', 'node_admin', 'supervisor']), async (req, res) => {
    try {
        // Check if user is admin (middleware already validates role)
        console.log('🔴 Reject case request by admin:', req.user.email, 'Role:', req.user.role);

        const { reason } = req.body;

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.caseId,
            {
                status: 'rejected',
                rejectionReason: reason || 'No reason provided',
                approvedBy: req.user.id,
                approvedAt: new Date()
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Case rejected successfully',
            case: updatedCase
        });
    } catch (error) {
        console.error('Error rejecting case:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting case'
        });
    }
});

// Resolve case (mark as found/closed)
router.patch('/resolve/:caseId', adminAuth(['super_admin', 'node_admin', 'supervisor']), async (req, res) => {
    try {
        const { reason, foundLocation, foundDate } = req.body;
        console.log('✅ Resolve case request by admin:', req.user.email, 'Role:', req.user.role);

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.caseId,
            {
                status: 'resolved',
                resolvedBy: req.user.id,
                resolvedAt: new Date(),
                resolutionReason: reason || 'Person found',
                foundLocation: foundLocation,
                foundDate: foundDate ? new Date(foundDate) : new Date()
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Case resolved successfully',
            case: updatedCase
        });
    } catch (error) {
        console.error('Error resolving case:', error);
        res.status(500).json({
            success: false,
            message: 'Error resolving case'
        });
    }
});

// User request case resolution
router.patch('/request-resolution/:caseId', protect, async (req, res) => {
    try {
        const { reason, foundLocation, foundDate } = req.body;
        const { caseId } = req.params;

        // Find the case and verify ownership
        const caseData = await Case.findOne({ 
            $or: [
                { _id: caseId },
                { caseId: caseId }
            ]
        });

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        // Check if user owns this case
        if (caseData.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only request resolution for your own cases'
            });
        }

        // Update case with resolution request
        const updatedCase = await Case.findByIdAndUpdate(
            caseData._id,
            {
                resolutionRequested: true,
                resolutionRequestDate: new Date(),
                resolutionRequestReason: reason || 'Person found',
                requestedFoundLocation: foundLocation,
                requestedFoundDate: foundDate ? new Date(foundDate) : new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Resolution request submitted successfully. An admin will review your request.',
            case: updatedCase
        });
    } catch (error) {
        console.error('Error requesting case resolution:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting resolution request'
        });
    }
});

// Test route to check if adminAuth middleware is working
router.get('/admin/test', adminAuth, async (req, res) => {
    try {
        console.log('🧪 Admin test route hit');
        console.log('User:', req.user);
        res.status(200).json({
            success: true,
            message: 'Admin auth working',
            user: {
                id: req.user?.id,
                email: req.user?.email,
                role: req.user?.role
            }
        });
    } catch (error) {
        console.error('Test route error:', error);
        res.status(500).json({
            success: false,
            message: 'Test route error',
            error: error.message
        });
    }
});

// Admin endpoint: Get cases by status (for admin approval workflow)
router.get('/admin/by-status', adminAuth(), async (req, res) => {
    try {
        console.log('📋 Admin by-status request received');
        console.log('Headers:', req.headers);
        console.log('Query params:', req.query);
        console.log('Admin user:', req.user);
        console.log('Admin user email:', req.user?.email);
        console.log('Admin user role:', req.user?.role);
        
        const { status } = req.query;
        
        let query = {};
        
        // If status is provided and not 'all', filter by status
        if (status && status !== 'all') {
            // Validate status
            const validStatuses = ['pending', 'approved', 'rejected', 'resolved'];
            if (!validStatuses.includes(status)) {
                console.log('❌ Invalid status provided:', status);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: pending, approved, rejected, resolved, all'
                });
            }
            query.status = status;
        }

        console.log('📊 Query being executed:', query);
        
        // First, let's check if there are any cases at all
        const totalCases = await Case.countDocuments();
        console.log('📊 Total cases in database:', totalCases);
        
        if (totalCases === 0) {
            console.log('⚠️ No cases found in database');
            return res.status(200).json({
                success: true,
                cases: [],
                message: 'No cases found in database'
            });
        }
        
        const cases = await Case.find(query)
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .select('-image -firReport'); // Exclude large base64 data for list view

        console.log('✅ Found cases:', cases.length);
        console.log('📋 Cases data:', cases.map(c => ({ id: c._id, name: c.name, status: c.status })));
        
        res.status(200).json({
            success: true,
            cases,
            total: totalCases,
            filtered: cases.length
        });
    } catch (error) {
        console.error('❌ Error fetching cases by status:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching cases',
            error: error.message
        });
    }
});

// Admin endpoint: Get case documents (FIR report or image) for verification
router.get('/admin/document/:caseId/:type', adminAuth(), async (req, res) => {
    try {
        const { caseId, type } = req.params;
        console.log('📄 Document request:', { caseId, type, adminId: req.user?.id });
        
        // Validate document type
        const validTypes = ['image', 'fir-report'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type. Must be "image" or "fir-report"'
            });
        }

        // Find the case
        const caseData = await Case.findOne({ 
            $or: [
                { _id: caseId },
                { caseId: caseId }
            ]
        });

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        // Get the requested document
        let documentData;
        let contentType;
        let filename;

        if (type === 'image') {
            documentData = caseData.image;
            filename = `case_${caseData.caseId || caseData._id}_photo`;
        } else if (type === 'fir-report') {
            documentData = caseData.firReport;
            filename = `case_${caseData.caseId || caseData._id}_fir_report`;
        }

        if (!documentData) {
            return res.status(404).json({
                success: false,
                message: `${type === 'image' ? 'Photo' : 'FIR report'} not found for this case`
            });
        }

        // Detect content type from data URL prefix or default to JPEG
        if (documentData.startsWith('data:image/png')) {
            contentType = 'image/png';
            filename += '.png';
        } else if (documentData.startsWith('data:image/gif')) {
            contentType = 'image/gif';
            filename += '.gif';
        } else if (documentData.startsWith('data:image/webp')) {
            contentType = 'image/webp';
            filename += '.webp';
        } else {
            // Default to JPEG for any other image or base64 without prefix
            contentType = 'image/jpeg';
            filename += '.jpg';
        }

        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        let base64Data = documentData;
        if (documentData.includes(',')) {
            base64Data = documentData.split(',')[1];
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Set appropriate headers
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${filename}"`,
            'Content-Length': buffer.length,
            'Cache-Control': 'private, no-cache'
        });

        res.send(buffer);
    } catch (error) {
        console.error('❌ Error serving document:', error);
        res.status(500).json({
            success: false,
            message: 'Error serving document',
            error: error.message
        });
    }
});

// Get a specific case by ID (MUST BE LAST - parameterized route)
router.get('/:caseId', protect, async (req, res) => {
    try {
        const { caseId } = req.params;
        
        const caseData = await Case.findOne({ 
            $or: [
                { _id: caseId },
                { caseId: caseId }
            ]
        }).populate('reportedBy', 'name email')
          .populate('approvedBy', 'name');

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        // Check if user has permission to view this case
        if (caseData.reportedBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            case: caseData
        });
    } catch (error) {
        console.error('Error fetching case:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching case details'
        });
    }
});

// Get case by name (for face recognition system)
router.get('/public/by-name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const case_ = await Case.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive exact match
            status: 'approved' 
        }).select('name contactNumber adhaarNumber image');

        if (!case_) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        res.status(200).json({
            success: true,
            name: case_.name,
            phonenumber: case_.contactNumber,
            adhaar_number: case_.adhaarNumber,
            image: case_.image
        });
    } catch (error) {
        console.error('Error fetching case by name:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching case by name'
        });
    }
});

module.exports = router;
