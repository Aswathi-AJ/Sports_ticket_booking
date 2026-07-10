# Sports Ticket Booking System

A simple web application for booking sports event tickets, built as a DBMS mini-project.

## Features

- View available sports events
- Add new events (admin functionality)
- Book tickets for events
- Manage events (update/delete)
- MySQL database integration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript
- **Dependencies**: body-parser, cors, mysql

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sports-ticket-booking.git
   cd sports-ticket-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the MySQL database:
   - Create a database named `Miniproj_Sports`
   - Create the following tables:

   ```sql
   CREATE TABLE Event (
       EventID INT AUTO_INCREMENT PRIMARY KEY,
       EventName VARCHAR(255) NOT NULL,
       Venue VARCHAR(255) NOT NULL,
       EventDate DATETIME NOT NULL
   );

   CREATE TABLE Ticket (
       TicketID INT AUTO_INCREMENT PRIMARY KEY,
       EventID INT,
       SeatNumber VARCHAR(50),
       Price DECIMAL(10,2),
       BookingStatus VARCHAR(50) DEFAULT 'Available',
       FOREIGN KEY (EventID) REFERENCES Event(EventID)
   );
   ```

4. Update the database credentials in `server.js`:
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'your-username',
       password: 'your-password',
       database: 'Miniproj_Sports'
   });
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. View events, add new events, and book tickets through the web interface.

## API Endpoints

- `GET /events` - Get all events
- `POST /events` - Add a new event
- `PUT /events/:id` - Update an event
- `DELETE /events/:id` - Delete an event
- `GET /tickets/:eventId` - Get tickets for an event
- `POST /tickets` - Book a ticket

## Project Structure

```
sports-ticket-booking/
├── server.js          # Express server and API routes
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML page
│   ├── style.css      # Stylesheet
│   └── script.js      # Frontend JavaScript
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.