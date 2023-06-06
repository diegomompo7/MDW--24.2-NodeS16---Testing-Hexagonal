import { type NextFunction, type Response } from "express";
import { User } from "../models/mongo/User";
import { verifyToken } from "../utils/token";

export const isAuth = async (req: any, res: Response, next: NextFunction): Promise<null> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("No tienes autorización para realizar esta operación");
    }

    // Descodificamos el token
    const decodedInfo = verifyToken(token);
    const user = await User.findOne({ email: decodedInfo.userEmail }).select("+password");
    if (!user) {
      throw new Error("No tienes autorización para realizar esta operación");
    }

    req.user = user;
    next();

    return null;
  } catch (error) {
    res.status(401).json({ error: "No tienes autorización para realizar esta operación" })
    console.log(error);
    return null;
  }
};

module.exports = { isAuth };
