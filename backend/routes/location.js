const express=require("express");
const router=express.Router();
const location=require("../models/location")
const mongoose=require("mongoose");


//ROUTE:1  : to add missing person location
router.post('/addlocation', async (req, res) => {
    try {
        const { name, adhaar_number, continent_code, region, latitude, longitude, ip, city, timezone, organization_name, country, asn, organization, area_code, accuracy, country_code3, country_code, date } = req.body;

        // Check if a location entry already exists for the given adhaar_number
        let existingLocation = await location.findOne({ adhaar_number: adhaar_number });

        if (existingLocation) {
            // Update the existing location entry
            existingLocation.name = name;
            existingLocation.continent_code = continent_code;
            existingLocation.region = region;
            existingLocation.latitude = latitude;
            existingLocation.longitude = longitude;
            existingLocation.ip = ip;
            existingLocation.city = city;
            existingLocation.timezone = timezone;
            existingLocation.organization_name = organization_name;
            existingLocation.country = country;
            existingLocation.asn = asn;
            existingLocation.organization = organization;
            existingLocation.area_code = area_code;
            existingLocation.accuracy = accuracy;
            existingLocation.country_code3 = country_code3;
            existingLocation.country_code = country_code;
            // Update the date field explicitly
            existingLocation.date = date || new Date();

            await existingLocation.save();
            console.log("Updated location:", existingLocation);
            res.json({ message: "Location updated successfully", location: existingLocation });
        } else {
            // Create a new location entry
            const newLocation = new location({
                name: name,
                adhaar_number: adhaar_number,
                continent_code: continent_code,
                region: region,
                latitude: latitude,
                longitude: longitude,
                ip: ip,
                city: city,
                timezone: timezone,
                organization_name: organization_name,
                country: country,
                asn: asn,
                organization: organization,
                area_code: area_code,
                accuracy: accuracy,
                country_code3: country_code3,
                country_code: country_code,
                date: date || new Date()
            });

            const savedLocation = await newLocation.save();
            console.log("Saved location:", savedLocation);
            res.status(201).json({ message: "Location added successfully", location: savedLocation });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occurred');
    }
});
//ROUTE:2  : to get info of locations 

router.get("/getalllocations/",async (req,res)=>{
    try {
        const locations=await location.find()
    res.json(locations); 
    } catch (error) {
        console.error(error.message);
        res.status(500).send('some error occured');
    }
  
})

//route:3 Find the last location entry for the given adhaar_number, sorted by date in descending order

router.get('/getlastlocation/:adhaar_number', async (req, res) => {
  try {
    const adhaarNumber = req.params.adhaar_number;

    console.log(`Looking for latest location for adhaar number: ${adhaarNumber}`);
    
    // Find all entries and show them for debugging
    const allLocations = await location.find({ adhaar_number: adhaarNumber }).sort({ date: -1 });
    console.log(`Found ${allLocations.length} location entries for ${adhaarNumber}`);
    
    if (allLocations.length > 0) {
      console.log(`Latest location entry: ${JSON.stringify(allLocations[0])}`);
    }

    const lastLocation = await location.findOne({ adhaar_number: adhaarNumber })
      .sort({ date: -1 }); // Sort by date in descending order
      
    if(!lastLocation){
      return res.status(404).json({"message":"not found"})
    }

    res.json(lastLocation);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Some error occurred');
  }
});

//route:4 Update location by adhaar_number with explicit date update
router.put('/updatelocation/:adhaar_number', async (req, res) => {
  try {
    const adhaarNumber = req.params.adhaar_number;
    const updateData = req.body;
    
    // Ensure the date is updated
    if (!updateData.date) {
      updateData.date = new Date();
    }
    
    const options = { new: true }; // Return the updated document
    
    const updatedLocation = await location.findOneAndUpdate(
      { adhaar_number: adhaarNumber },
      updateData,
      options
    );
    
    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found for this Aadhaar number" });
    }
    
    console.log("Updated location via PUT:", updatedLocation);
    res.json({ message: "Location updated successfully", location: updatedLocation });
    
  } catch (error) {
    console.error("Error updating location:", error.message);
    res.status(500).send('Some error occurred while updating the location');
  }
});

//route:5 Update location record for an existing person
router.post('/addlocationhistory', async (req, res) => {
  try {
    console.log("Received location data:", JSON.stringify(req.body, null, 2));
    
    if (!req.body.adhaar_number) {
      return res.status(400).json({ error: "adhaar_number is required" });
    }
    
    // Process incoming data to ensure correct types
    const locationData = {
      ...req.body,
      // Convert numeric string values to actual numbers
      asn: req.body.asn ? Number(req.body.asn) : 0,
      accuracy: req.body.accuracy ? Number(req.body.accuracy) : 0
    };
    
    // Always override with current server date - ignore client date
    locationData.date = new Date();
    console.log("Setting date to:", locationData.date);
    
    // Find and update existing record instead of creating a new one
    const filter = { adhaar_number: locationData.adhaar_number };
    const update = locationData;
    const options = { 
      new: true,  // Return updated document
      upsert: true // Create if it doesn't exist
    };
    
    console.log("Updating location for:", filter);
    
    try {
      const updatedLocation = await location.findOneAndUpdate(filter, update, options);
      console.log("Updated location:", updatedLocation);
      res.status(200).json({ 
        message: "Location updated successfully", 
        location: updatedLocation 
      });
    } catch (saveError) {
      console.error("Failed to update location:", saveError);
      res.status(500).json({ 
        error: "Failed to update location", 
        details: saveError.message
      });
    }
    
  } catch (error) {
    console.error("Error in addlocationhistory:", error);
    res.status(500).json({
      error: "Some error occurred while updating location",
      message: error.message
    });
  }
});

//route:6 Diagnostic route to test date storage
router.get('/testdate', async (req, res) => {
  try {
    // Create a test document with current date
    const testDoc = new location({
      name: "TestUser",
      adhaar_number: "test" + Date.now(), // Unique test ID
      city: "TestCity",
      date: new Date() // Current date
    });
    
    // Save to database
    const savedDoc = await testDoc.save();
    console.log("Test document saved with date:", savedDoc.date);
    
    // Retrieve from database
    const retrievedDoc = await location.findById(savedDoc._id);
    console.log("Retrieved document date:", retrievedDoc.date);
    
    res.json({
      original: savedDoc,
      retrieved: retrievedDoc,
      currentServerTime: new Date(),
      dateMatches: savedDoc.date.getTime() === retrievedDoc.date.getTime()
    });
  } catch (error) {
    console.error("Error in date test:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports=router;
