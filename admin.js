// GunDB peer-to-peer real-time booking sync
let gun = Gun();
let bookings = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    setupEventListeners();
    subscribeToBookings();
    setupSidebarNavigation();
});

function initializeAdmin() {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
}

function setupEventListeners() {
    document.getElementById('prevDay').addEventListener('click', () => navigateCalendar(-1));
    document.getElementById('nextDay').addEventListener('click', () => navigateCalendar(1));
}

function subscribeToBookings() {
    gun.get('bookings').map().on((booking, id) => {
        if (!booking) return;
        const idx = bookings.findIndex(b => b.id === booking.id);
        if (idx === -1) {
            bookings.push(booking);
        } else {
            bookings[idx] = booking;
        }
        updateDashboardStats();
        updateAppointmentGrid(new Date());
        updateRecentBookings();
    });
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function navigateCalendar(days) {
    const currentDate = document.getElementById('currentDate').textContent;
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    document.getElementById('currentDate').textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    updateAppointmentGrid(date);
}

function updateDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
    });
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');
    document.getElementById('todayBookings').textContent = todayBookings.length;
    document.getElementById('pendingBookings').textContent = pendingBookings.length;
}

function updateAppointmentGrid(date) {
    const grid = document.getElementById('appointmentGrid');
    grid.innerHTML = '';
    const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === date.toDateString();
    });
    if (dayBookings.length === 0) {
        grid.innerHTML = '<div class="no-appointments">No appointments scheduled</div>';
        return;
    }
    dayBookings.sort((a, b) => new Date(a.time) - new Date(b.time))
        .forEach(booking => {
            const appointmentCard = createAppointmentCard(booking);
            grid.appendChild(appointmentCard);
        });
}

function createAppointmentCard(booking) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    card.innerHTML = `
        <div class="appointment-time">${formatTime(booking.time)}</div>
        <div class="appointment-details">
            <div class="client-name">${booking.clientName}</div>
            <div class="service-type">${booking.service}</div>
            <div class="stylist-name">with ${booking.stylist}</div>
        </div>
        <div class="appointment-status ${booking.status}">${booking.status}</div>
        <div class="appointment-actions">
            <button onclick="updateBookingStatus('${booking.id}', 'confirmed')" 
                    class="action-btn confirm" 
                    ${booking.status === 'confirmed' ? 'disabled' : ''}>
                <i class="fas fa-check"></i>
            </button>
            <button onclick="updateBookingStatus('${booking.id}', 'cancelled')" 
                    class="action-btn cancel"
                    ${booking.status === 'cancelled' ? 'disabled' : ''}>
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    return card;
}

function updateRecentBookings() {
    const recentList = document.getElementById('recentBookings');
    recentList.innerHTML = '';
    const recent = [...bookings]
        .sort((a, b) => new Date(b.created) - new Date(a.created))
        .slice(0, 5);
    recent.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'booking-item';
        item.innerHTML = `
            <div class="booking-info">
                <div class="booking-name">${booking.clientName}</div>
                <div class="booking-time">${formatDateTime(booking.date, booking.time)}</div>
            </div>
            <div class="booking-status ${booking.status}">${booking.status}</div>
        `;
        recentList.appendChild(item);
    });
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();
    gun.get('bookings').get(booking.id).put(booking);
    updateDashboardStats();
    updateAppointmentGrid(new Date(booking.date));
    updateRecentBookings();
    showNotification(`Booking ${newStatus} successfully`, 'success');
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar nav a');
    const sections = [
        'dashboardSection',
        'bookingsSection',
        'stylistsSection',
        'settingsSection'
    ];
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active from all
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            // Add active to current
            this.parentElement.classList.add('active');
            // Hide all sections
            sections.forEach(id => {
                document.getElementById(id).style.display = 'none';
            });
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).style.display = '';
            // If Bookings tab, render all bookings
            if (sectionId === 'bookingsSection') {
                renderAllBookings();
            }
        });
    });
}

function renderAllBookings() {
    const container = document.getElementById('allBookingsList');
    if (!container) return;
    if (!bookings.length) {
        container.innerHTML = '<div class="no-appointments">No bookings found.</div>';
        return;
    }
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'bookings-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Stylist</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    bookings.sort((a, b) => new Date(b.created) - new Date(a.created)).forEach(booking => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${booking.clientName || ''}</td>
            <td>${booking.service || ''}</td>
            <td>${booking.stylist || ''}</td>
            <td>${booking.date ? new Date(booking.date).toLocaleDateString() : ''}</td>
            <td>${booking.time || ''}</td>
            <td>${booking.status || ''}</td>
        `;
        tbody.appendChild(tr);
    });
    container.appendChild(table);
}

