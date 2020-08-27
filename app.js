require('./helpers/redisHelper');
const express = require('express');
const morgan = require('morgan');
const httpErrors = require('http-errors');
const createHttpError = require('http-errors');
const { NotFound } = require('http-errors');
const authRoute = require('./routes/authRoutes');
const { verifyAccessToken } = require('./helpers/tokenHelper');


require('dotenv').config();
require('./helpers/mongoDBHelper');

const app = express();

// Setup middleware
app.use(express.urlencoded({ extended : true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', verifyAccessToken, async(req, res) => {
    res.send('Hello OAuth');
});

app.use(authRoute);


app.use(async(req, res, next) => {
    next(createHttpError.NotFound())
});

app.use((err, req, res, next) =>{
    res.status(err.status || 500);
    res.send({
        error : {
            code : err.status || 500,
            msg: err.message
        }
    });

    next();
});

app.listen(process.env.PORT, () =>{
    console.log(`Server started on port ${process.env.PORT}`);
});