const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//Require all routes
const authRoute = require('./routes/auth.route');
const hospitalRoute = require('./routes/hospital.route');
const appointmentRoute = require('./routes/appointment.route');
const doctorRoute = require('./routes/doctor.route');
const demoRoute = require('./routes/demo.route');
const superAdminRoute = require('./routes/superAdmin.route');

app.use('/api/auth', authRoute);
app.use('/api/hospitals', hospitalRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/doctors', doctorRoute);
app.use('/api/demo', demoRoute);
app.use('/api/super-admin', superAdminRoute);

module.exports = app;