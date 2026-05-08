async function checkHospitalAccess(req, res, next){
    try {
        const hospitalId = req.user.hospitalId;

        // Super admin bypass
        if (req.user.role === "super_admin") {
            return next();
        }

        // Check if request matches user's hospital
        if (req.body.hospitalId && req.body.hospitalId !== hospitalId) {
            return res.status(403).json({ message: "Hospital access denied" });
        }

        next();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {checkHospitalAccess};