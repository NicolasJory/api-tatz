const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

const userRoutes = require('./api/routes/users');
const artistRoutes = require('./api/routes/artists')
const publicationsRoutes = require('./api/routes/publications')
const mediasRoutes = require('./api/routes/medias');

mongoose.connect(
    'mongodb+srv://admin-tatz:'+process.env.MONGO_ATLAS_PW +'@db-tatz.mu9uv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//Routes for handling requests
app.use('/users', userRoutes);
app.use('/artists', artistRoutes);
app.use('/publications', publicationsRoutes);
app.use('/medias',mediasRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports = app;