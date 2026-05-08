const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config');

async function registerUser(req,res){

    const { hospitalId, role, email, password, firstName, lastName, phone, gender, age, bloodGroup, address } = req.body;

    if(!email || !password){
        return res.status(400).json({ 
            message: "Email and Password required to register" 
        });
    }

    const userAlreadyExists = await userModel.findOne({ email });

    if(userAlreadyExists){
        return res.status(409).json({ 
            message: "User already exists with same email" 
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        hospitalId,
        role: role || 'patient',
        email,
        password: hashedPassword,
        profile: {
            firstName,
            lastName,
            phone,
            gender,
            age,
            bloodGroup,
            address
        }
    });

    const token = jwt.sign({ 
        id: user._id 
    }, config.JWT_SECRET, 
    { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        message: "User Registered Successfully",
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile
        },
        token
    });
}

async function getMe(req,res){
    const user = await userModel.findById(req.user._id).select("-password");

    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    res.status(200).json({
        message: "User fetched Successfully",
        user:{
            email: user.email,
            role: user.role,
            profile: user.profile,
            hospitalId: user.hospitalId,
            status: user.status
        }
    })
}

async function loginUser(req,res){
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: "Email and Password both are required"
        })
    }

    const user = await userModel.findOne({
        email
    })

    if(!user){
        return res.status(404).json({
            message: "No user exists with this email"
        })
    }

    if (user.status !== 'active') {
        return res.status(403).json({
            message: 'Account is inactive or pending approval'
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,{
        expiresIn: "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "User Logged In successfully",
        user: {
            email: user.email,
            role: user.role,
            profile: user.profile,
            hospitalId: user.hospitalId
        },
        token
    })
}

async function logoutUser(req,res) {
    res.clearCookie("token")

    res.status(200).json({
        message: "Logout Successfull"
    })
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


module.exports = {registerUser, getMe, loginUser, logoutUser, changePassword};