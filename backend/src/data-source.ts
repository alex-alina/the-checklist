import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import { join } from 'node:path';
import { Checklist } from './entities/Checklist';
import { Item } from './entities/Item';

const envPath = join(process.cwd(), '../.env');

dotenv.config({ path: envPath });

const isTestEnvironment = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';

const sqliteOptions: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [Checklist, Item]
};

const postgresOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: isDevelopment || isTestEnvironment,
  logging: isDevelopment,
  entities: [Checklist, Item],
  migrations: ['./dist/migrations/*.js']
};

export const AppDataSource = new DataSource(isTestEnvironment ? sqliteOptions : postgresOptions);
