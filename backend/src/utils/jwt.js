import jwt from "jsonwebtoken"
import {env} from "../config/env.js"
/**
 * Tao JWT Access Token
 * payload - "dữ liệu cốt lõi" được vận chuyển
 * @param {Object} payload (userId, role) gan vao token
 * @returns {String}
 */

export const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "7d"
    })
}

/**
 * @param {String} Token JWT token can giai ma
 * @returns {Object} payload da giai ma
 * @throws {Error} token ko hop le
 */
export const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
}