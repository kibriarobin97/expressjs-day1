import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { UserRole } from "../types";

const auth = (...roles: UserRole[]) => {
  
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(roles);
    try {
      // check if the token exists in the request header
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }

      // verify the token and extract the user data from it
      const decodedToken = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;
      // console.log(decodedToken);

      // check if the user exists in the database and is active
      const userData = await pool.query(
        `
      SELECT * FROM users WHERE email=$1 
      `,
        [decodedToken.email],
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      // check if the user is active
      if (!user?.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden!",
        });
      }

      if(roles.length && !roles.includes(user.role)){
        res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resource.",
        });
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
