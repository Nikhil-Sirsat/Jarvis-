import joi from "joi";

// user schema
export const userSchema = joi.object({
    name: joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    age: joi.number().min(10).required(),
    password: joi.string().min(5).max(20)
        .pattern(new RegExp(/^[a-zA-Z0-9@#$%^&*()_+!~\-]{5,20}$/))
        .required(),
});