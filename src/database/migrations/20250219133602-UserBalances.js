import { Table, TableUnique } from 'typeorm';

export default class UserBalances20250219133602 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'user_balances',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'version',
            type: 'int',
          },
          {
            name: 'event_type',
            type: 'varchar', // 'DEBIT' or 'CREDIT'
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'bigint', // stored in cents for USD
            default: '0',
          },
          {
            name: 'source_id',
            type: 'int',
            default: '0', // 0 indicates system-generated initial balance, otherwise userId who send the funds
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Enforce unique version per user currency
    await queryRunner.createUniqueConstraint(
      'user_balances',
      new TableUnique({
        name: 'uq_user_version',
        columnNames: ['user_id', 'version', 'currency'],
      }),
    );

    // For user_id 1, initial CREDIT of 100 (10000 cents) with currency USD.
    await queryRunner.query(
      `INSERT INTO user_balances (user_id, version, event_type, amount, source_id, currency) VALUES (1, 1, 'CREDIT', 10000, 0, 'USD')`
    );
    // For user_id 2, initial CREDIT of 0 (0 cents) with currency USD.
    await queryRunner.query(
      `INSERT INTO user_balances (user_id, version, event_type, amount, source_id, currency) VALUES (2, 1, 'CREDIT', 0, 0, 'USD')`
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('user_balances');
  }
};