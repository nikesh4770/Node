const { Router } = require('express');
const router = Router();
const createHttpError = require('http-errors');
const User = require('../models/userModel');
const { authRegisterSchema } = require('../helpers/validatorHelper');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/tokenHelper');
const redis = require('../helpers/redisHelper');

router.post('/auth/register', async (req, res, next)=>{
    console.log(req.body);
    // res.send('register path');

    try {

        const result = await authRegisterSchema.validateAsync(req.body);
        console.log(result);

        const isPresent = await User.findOne({email: result.email});
        if(isPresent) throw createHttpError.Conflict('User is already registered. Please sign in.')

        const user = new User(result);
        const savedUser = await user.save();

        const accessToken = await signAccessToken(savedUser.id);
        const refreshToken = await signRefreshToken(savedUser.id);
        res.send({ 
            accessToken, refreshToken,
            expiresInMillis: 300 * 1000
        });

    } catch (err) {
        
        if(err.isJoi === true){
            err.status = 422;
        }

        next(err);
    }
});

router.post('/auth/login', async (req, res, next)=>{
    
    try {
        const result = await authRegisterSchema.validateAsync(req.body);

        const user = await User.findOne({email: result.email});

        if(!user){
            throw createHttpError.NotFound("User is not registered.")
        }

        const isRightCred = await user.isValidPassword(result.password);

        if(!isRightCred){
            throw createHttpError.Unauthorized('Username/Password is incorrect.');
        }

        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);
        res.send({
            accessToken, refreshToken,
            expiresInMillis: 300 * 1000
        });
    } catch (err) {
        if(err.isJoi === true){
            return next(createHttpError.BadRequest("Invalid username or password."));
        }
        next(err);
    }
});

router.post('/auth/refresh-token', async (req, res, next)=>{
    try {
        const { refreshToken } = req.body
        if(!refreshToken) throw createHttpError.BadRequest();

        const userId = await verifyRefreshToken(refreshToken);
        // res.send('error debug');

        const accessToken = await signAccessToken(userId);
        const refToken = await signRefreshToken(userId);
        res.send({
            accessToken: accessToken, 
            refreshToken: refToken, 
            expiresInMillis: 300*1000
        })
   
    }catch(err) {
        console.log('------> 1', err.message);
        next(err)
    }
});

router.delete('/auth/logout', async (req, res, next)=>{
    try {
        const { refreshToken } = req.body

        if(!refreshToken) throw createHttpError.BadRequest()

        const userId = await verifyRefreshToken(refreshToken);
        redis.DEL(userId, (err, val) =>{
            if(err){
                throw createHttpError.InternalServerError();
            }

            res.status = 204;
            res.send({success: true, msg : 'Logged out!'});
        });

    } catch(err) {
        next(err)
    }
});

module.exports = router;