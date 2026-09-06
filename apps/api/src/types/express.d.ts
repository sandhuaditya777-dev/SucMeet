import { IUser } from '../models/User.model';
import { IRoom } from '../models/Room.model';
import { Role } from '@sucmeet/shared';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      room?: IRoom;
      roomRole?: Role;
    }
  }
}
