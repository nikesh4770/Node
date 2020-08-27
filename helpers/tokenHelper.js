const redis = require('./redisHelper');
const token = require('jsonwebtoken');
const httpError = require('http-errors');
const createHttpError = require('http-errors');
const Joi = require('@hapi/joi');
const { use } = require('../routes/authRoutes');

module.exports = {
    
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
             const payload = {
                iss: "nikeshauth2.com"
             }
             const secret = process.env.ACCESS_TOKEN_SECRET;
             const object = {
                 expiresIn: '5m',
                 audience : userId
             }

            token.sign(payload, secret, object, (err, data ) => {
                if(err) {
                    console.log(err.message);
                    reject(createHttpError.InternalServerError("Internal server error"));
                } 
                resolve(data);
            });
        });
    },

    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']) {
            return next(createHttpError.Unauthorized())
        }

        const reqHeader = req.headers['authorization'];
        const bearerToken = reqHeader.split(' ');
        const accessToken = bearerToken[1];
        token.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err){
                const msg = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createHttpError.Unauthorized(msg));
            }

            req.payload = payload;
            next();
        });
    },

    //------------------------------------------------------------------ 
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
             const payload = {
                iss: "nikeshauth2.com"
             }
             const secret = process.env.REFRESH_TOKEN_SECRET;
             const options = {
                 expiresIn: '15m',
                 audience : userId
             }

            token.sign(payload, secret, options, (err, data ) => {
                if(err) {
                    console.log(err.message);
                    reject(createHttpError.InternalServerError());
                } 
                redis.set(userId, data, 'EX', 15 * 60, (err, reply) =>{
                    if(err){
                        console.error(err);
                        reject(createHttpError.InternalServerError())
                    }
                    resolve(data);
                })
            });
        });
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            
            token.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
                (err, payload) =>{
                    if(err){
                        return reject(createHttpError.Unauthorized());
                    }

                    const userId = payload.aud;

                    redis.GET(userId, (err, result) => {
                        if(err){
                            reject(createHttpError.InternalServerError());
                            return
                        }

                        if(refreshToken === result){
                                return resolve(userId);
                        }

                        reject(createHttpError.Unauthorized())
                    })

                    
                });
        });
    }
}