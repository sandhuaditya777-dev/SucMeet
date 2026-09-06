import { Router } from 'express';
import roomsRouter from './rooms.routes';
import usersRouter from './users.routes';
import invitationsRouter from './invitations.routes';
import webhooksRouter from './webhooks.routes';

export const router = Router();

router.use('/rooms', roomsRouter);
router.use('/users', usersRouter);
router.use('/invitations', invitationsRouter);
router.use('/webhooks', webhooksRouter);
