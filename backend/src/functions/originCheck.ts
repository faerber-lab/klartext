import cors from 'cors';
import {NextFunction, Request, Response} from 'express';
const allowedOrigin = 'https://simplifymytext.org';

const policy = cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith(allowedOrigin) || origin.startsWith("http://localhost") || origin.startsWith("https://localhost")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
});

// Middleware to check the origin of incoming requests.
// Browsers omit Origin on same-origin GETs, so Referer is the fallback: the
// frontend is served from the same host as /api and would otherwise be denied.
function checkOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin || req.headers.referer;
  if (origin && ( origin.startsWith(allowedOrigin) || origin.startsWith("http://localhost") || origin.startsWith("https://localhost") ) ) {
      // Request is coming from the allowed frontend
      next();
  } else {
      // Reject request if it doesn't come from the allowed origin
      res.status(403).json({ message: 'Access denied: Requests from your origin are not allowed.' });
  }
}

export { policy, checkOrigin };
