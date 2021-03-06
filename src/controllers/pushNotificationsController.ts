import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { generateErrorJSON } from '../functions';
import { create, readAll } from '../models/pushNotificationsModel';
import validateToken from '../middlewares/validateToken';

const pushNotificationsController = Router();

pushNotificationsController.post('/', validateToken, async ({ body }: Request, res: Response) => {
  try {
    const createdToken = await create(body);
    return res.status(201).json(createdToken);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(generateErrorJSON(error.message));
  }
});

pushNotificationsController.get('/', async (req: Request, res: Response) => {
  try {
    const tokens = await readAll();
    return res.status(200).json(tokens);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(generateErrorJSON(error.message));
  }
});

pushNotificationsController.post('/send', async (req: Request, res: Response) => {
  if (!req.body.message || !req.body.token)
    return res.status(400).json(generateErrorJSON('Missing message or token for notification'));

  const title = req.body.title ?? '';

  const message = {
    token: req.body.token,
    notification: { title, body: req.body.message },
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json(generateErrorJSON(error.message));
  }
});

export default pushNotificationsController;
