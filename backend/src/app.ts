import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import checklistRoutes from './routes/checklists';
import itemRoutes from './routes/items';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/checklists', checklistRoutes);
  app.use('/items', itemRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
};