// Helper Functions
function formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatDateTime(date, time) {
    const datetime = new Date(`${date}T${time}`);
    return datetime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 

// Modal logic
let currentModalBooking = null;

function openBookingModal(booking) {
    currentModalBooking = booking;
    const modal = document.getElementById('bookingModal');
    const details = document.getElementById('modalBookingDetails');
    const actions = document.getElementById('modalBookingActions');
    // Fill details
    details.innerHTML = `
        <div class="modal-row"><span class="modal-label">Client:</span><span class="modal-value">${booking.clientName}</span></div>
        <div class="modal-row"><span class="modal-label">Email:</span><span class="modal-value">${booking.clientEmail || '-'}</span></div>
        <div class="modal-row"><span class="modal-label">Phone:</span><span class="modal-value">${booking.clientPhone || '-'}</span></div>
        <div class="modal-row"><span class="modal-label">Service:</span><span class="modal-value">${booking.service}</span></div>
        <div class="modal-row"><span class="modal-label">Stylist:</span><span class="modal-value">${booking.stylist}</span></div>
        <div class="modal-row"><span class="modal-label">Date:</span><span class="modal-value">${formatDateTime(booking.date, booking.time)}</span></div>
        <div class="modal-row"><span class="modal-label">Status:</span><span class="modal-value"><span class="booking-status ${booking.status}">${booking.status}</span></span></div>
    `;
    // Fill actions
    actions.innerHTML = '';
    if (booking.status === 'pending') {
        actions.innerHTML += `<button class="confirm" id="modalConfirmBtn"><i class="fas fa-check"></i> Confirm</button>`;
        actions.innerHTML += `<button class="cancel" id="modalCancelBtn"><i class="fas fa-times"></i> Cancel</button>`;
    }
    actions.innerHTML += `<button id="modalCloseBtn">Close</button>`;
    modal.style.display = 'flex';
    // Button handlers
    if (booking.status === 'pending') {
        document.getElementById('modalConfirmBtn').onclick = () => handleModalAction('confirmed');
        document.getElementById('modalCancelBtn').onclick = () => handleModalAction('cancelled');
    }
    document.getElementById('modalCloseBtn').onclick = closeBookingModal;
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    currentModalBooking = null;
}

document.getElementById('closeBookingModal').onclick = closeBookingModal;

function handleModalAction(newStatus) {
    if (!currentModalBooking) return;
    updateBookingStatus(currentModalBooking.id, newStatus);
    closeBookingModal();
}

// Patch: Make appointment cards clickable
const origCreateAppointmentCard = createAppointmentCard;
createAppointmentCard = function(booking) {
    const card = origCreateAppointmentCard(booking);
    card.style.cursor = 'pointer';
    card.onclick = () => openBookingModal(booking);
    return card;
};

// Patch: Make recent bookings clickable
const origUpdateRecentBookings = updateRecentBookings;
updateRecentBookings = function() {
    const recentList = document.getElementById('recentBookings');
    recentList.innerHTML = '';
    const recent = [...bookings]
        .sort((a, b) => new Date(b.created) - new Date(a.created))
        .slice(0, 5);
    recent.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'booking-item';
        item.innerHTML = `
            <div class="booking-info">
                <div class="booking-name">${booking.clientName}</div>
                <div class="booking-time">${formatDateTime(booking.date, booking.time)}</div>
            </div>
            <div class="booking-status ${booking.status}">${booking.status}</div>
        `;
        item.style.cursor = 'pointer';
        item.onclick = () => openBookingModal(booking);
        recentList.appendChild(item);
    });
}; 