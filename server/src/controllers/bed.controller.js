const Bed = require("../models/bed.model");

async function getBeds(req, res){
    try {
        const beds = await Bed.find({
            hospitalId: req.user.hospitalId
        });
        res.json(beds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

async function updateBedStatus(req, res){
    try {
        const bed = await Bed.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(bed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {getBeds, updateBedStatus};