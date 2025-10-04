/ Admin endpoint: Get cases by status (for admin approval workflow)
router.get('/admin/by-status', adminAuth, async (req, res) => {
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