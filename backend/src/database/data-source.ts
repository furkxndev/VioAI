import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { configuration } from '../config/configuration';

loadEnv();

const { database } = configuration();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: database.host,
  port: database.port,
  username: database.username,
  password: database.password,
  database: database.name,
  ssl: database.ssl ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: database.logging,
  entities: [__dirname + '/../modules/**/entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'vioai_migrations',
};

export default new DataSource(dataSourceOptions);
