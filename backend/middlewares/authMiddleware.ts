import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    user_id: string;
    user_type: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export function verifyToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {

    const authHeader = req.headers.authorization;

    // ไม่มี Authorization Header
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    // รูปแบบต้องเป็น "Bearer xxxxx"
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        req.user = decoded;

        next();

    } catch {

        return res.status(401).json({
            success: false,
            message: "Token expired or invalid"
        });
    }

}

export function optionalVerifyToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    try {
        const token = authHeader.split(" ")[1];

        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

    } catch {
        // Token ไม่ถูกต้องก็ปล่อยผ่านในฐานะ Guest
    }

    next();
}