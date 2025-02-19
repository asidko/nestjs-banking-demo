import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      migrations: ['src/database/migrations/*.js'],
      migrationsRun: true,
      synchronize: false, // using migrations instead
    }),
    TypeOrmModule.forFeature([]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }