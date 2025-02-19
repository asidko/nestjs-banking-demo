import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { TransferController } from './controller/transfer.controller';
import { TransferService } from './service/transfer.service';
import { CURRENCY_PROVIDERS, USDCurrencyProvider } from './service/currency-provider';
import { UserBalanceRepository } from './repository/user-balance.repository';
import { UserBalance } from './entity/user-balance.entity';

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
      entities: [UserBalance],
    }),
    TypeOrmModule.forFeature([UserBalance]),
  ],
  controllers: [TransferController],
  providers: [
    TransferService,
     USDCurrencyProvider,
      UserBalanceRepository,
      {
        provide: CURRENCY_PROVIDERS,
        useFactory: (...instances) => instances,
        inject: [USDCurrencyProvider]
      }
    
    ],
})
export class AppModule { }