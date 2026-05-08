const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//Require all routes
const authRoute = require('./routes/auth.route');
const hospitalRoute = require('./routes/hospital.route');
const appointmentRoute = require('./routes/appointment.route');
const doctorRoute = require('./routes/doctor.route');

app.use('/api/auth', authRoute);
app.use('/api/hospitals', hospitalRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/doctors', doctorRoute);

module.exports = app;