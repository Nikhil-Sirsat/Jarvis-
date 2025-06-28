import { userSchema } from "../SchemaValidation/Schema.js";
import ExpressError from "../Utils/ExpressError.js";

export const validateUser = async (req, res, next) => {
    const userData = {
        ...req.body,
    };

    let { error } = userSchema.validate(userData);
    if (error) {
        throw new ExpressError(400, `Validation error: ${error.details[0].message}`);
    } else {
        next();
    }
}