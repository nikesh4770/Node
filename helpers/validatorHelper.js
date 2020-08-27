const Joi = require('@hapi/joi');

const authRegisterSchema = Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().required().min(6)
});

module.exports = {
    authRegisterSchema
}