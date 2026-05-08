const Admission = require("../models/admission.model");

async function createAdmission(req, res){
    try {
        const admission = await Admission.create(req.body);
        res.status(201).json(admission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

async function getAdmissions(req, res){
    try {
        const data = await Admission.find({
            hospitalId: req.user.hospitalId
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {createAdmission, getAdmissions};