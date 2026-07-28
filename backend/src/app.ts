import express, {Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { policy, checkOrigin } from './functions/originCheck';

// routes
import {wordInfoRouter} from '../routes/GET/wordinfo';
import {defaultRouter} from '../routes/GET/landing';
import {setCookieRouter} from '../routes/GET/setcoookie';
import {simplifyRouter} from '../routes/POST/simplify';
import {feedbackRouter} from '../routes/POST/feedback';

dotenv.config();

const app = express();
const port = 7171;
const deploy = process.env.NODE_ENV === "deploy";
const sk = process.env.SK || "error";

// middleware
app.set('trust proxy', true); // Trust the first proxy
app.use(cookieParser(sk));
app.use(policy);
app.use(checkOrigin)
app.use(express.json());

// simplify text route
app.post('/simplify', simplifyRouter);
// Feedback
app.post('/feedback', feedbackRouter);
// default route
app.get('/', defaultRouter);
// word info route
app.get('/word-info', wordInfoRouter);
// set cookie route
app.get('/set-cookie', setCookieRouter);

if (deploy){
  // nginx terminates TLS and proxies /api here, so this process speaks plain
  // HTTP. Binding to loopback keeps it off the public interface.
  app.listen(port, '127.0.0.1', () => {
    console.log(`Backend listening at http://127.0.0.1:${port}`);
  });
} else {
  app.listen(port, ()=>{
    console.log(`Backend listening at http://localhost:${port}`);
  })
}

export default app;