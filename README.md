# Restaurant Database Management System

This project implements a Restaurant Database Management System with a RESTful API, enabling efficient management of customers, reservations, tables, and orders.

## Features

- **Customer Management**: Add, update, retrieve, and delete customer records.
- **Reservation Management**: Create, update, retrieve, and cancel reservations.
- **Table Management**: Manage table information including availability and capacity.
- **Order Management**: Place, update, retrieve, and delete orders associated with customers and tables.

## Database Schema

### Customer
- `id` (UUID, Primary Key)
- `name` (String)
- `contactNumber` (String, Unique)
- `email` (String, Unique)

### Reservation
- `id` (UUID, Primary Key)
- `customerId` (UUID, Foreign Key referencing Customer)
- `tableId` (UUID, Foreign Key referencing Table)
- `reservationTime` (DateTime)
- `status` (Enum: PENDING, CONFIRMED, CANCELLED)

### Table
- `id` (UUID, Primary Key)
- `tableNumber` (Integer, Unique)
- `capacity` (Integer)
- `status` (Enum: AVAILABLE, OCCUPIED, RESERVED)

### Order
- `id` (UUID, Primary Key)
- `customerId` (UUID, Foreign Key referencing Customer)
- `tableId` (UUID, Foreign Key referencing Table)
- `orderTime` (DateTime)
- `totalAmount` (Decimal)

## API Endpoints

### Customers
- `GET /customers` - Retrieve all customers.
- `POST /customers` - Create a new customer. Ensures no duplicates based on `contactNumber` or `email`.
- `PATCH /customers/:customerId` - Update details of a customer by their ID.
- `DELETE /customers/:customerId` - Delete a customer by their ID.

### Reservations
- `GET /reservations` - Retrieve all reservations.
- `POST /reservations` - Create a new reservation. Ensures the table is available at the desired time.
- `PATCH /reservations/:reservationId` - Update details of a reservation by its ID.
- `DELETE /reservations/:reservationId` - Cancel a reservation by its ID.

### Tables
- `GET /tables` - Retrieve all tables.
- `POST /tables` - Add a new table. Ensures no duplicates based on `tableNumber`.
- `PATCH /tables/:tableId` - Update details of a table by its ID.
- `DELETE /tables/:tableId` - Delete a table by its ID.

### Orders
- `GET /orders` - Retrieve all orders.
- `POST /orders` - Place a new order. Associates the order with a customer and a table.
- `PATCH /orders/:orderId` - Update details of an order by its ID.
- `DELETE /orders/:orderId` - Delete an order by its ID.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [Neon.tech](https://neon.tech/) (Managed PostgreSQL database)
- [Prisma](https://www.prisma.io/) (Database ORM)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mohankrishna0418/nitrogen.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd nitrogen
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up the database**:
   - Create a database on [Neon.tech](https://neon.tech/).
   - Update the database connection URL in `.env`:
     ```env
     DATABASE_URL="your_neon_database_url"
     ```
   - Run the Prisma migration to set up the database schema:
     ```bash
     npx prisma migrate dev --name "init"
     ```

5. **Start the server**:
   ```bash
   npm run dev
   ```
   The server should now be running at `http://localhost:3000`.

## Technologies Used
- **Backend**: Node.js with Hono
- **Database ORM**: Prisma
- **Database**: Neon.tech (Managed PostgreSQL)
- **Language**: TypeScript

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

## Acknowledgements
Special thanks to all contributors and the open-source community for their invaluable support and resources.

