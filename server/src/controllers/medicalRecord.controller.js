const MedicalRecord = require("../models/medicalRecord.model");

async function createRecord(req, res){
    try {
        const record = await MedicalRecord.create(req.body);
        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

async function getRecords(req, res){
    try {
        const records = await MedicalRecord.find({
            patientId: req.user._id
        });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {createRecord, getRecords}