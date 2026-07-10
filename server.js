const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', // Your MySQL username
    password: process.env.DB_PASSWORD || '0022', // Your MySQL password
    database: process.env.DB_NAME || 'Miniproj_Sports'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }
    console.log('MySQL connected...');
});

// API endpoint to get all events
app.get('/events', (req, res) => {
    const query = 'SELECT * FROM Event';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json(results);
    });
});

// API endpoint to add a new event
app.post('/events', (req, res) => {
    const { eventName, venue, eventDate } = req.body;
    const query = 'INSERT INTO Event (EventName, Venue, EventDate) VALUES (?, ?, ?)';
    
    db.query(query, [eventName, venue, eventDate], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json({ message: 'Event added successfully!', eventId: result.insertId });
    });
});

// API endpoint to update an event
app.put('/events/:id', (req, res) => {
    const { id } = req.params;
    const { eventName, venue, eventDate } = req.body;
    const query = 'UPDATE Event SET EventName = ?, Venue = ?, EventDate = ? WHERE EventID = ?';
    
    db.query(query, [eventName, venue, eventDate, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json({ message: 'Event updated successfully!' });
    });
});

// API endpoint to delete an event
app.delete('/events/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Event WHERE EventID = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json({ message: 'Event deleted successfully!' });
    });
});

// API endpoint to get tickets for a specific event
app.get('/tickets/:eventId', (req, res) => {
    const { eventId } = req.params;
    const query = 'SELECT * FROM Ticket WHERE EventID = ?';
    db.query(query, [eventId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json(results);
    });
});

// API endpoint to book a ticket
app.post('/tickets', (req, res) => {
    const { eventId, seatNumber, price } = req.body;
    const query = 'INSERT INTO Ticket (EventID, SeatNumber, Price, BookingStatus) VALUES (?, ?, ?, "Booked")';
    
    db.query(query, [eventId, seatNumber, price], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json({ message: 'Ticket booked successfully!', ticketId: result.insertId });
    });
});

// API endpoint to update a ticket's price
app.put('/tickets/:ticketId', (req, res) => {
    const { ticketId } = req.params;
    const { newPrice } = req.body;
    const query = 'UPDATE Ticket SET Price = ? WHERE TicketID = ?';
    
    db.query(query, [newPrice, ticketId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json({ message: 'Ticket price updated successfully!' });
    });
});

// API endpoint to delete a ticket
app.delete('/tickets/:ticketId', (req, res) => {
    const { ticketId } = req.params;
    const query = 'DELETE FROM Ticket WHERE TicketID = ?';
    
    db.query(query, [ticketId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error: ' + err });
        }
        res.json({ message: 'Ticket deleted successfully!' });
    });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the running process or set PORT to a different value.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});