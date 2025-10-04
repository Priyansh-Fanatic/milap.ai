const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require('fs');
const location = require("../models/location");
const adminAuth = require('../middlewares/adminAuth');

// Compatibility endpoint for admin cases (redirects to new Case model)
router.get('/', adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        
        // If status is provided and not 'all', filter by status
        if (status && status !== 'all') {
            // Validate status
            const validStatuses = ['pending', 'approved', 'rejected', 'resolved'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: pending, approved, rejected, resolved, all'
                });
            }
            query.status = status;
        }

        const cases = await Case.find(query)
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .select('-image -firReport'); // Exclude large base64 data for list view

        res.status(200).json({
            success: true,
            cases
        });
    } catch (error) {
        console.error('Error fetching cases by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cases'
        });
    }
});

// Approve a case
router.patch('/approve/:id', adminAuth, async (req, res) => {
    try {
        const caseId = req.params.id;
        
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            { 
                status: 'approved',
                approvedBy: req.admin.id,
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

// Reject a case
router.patch('/reject/:id', adminAuth, async (req, res) => {
    try {
        const caseId = req.params.id;
        const { reason } = req.body;
        
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            { 
                status: 'rejected',
                rejectedBy: req.admin.id,
                rejectedAt: new Date(),
                rejectionReason: reason || 'No reason provided'
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

// Get all approved cases for public display
router.get('/approved', async (req, res) => {
    try {
        const cases = await Case.find({ status: 'approved' })
            .populate('reportedBy', 'name')
            .select('-firReport -adhaarNumber -reportedBy.email') // Exclude sensitive data
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            cases
        });
    } catch (error) {
        console.error('Error fetching approved cases:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching approved cases'
        });
    }
});

// Delete a case (admin only)
router.delete('/deletecase/:id', adminAuth, async (req, res) => {
    try {
        const caseId = req.params.id;
        
        const deletedCase = await Case.findByIdAndDelete(caseId);

        if (!deletedCase) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Case deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting case:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting case'
        });
    }
});

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    }
    , filename: function (req, file, cb) {
        const orifilename = file.originalname;

        var idx = -1;
        for (var i = 0; i < orifilename.length; i++) {
            if (orifilename[i] == '.') {
                idx = i;
            }
        }
        var str = orifilename.substring(idx);
        cb(null, req.body.name + "_" + req.body.adhaar_number + str)
    }
})

var upload = multer({
    storage: storage
}).single('image');

//ROUTE:1  : to add missing person
router.post("/addperson", upload, async (req, res) => {
    try {

        const { name, email, Gender, identification, nationality, height, date_missing, incident_place, incident_time, address, adhaar_number, phonenumber, casenumber, submittedby } = req.body;
        // console.log(req);
        console.log("Uploaded file:", req.file); // Log multer's file information

        // Read the file data *after* the upload is complete
        const imagePath = './uploads/' + req.file.filename;
        console.log("Attempting to read file:", imagePath); // Log the file path

        const imageBuffer = fs.readFileSync(imagePath); // Synchronous read for easier debugging
        console.log("Image buffer length:", imageBuffer.length); // Log the buffer length

        let newCase = new Case({
            name: name, 
            email: email, 
            gender: Gender, 
            identification: identification, 
            nationality: nationality, 
            height: height, 
            dateMissing: date_missing, 
            incidentPlace: incident_place, 
            incidentTime: incident_time, 
            address: address, 
            adhaarNumber: adhaar_number, 
            phoneNumber: phonenumber,
            submittedBy: submittedby || null,
            status: 'pending', // Set initial status as pending for admin approval
            image: {
                data: imageBuffer, // Use the buffer directly
                contentType: "image/png" // This might need to be dynamically determined
            }
        });
        const savedCase = await newCase.save();
        // console.log(savedCase)
        res.json(savedCase);
    } catch (error) {
        console.error("Error:", error); // General error logging
        res.status(500).send('some error occurred');
    }
})

//ROUTE: Get all approved cases for public display (replacing getallpersons)
router.get('/getallpersons', async (req, res) => {
    try {
        // Get all approved cases (public can only see approved cases)
        const approvedCases = await Case.find({ status: 'approved' })
            .populate('reportedBy', 'name')
            .select('-firReport -adhaarNumber -reportedBy.email') // Exclude sensitive data
            .sort({ createdAt: -1 });

        // Fetch the last location for each case
        const casesWithLocation = await Promise.all(
            approvedCases.map(async (caseItem) => {
                const lastLocation = await location.findOne({ adhaar_number: caseItem.adhaarNumber })
                    .sort({ date: -1 })
                    .limit(1);

                return {
                    ...caseItem.toObject(),
                    lastLocation: lastLocation ? lastLocation.toObject() : null,
                };
            })
        );

        res.json(casesWithLocation);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occurred');
    }
});

//ROUTE: Get case by adhaar number (replacing getallpersons/:id)
router.get("/getallpersons/:id", async (req, res) => {
    try {
        // Find cases with the provided adhaar number
        let cases = await Case.find({ adhaarNumber: req.params.id })
            .populate('reportedBy', 'name')
            .select('-firReport'); // Exclude large file data

        if (!cases || cases.length == 0) {
            res.status(404).send("Not Found");
        }

        res.status(200).send(cases);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('some error occurred');
    }
});

// ROUTE: Get case by name (replacing getpersonbyname)
router.get('/getpersonbyname', async (req, res) => {
    try {
        const name = req.query.name;
        const caseData = await Case.findOne({ 
            name: name, 
            status: 'approved' // Only return approved cases for public queries
        }).populate('reportedBy', 'name');

        if (!caseData) {
            return res.status(404).json({ error: "Case not found" });
        }

        res.json({
            phonenumber: caseData.contactNumber,
            adhaar_number: caseData.adhaarNumber,
            caseId: caseData.caseId,
            status: caseData.status
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
