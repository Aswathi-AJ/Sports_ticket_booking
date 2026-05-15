document.addEventListener('DOMContentLoaded', () => {
    loadEvents();

    // Handle adding a new event
    document.getElementById('addEventForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const eventName = document.getElementById('eventName').value;
        const venue = document.getElementById('venue').value;
        const eventDate = document.getElementById('eventDate').value;

        const response = await fetch('http://localhost:3000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventName, venue, eventDate }),
        });

        const result = await response.json();
        document.getElementById('message').innerText = result.message;
        loadEvents(); // Reload events to reflect changes
    });

    // Handle booking form submission
    document.getElementById('bookingForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const eventId = document.getElementById('eventId').value;
        const seatNumber = document.getElementById('seatNumber').value;
        const price = document.getElementById('price').value;

        const response = await fetch('http://localhost:3000/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventId, seatNumber, price }),
        });

        const result = await response.json();
        document.getElementById('message').innerText = result.message;
        loadTickets(eventId); // Load tickets for the selected event
    });

    // Handle update form submission
    document.getElementById('updateForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const ticketId = document.getElementById('ticketId').value;
        const newPrice = document.getElementById('newPrice').value;

        const response = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPrice }),
        });

        const result = await response.json();
        document.getElementById('message').innerText = result.message;
        loadTickets(document.getElementById('eventId').value); // Reload tickets for the selected event
    });

    // Handle delete form submission
    document.getElementById('deleteForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const ticketId = document.getElementById('deleteTicketId').value;

        const response = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
            method: 'DELETE',
        });

        const result = await response.json();
        document.getElementById('message').innerText = result.message;
        loadTickets(document.getElementById('eventId').value); // Reload tickets for the selected event
    });
});

// Function to load events and display them
async function loadEvents() {
    const response = await fetch('http://localhost:3000/events');
    const events = await response.json();
    const eventsBody = document.getElementById('events');
    eventsBody.innerHTML = ''; // Clear previous events

    events.forEach(event => {
        const eventRow = document.createElement('tr');
        eventRow.innerHTML = `
            <td>${event.EventID}</td>
            <td>${event.EventName}</td>
            <td>${event.Venue}</td>
            <td>${new Date(event.EventDate).toLocaleString()}</td>
        `;
        eventsBody.appendChild(eventRow);
    });
}

// Function to load tickets for a specific event
async function loadTickets(eventId) {
    const response = await fetch(`http://localhost:3000/tickets/${eventId}`);
    const tickets = await response.json();

    const bookedTicketsBody = document.getElementById('bookedTicketsBody');
    const availableTicketsBody = document.getElementById('availableTicketsBody');

    bookedTicketsBody.innerHTML = ''; // Clear previous booked tickets
    availableTicketsBody.innerHTML = ''; // Clear previous available tickets

    tickets.forEach(ticket => {
        const ticketRow = document.createElement('tr');
        ticketRow.innerHTML = `
            <td>${ticket.TicketID}</td>
            <td>${ticket.SeatNumber}</td>
            <td>${ticket.Price}</td>
            <td>${ticket.BookingStatus}</td>
        `;

        if (ticket.BookingStatus === 'Booked') {
            bookedTicketsBody.appendChild(ticketRow); // Add to booked tickets table
        } else if (ticket.BookingStatus === 'Available') {
            availableTicketsBody.appendChild(ticketRow); // Add to available tickets table
        }
    });
}