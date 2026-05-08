const Appointment = require("../models/appointment.model");

async function createAppointment(req, res){
    try {
        const appointment = await Appointment.create(req.body);
        res.status(201).json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

async function getAppointments(req, res){
    try {
        const appointments = await Appointment.find({
            hospitalId: req.user.hospitalId
        }).sort({ "aiAnalysis.priorityScore": -1 });

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {createAppointment, getAppointments};