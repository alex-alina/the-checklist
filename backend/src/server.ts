import 'reflect-metadata';
import { createApp } from './app';
import { AppDataSource } from './data-source';

const PORT = Number(process.env.PORT ?? 4000);

const start = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize data source', error);
    process.exit(1);
  }
};

start();
