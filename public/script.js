let selectedSeat = '';

document.addEventListener('DOMContentLoaded', () => {
    const eventSelect = document.getElementById('eventSelect');

    eventSelect.addEventListener('change', () => {
        const eventId = eventSelect.value;
        if (eventId) {
            loadEventDetails(eventId);
            loadTickets(eventId);
        } else {
            clearTickets();
            hideEventDetails();
            hideSeatMap();
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
        const seatNumber = document.getElementById('seatSelect').value;
        const price = document.getElementById('priceSelect').value;

        if (!eventId) {
            showMessage('Please select an event before booking.', false);
            return;
        }

        if (!seatNumber) {
            showMessage('Please select an available seat from the seat map.', false);
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
            await loadEventDetails(eventId);
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

    populatePriceOptions();
    loadEvents();
});

function populatePriceOptions() {
    const priceSelect = document.getElementById('priceSelect');
    const prices = [100, 150, 200, 250, 300, 400];

    priceSelect.innerHTML = '<option value="">Choose a price tier</option>';
    prices.forEach((price) => {
        const option = document.createElement('option');
        option.value = price;
        option.textContent = `₹${price}`;
        priceSelect.appendChild(option);
    });
}

function updateSeatOptions(tickets) {
    const seatSelect = document.getElementById('seatSelect');
    const bookedSeats = tickets
        .filter(ticket => ticket.BookingStatus === 'Booked')
        .map(ticket => ticket.SeatNumber);

    const allSeats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    for (const row of rows) {
        for (let num = 1; num <= 8; num++) {
            allSeats.push(`${row}${num}`);
        }
    }

    selectedSeat = '';
    seatSelect.value = '';
    renderSeatMap(allSeats, bookedSeats);
}

function renderSeatMap(allSeats, bookedSeats) {
    const seatMap = document.getElementById('seatMap');
    const seatMapSection = document.getElementById('seatMapSection');
    seatMap.innerHTML = '';

    allSeats.forEach(seat => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = seat;
        button.className = 'seat-button';

        if (bookedSeats.includes(seat)) {
            button.classList.add('booked');
            button.disabled = true;
        } else {
            button.classList.add('available');
            button.addEventListener('click', () => selectSeat(seat, button));
        }

        seatMap.appendChild(button);
    });

    seatMapSection.classList.remove('hidden');
}

function selectSeat(seat, button) {
    selectedSeat = seat;
    document.getElementById('seatSelect').value = seat;
    const selectedSeatValue = document.getElementById('selectedSeatValue');
    if (selectedSeatValue) {
        selectedSeatValue.textContent = seat;
    }
    document.querySelectorAll('.seat-button').forEach((btn) => {
        btn.classList.toggle('selected', btn.textContent === seat);
    });
}

function hideSeatMap() {
    document.getElementById('seatMapSection').classList.add('hidden');
    selectedSeat = '';
    document.getElementById('seatSelect').value = '';
    const selectedSeatValue = document.getElementById('selectedSeatValue');
    if (selectedSeatValue) {
        selectedSeatValue.textContent = 'None';
    }
}

async function loadEventDetails(eventId) {
    const events = await fetch('/events').then(res => res.json());
    const event = events.find(e => `${e.EventID}` === eventId);
    const tickets = await fetch(`/tickets/${eventId}`).then(res => res.json());
    const bookedSeats = tickets
        .filter(ticket => ticket.BookingStatus === 'Booked')
        .map(ticket => ticket.SeatNumber)
        .join(', ') || 'None';

    document.getElementById('eventSummaryText').textContent = `${event.EventName} at ${event.Venue} on ${new Date(event.EventDate).toLocaleString()}`;
    document.getElementById('availableSeatCount').textContent = 40 - tickets.length;
    document.getElementById('bookedSeatList').textContent = bookedSeats;
    document.getElementById('eventDetails').classList.remove('hidden');
    updateSeatOptions(tickets);
}

function hideEventDetails() {
    document.getElementById('eventDetails').classList.add('hidden');
}

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
        eventRow.className = 'event-row';
        eventRow.innerHTML = `
            <td>${event.EventID}</td>
            <td>${event.EventName}</td>
            <td>${event.Venue}</td>
            <td>${new Date(event.EventDate).toLocaleString()}</td>
        `;
        eventRow.addEventListener('click', () => {
            eventSelect.value = event.EventID;
            loadEventDetails(event.EventID);
            loadTickets(event.EventID);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
    updateSeatOptions(tickets);

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
    message.classList.remove('hidden');
    setTimeout(() => {
        message.classList.add('hidden');
    }, 4500);
}
