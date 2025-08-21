import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

const signToken = (id: string): string => {
  const secret = (config.jwtSecret || 'dev_secret') as jwt.Secret;
  const options: jwt.SignOptions = { expiresIn: (config.jwtExpiresIn || '7d') as any };
  return jwt.sign({ id }, secret, options);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'Email already in use');
    }

    // Create new user
    const user = await User.create({
      email,
      password
    });

    // Generate token
    const token = signToken(user._id);

    // Remove password from output
    (user as any).password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      throw new AppError(400, 'Please provide email and password');
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError(401, 'Incorrect email or password');
    }

    // Generate token
    const token = signToken(user._id);

    // Remove password from output
    (user as any).password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Remove password from output
    (user as any).password = undefined;

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferredLanguage } = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredLanguage },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Remove password from output
    (user as any).password = undefined;

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}; 