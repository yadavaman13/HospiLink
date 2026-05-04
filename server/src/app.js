const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

//Require all routes
const authRoute = require('./routes/auth.route');

app.use('/api/auth', authRoute)






module.exports = app;