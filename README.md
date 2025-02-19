## Description

This is a NestJS RESTful service that addresses the issue of funds transfer.

### The task

> Develop a NestJS application with a single `user_balances` table in PostgreSQL.
> 
> - Use a seed migration to create two users with initial balances of `100` and `0`.
> - Implement a single endpoint that deducts a specified amount from the first user and adds it to the second user.
> - Provide a `docker-compose` file to run the application and a `curl` command to invoke the endpoint.

## How to run

```sh
# Clone the repo
git clone git@github.com:asidko/nestjs-banking-demo.git
# Open it
git cd nestjs-banking-demo
# Set environment variables (database name, password, etc.)
mv .env.template .env
# Run the service and db in docker-compose
docker-compose up -d database nestjs-banking-demo
# Run PostgresUI (optionally)
docker-compose up -d database-ui
```

* PGAdmin will be accessible on http://localhost:8082/ (no auth needed)

* The database migration will be applied automatically on the app start.

* Application is working on: http://localhost:3000

To **restart from scratch** and show application logs:

```sh
 docker-compose down && docker-compose up -d && docker-compose logs -f nestjs-banking-demo
 ```

## Testing

By the task definition there are 2 users:
* userId=1 has 100.00 USD on a balance
* userId=2 has 0 USD on a balance

### Transfer funds to a user

Transfer request:
```sh
curl -X POST 'http://localhost:3000/api/internal/v1/transfers' \
-H 'Content-Type: application/json' \
-d '{
    "senderId": 1,
    "receiverId": 2,
    "amount": "10.25",
    "currency": "USD"
  }'
```
Transfer response:
```json
{
    "senderId": 1,
    "receiverId": 2,
    "currency": "USD",
    "senderBalance": "89.75",
    "receiverBalance": "10.25"
}
```

Error case response example (insufficient funds)

```json
{
    "message": "Insufficient funds",
    "error": "Bad Request",
    "statusCode": 400
}
```

## Solution description

In this demo app we used **optimistic locking** approach by using a version column to detect if a record was modified concurrently.

Also we do not modify the balance directly and use transaction history instead, so the `user_balances` table looks like this:

<img width="661" alt="user_balances" src="https://github.com/user-attachments/assets/57b11d2e-76cb-453e-a42e-862e21cc7a3b" />

We store each transfer as either a DEBIT or CREDIT operation, with the amount represented as a whole number.

We’ve implemented a flexible interface for dynamic currency handling. It ensures consistent currency representation, validation, and conversion between display and database formats:

```ts
interface CurrencyProvider {
  getName(): string; // e.g., "USD"
  validateInputAmount(amount: string): boolean; // allow only two decimals
  convertAmountToInteger(amount: string): number; // e.g., "10.25" => 1025
  convertAmountToNormal(amount: number): string; // e.g., 1025 => "10.25"
}
```

## Project structure

In this project, we follow a “flat” structure by organizing related files into shared folders such as dto, entity, service, and controller. 
Such design promotes consistency and makes it easy to navigate the codebase without needing to understand intricate domain-specific details.