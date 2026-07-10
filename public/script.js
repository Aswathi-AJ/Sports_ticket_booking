document.addEventListener('DOMContentLoaded', () => {
    const eventSelect = document.getElementById('eventSelect');

    eventSelect.addEventListener('change', () => {
        const eventId = eventSelect.value;
        if (eventId) {
            loadTickets(eventId);
        } else {
            clearTickets();
        }
    });

    document.getElementById('addEventForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const eventName = document.getElementById('eventName').value;
        const venue = document.getElementById('venue').value;
        const eventDate = document.getElementById('eventDate').value;

        const response = await fetch('/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventName, venue, eventDate }),
        });

        const result = await response.json();
        showMessage(result.message, response.ok);
        await loadEvents(); // Reload events to reflect changes
    });

    document.getElementById('bookingForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const eventId = document.getElementById('eventSelect').value;
        const seatNumber = document.getElementById('seatNumber').value;
        const price = document.getElementById('price').value;

        if (!eventId) {
            showMessage('Please select an event before booking.', false);
            return;
        }

        const response = await fetch('/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ eventId, seatNumber, price }),
        });

        const result = await response.json();
        showMessage(result.message, response.ok);
        if (response.ok) {
            loadTickets(eventId);
        }
    });

    document.getElementById('updateForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const ticketId = document.getElementById('ticketId').value;
        const newPrice = document.getElementById('newPrice').value;
        const selectedEventId = document.getElementById('eventSelect').value;

        const response = await fetch(`/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPrice }),
        });

        const result = await response.json();
        showMessage(result.message, response.ok);
        if (response.ok && selectedEventId) {
            loadTickets(selectedEventId);
        }
    });

    document.getElementById('deleteForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const ticketId = document.getElementById('deleteTicketId').value;
        const selectedEventId = document.getElementById('eventSelect').value;

        const response = await fetch(`/tickets/${ticketId}`, {
            method: 'DELETE',
        });

        const result = await response.json();
        showMessage(result.message, response.ok);
        if (response.ok && selectedEventId) {
            loadTickets(selectedEventId);
        }
    });

    loadEvents();
});

// Function to load events and display them
async function loadEvents() {
    const response = await fetch('/events');
    const events = await response.json();
    const eventsBody = document.getElementById('events');
    eventsBody.innerHTML = ''; // Clear previous events

    const eventSelect = document.getElementById('eventSelect');
    eventSelect.innerHTML = '<option value="">Choose an event</option>';

    events.forEach(event => {
        const eventRow = document.createElement('tr');
        eventRow.innerHTML = `
            <td>${event.EventID}</td>
            <td>${event.EventName}</td>
            <td>${event.Venue}</td>
            <td>${new Date(event.EventDate).toLocaleString()}</td>
        `;
        eventsBody.appendChild(eventRow);

        const option = document.createElement('option');
        option.value = event.EventID;
        option.textContent = `${event.EventName} (${new Date(event.EventDate).toLocaleDateString()})`;
        eventSelect.appendChild(option);
    });
}

// Function to load tickets for a specific event
async function loadTickets(eventId) {
    const response = await fetch(`/tickets/${eventId}`);
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
        } else {
            availableTicketsBody.appendChild(ticketRow); // Add to available tickets table
        }
    });
}

function clearTickets() {
    document.getElementById('bookedTicketsBody').innerHTML = '';
    document.getElementById('availableTicketsBody').innerHTML = '';
}

function showMessage(text, success) {
    const message = document.getElementById('message');
    message.innerText = text;
    message.className = success ? 'success' : 'error';
}
