import { userSchema } from "../SchemaValidation/Schema.js";

export const validateUser = async (req, res, next) => {
    const userData = {
        ...req.body,
    };

    let { error } = userSchema.validate(userData);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        next();
    }
}