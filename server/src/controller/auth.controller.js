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
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(201).json({
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
    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(403).json({
            message: "token is not valid"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById({
        _id: decoded.id
    })

    res.status(200).json({
        message: "User fetched Successfully",
        user:{
            email: user.email,
            role: user.role,
            name: user.name,
            age: user.age
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
        res.status.json({
            message: "No user exists with this email"
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
        expiresIn: "7 d"
    })

    res.cookie("token", token)

    res.status(200).json({
        message: "User Logged In successfully",
        user: {
            email: user.email,
            role: user.role,
            name: user.firstname
        },
        token
    })
}


module.exports = {registerUser, getMe, loginUser};