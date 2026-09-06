import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';

// GET /api/v1/users/me
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: req.user });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/users/me
export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { displayName, language, timezone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: { displayName, language, timezone, avatar } },
      { new: true, runValidators: true }
    );
    res.json({ data: user, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}
