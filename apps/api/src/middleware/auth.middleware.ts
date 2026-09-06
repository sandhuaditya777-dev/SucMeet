import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import axios from 'axios';
import { User } from '../models/User.model';
import { UnauthorizedError } from '../lib/errors';
import { logger } from '../lib/logger';

// ─── Lazy JWT Validator ────────────────────────────────────────────────────────
let _jwtMiddleware: ReturnType<typeof auth> | null = null;

function getJwtMiddleware() {
  if (!_jwtMiddleware) {
    const audience = process.env.AUTH0_AUDIENCE;
    const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;

    if (!audience || !issuerBaseURL) {
      throw new Error(
        `Missing Auth0 env vars. Got:\n  AUTH0_AUDIENCE=${audience}\n  AUTH0_ISSUER_BASE_URL=${issuerBaseURL}\n\nCheck your apps/api/.env file.`
      );
    }

    _jwtMiddleware = auth({ audience, issuerBaseURL });
  }
  return _jwtMiddleware;
}

export const validateJwt = (req: Request, res: Response, next: NextFunction) => {
  getJwtMiddleware()(req, res, next);
};

// ─── Attach User to Request ────────────────────────────────────────────────────
export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      next(new UnauthorizedError('No user identity found in token'));
      return;
    }

    let user = await User.findOne({ auth0Id });

    if (!user) {
      let email =
        (req.auth?.payload['https://sucmeet.com/email'] as string) ||
        (req.auth?.payload.email as string) ||
        '';
      let displayName =
        (req.auth?.payload['https://sucmeet.com/name'] as string) ||
        (req.auth?.payload.name as string) ||
        '';
      let avatar = req.auth?.payload.picture as string | undefined;

      // If email or displayName is missing from JWT payload, fetch from Auth0 /userinfo
      if (!email || !displayName) {
        try {
          const issuer = process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '');
          if (issuer && req.headers.authorization) {
            const userInfoRes = await axios.get(`${issuer}/userinfo`, {
              headers: { Authorization: req.headers.authorization },
            });
            if (userInfoRes.data) {
              email = email || userInfoRes.data.email || '';
              displayName =
                displayName ||
                userInfoRes.data.name ||
                userInfoRes.data.nickname ||
                '';
              avatar = avatar || userInfoRes.data.picture;
            }
          }
        } catch (fetchErr) {
          logger.warn(`Could not fetch /userinfo for ${auth0Id}: ${fetchErr}`);
        }
      }

      // Safe fallbacks to satisfy schema requirements
      if (!email) {
        const sanitizedId = auth0Id.replace(/[^a-zA-Z0-9]/g, '_');
        email = `${sanitizedId}@user.sucmeet.com`;
      }
      if (!displayName) {
        displayName = email.split('@')[0] || 'User';
      }

      user = await User.create({ auth0Id, email, displayName, avatar });
      logger.info(`New user created: ${user.id} (${email})`);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// ─── Combined: require auth + attach user ──────────────────────────────────────
export const requireAuth = [validateJwt, attachUser];
