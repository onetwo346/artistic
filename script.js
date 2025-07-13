// GunDB peer-to-peer real-time booking sync
let gun = Gun();

// Smooth Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Creative Navbar Effects
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

// Throttled Scroll Handler
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Update scroll handler to use throttle
window.addEventListener('scroll', throttle(() => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class for background
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (currentScroll > lastScroll && currentScroll > 500) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
}, 100));

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;
const navLinks = document.querySelectorAll('.nav-link, .nav-book');

function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('active');
    body.classList.remove('no-scroll');
}

hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    body.classList.toggle('no-scroll');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
        closeMenu();
    }
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
    }
});

// Keyboard Navigation for Menu Items
document.querySelectorAll('.nav-link, .nav-book').forEach(link => {
    link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            link.click();
        }
    });
});

// Stylist Selection with Keyboard Support
const stylistCards = document.querySelectorAll('.stylist-card');
let selectedStylistCard = null;

stylistCards.forEach(card => {
    // Click handling
    card.addEventListener('click', () => {
        selectStylist(card);
    });

    // Keyboard handling
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectStylist(card);
        }
    });
});

function selectStylist(card) {
    if (selectedStylistCard) {
        selectedStylistCard.setAttribute('aria-checked', 'false');
    }
    selectedStylistCard = card;
    card.setAttribute('aria-checked', 'true');
    
    // Show and open chat widget
    chatWidget.classList.add('visible');
    chatWidget.classList.add('open');
    
    // Clear previous messages
    chatMessages.innerHTML = '';
    
    // Get stylist name and initialize booking
    const stylistName = card.querySelector('h4').textContent;
    bookingSystem.currentBooking.stylist = stylistName.toLowerCase();
    
    // Add welcome message and show services
    const servicesList = Object.values(bookingSystem.services)
        .map(service => `• ${service.name} (${service.duration} mins) - $${service.price}`)
        .join('\n');
    
    addMessage('bot', `Hi! I'm here to help you book with ${stylistName}. Here are our available services:\n\n${servicesList}\n\nWhich service would you like to book?`);
}

// Scroll Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            
            // Animate stats when about section is visible
            if (entry.target.id === 'about') {
                animateStats();
            }
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Service Cards Hover Effect
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Stats Animation with Check
let statsAnimated = false;
function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    
    document.querySelectorAll('.stat h3').forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        const duration = 2000; // 2 seconds
        const stepTime = duration / 50;
        
        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(counter);
            }
            stat.textContent = Math.floor(current) + (stat.textContent.includes('+') ? '+' : '');
        }, stepTime);
    });
}

// Form Handling with Enhanced Validation
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');
        
        // Enhanced validation
        let isValid = true;
        let errorMessage = '';
        
        // Name validation
        if (!name || name.length < 2) {
            isValid = false;
            errorMessage = 'Please enter your full name';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        // Phone validation (optional)
        if (phone) {
            const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if (!phoneRegex.test(phone)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Message validation
        if (!message || message.length < 10) {
            isValid = false;
            errorMessage = 'Please tell us more about your desired service';
        }
        
        if (!isValid) {
            showNotification(errorMessage, 'error');
            return;
        }
        
        // Simulate form submission
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        setTimeout(() => {
            showNotification('Thank you! We\'ll contact you soon to confirm your appointment.', 'success');
            this.reset();
            submitButton.disabled = false;
            submitButton.innerHTML = 'Request Appointment';
        }, 2000);
    });
}

// Booking Form Initialization
const appointmentForm = document.getElementById('appointmentForm');
if (appointmentForm) {
    initializeBookingSystem();
    
    const formInputs = appointmentForm.querySelectorAll('input, select');
    
    // Add aria-invalid attribute on invalid inputs
    formInputs.forEach(input => {
        input.addEventListener('invalid', () => {
            input.setAttribute('aria-invalid', 'true');
        });
        
        input.addEventListener('input', () => {
            if (input.validity.valid) {
                input.removeAttribute('aria-invalid');
            }
        });
    });
    
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset aria-invalid
        formInputs.forEach(input => {
            input.removeAttribute('aria-invalid');
        });
        
        // Get form data and validate
        const formData = new FormData(this);
        const service = formData.get('service');
        const date = formData.get('date');
        const time = formData.get('time');
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        
        // Validation with accessibility feedback
        let isValid = true;
        let errorMessage = '';
        let firstInvalidField = null;
        
        // Required fields validation
        if (!service || !date || !time || !name || !phone || !email) {
            isValid = false;
            errorMessage = 'Please fill in all required fields';
            
            formInputs.forEach(input => {
                if (!input.value) {
                    input.setAttribute('aria-invalid', 'true');
                    if (!firstInvalidField) firstInvalidField = input;
                }
            });
        }
        
        // Name validation
        if (name && name.length < 2) {
            isValid = false;
            errorMessage = 'Please enter your full name';
            const nameInput = document.getElementById('name');
            nameInput.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) firstInvalidField = nameInput;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
            const emailInput = document.getElementById('email');
            emailInput.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) firstInvalidField = emailInput;
        }
        
        // Phone validation
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (phone && !phoneRegex.test(phone)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
            const phoneInput = document.getElementById('phone');
            phoneInput.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) firstInvalidField = phoneInput;
        }
        
        // Date validation
        const selectedDate = new Date(date);
        const today = new Date();
        if (selectedDate < today) {
            isValid = false;
            errorMessage = 'Please select a future date';
            const dateInput = document.getElementById('date');
            dateInput.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) firstInvalidField = dateInput;
        }
        
        if (!isValid) {
            showNotification(errorMessage, 'error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }
        
        // Simulate form submission
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Booking...';
        
        setTimeout(() => {
            showNotification('Thank you! We\'ll contact you soon to confirm your appointment.', 'success');
            this.reset();
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.innerHTML = 'Book Appointment';
            
            // Reset aria-checked on stylist cards
            stylistCards.forEach(card => {
                card.setAttribute('aria-checked', 'false');
            });
            selectedStylistCard = null;
        }, 2000);
    });
}

function initializeBookingSystem() {
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    
    // Set min date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    
    // Update available times when date changes
    dateInput.addEventListener('change', function() {
        updateAvailableTimes(this.value);
    });
}

function updateAvailableTimes(selectedDate) {
    const timeSelect = document.getElementById('time');
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Clear existing options
    timeSelect.innerHTML = '<option value="">Choose a time...</option>';
    
    // Define business hours
    const businessHours = {
        0: [], // Sunday - Closed
        1: [], // Monday - Closed
        2: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], // Tuesday
        3: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], // Wednesday
        4: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'], // Thursday
        5: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'], // Friday
        6: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'] // Saturday
    };
    
    const hours = businessHours[dayOfWeek];
    
    if (hours && hours.length > 0) {
        hours.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Closed on this day';
        option.disabled = true;
        timeSelect.appendChild(option);
    }
}

// Enhanced Notification System with Accessibility
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}" aria-hidden="true"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Gallery Items Hover Effect
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.zIndex = '1';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.zIndex = '0';
    });
});

// Contact Items Hover Effect
document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Add page load animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero section elements
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 * index);
    });
    
    // WebSocket is already initialized in initializeChatElements()
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scroll = window.pageYOffset;
        hero.style.backgroundPositionY = `${scroll * 0.5}px`;
    }
}); 

// Chatbot Functionality
let chatWidget, chatToggle, chatClose, chatMessages, chatInput, sendMessage;

// Initialize chat elements when DOM is ready
function initializeChatElements() {
    chatWidget = document.getElementById('chatWidget');
    chatToggle = document.getElementById('chatToggle');
    chatClose = document.getElementById('chatClose');
    chatMessages = document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput');
    sendMessage = document.getElementById('sendMessage');
    
    if (chatWidget && chatToggle && chatClose && chatMessages && chatInput && sendMessage) {
        setupChatEventListeners();
        initializeWebSocket();
    } else {
        console.error('Some chat elements not found');
    }
}

let bookingState = {
    stylist: null,
    service: null,
    date: null,
    time: null,
    name: null,
    phone: null,
    email: null,
    currentStep: 'service' // Possible values: service, date, time, name, phone, email, confirmation
};

// Close chat widget and reset booking state
function closeChat() {
    chatWidget.classList.remove('visible');
    chatWidget.classList.remove('open');
    
    // Reset booking state
    bookingState = {
        stylist: null,
        service: null,
        date: null,
        time: null,
        name: null,
        phone: null,
        email: null,
        currentStep: 'service'
    };
    
    // Clear chat messages
    chatMessages.innerHTML = '';
    
    // Reset stylist selection
    if (selectedStylistCard) {
        selectedStylistCard.setAttribute('aria-checked', 'false');
        selectedStylistCard = null;
    }
    
    // Clear selected stylist data
    chatWidget.dataset.selectedStylist = '';
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = `
        <i class="fas fa-robot"></i>
        <p><span class="dot"></span><span class="dot"></span><span class="dot"></span></p>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = chatMessages.querySelector('.typing');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Add message with typing effect
function addMessage(type, text, withTyping = true) {
    if (withTyping && type === 'bot') {
        const typingIndicator = addTypingIndicator();
        setTimeout(() => {
            typingIndicator.remove();
            addMessageToChat(type, text);
        }, 1000);
    } else {
        addMessageToChat(type, text);
    }
}

// Add message to chat
function addMessageToChat(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'bot' ? 'fas fa-robot' : 'fas fa-user';
    
    const content = document.createElement('p');
    content.textContent = text;
    
    messageDiv.appendChild(icon);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom with smooth animation
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Setup chat event listeners
function setupChatEventListeners() {
    // Toggle chat widget
    chatToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent header click from triggering
        chatWidget.classList.toggle('open');
    });

    // Close chat widget
    chatClose.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent header click from triggering
        closeChat();
    });

    // Chat header click to toggle (but not close)
    document.querySelector('.chat-header').addEventListener('click', (e) => {
        if (!e.target.closest('.chat-toggle') && !e.target.closest('.chat-close')) {
            chatWidget.classList.toggle('open');
        }
    });

    // Send message on button click or enter key
    sendMessage.addEventListener('click', sendUserMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
}

// Send message on button click or enter key
function sendUserMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addMessage('user', message, false);
        chatInput.value = '';
        processUserMessage(message);
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeChatElements();
    initializeBookingSystem();
});

// WebSocket connection for real-time updates
function initializeWebSocket() {
    try {
        // Initialize GunDB for real-time sync
        console.log('GunDB initialized for peer-to-peer booking sync');
        
        // Listen for booking updates from other clients
        gun.get('bookings').map().on((booking, id) => {
            if (booking && booking.id) {
                console.log('Received booking update:', booking);
                // You can add real-time updates here if needed
            }
        });
        
    } catch (error) {
        console.log('GunDB not available, using localStorage fallback');
    }
}

// Booking System
const bookingSystem = {
    availableTimeSlots: {
        'natasha': {
            'Tuesday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
            'Wednesday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
            'Thursday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            'Friday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            'Saturday': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
        },
        'justina': {
            'Tuesday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
            'Wednesday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
            'Thursday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            'Friday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            'Saturday': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
        }
    },
    services: {
        'haircut': {
            name: 'Haircut',
            duration: 60,
            price: 65
        },
        'color': {
            name: 'Color Treatment',
            duration: 120,
            price: 120
        },
        'highlights': {
            name: 'Highlights',
            duration: 150,
            price: 150
        },
        'style': {
            name: 'Styling',
            duration: 45,
            price: 45
        }
    },
    currentBooking: {
        stylist: null,
        service: null,
        date: null,
        time: null,
        clientName: null,
        clientEmail: null,
        clientPhone: null
    },
    bookingStep: 0
};

// Enhanced Chatbot Logic
function processUserMessage(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    switch(bookingSystem.bookingStep) {
        case 0: // Service Selection
            handleServiceSelection(lowerMessage);
            break;
        case 1: // Date Selection
            handleDateSelection(lowerMessage);
            break;
        case 2: // Time Selection
            handleTimeSelection(lowerMessage);
            break;
        case 3: // Contact Information
            handleContactInfo(message);
            break;
        case 4: // Confirmation
            handleConfirmation(lowerMessage);
            break;
        default:
            handleGeneralInquiry(lowerMessage);
    }
}

function handleServiceSelection(message) {
    const services = Object.keys(bookingSystem.services);
    const matchedService = services.find(service => 
        message.includes(service) || message.includes(bookingSystem.services[service].name.toLowerCase())
    );
    
    if (matchedService) {
        bookingSystem.currentBooking.service = matchedService;
        bookingSystem.bookingStep = 1;
        
        const nextWeekDates = getNextWeekDates();
        addMessage('bot', `Great choice! When would you like to schedule your ${bookingSystem.services[matchedService].name}? Here are the available dates:\n\n${nextWeekDates.join('\n')}\n\nPlease select a date.`);
    } else {
        addMessage('bot', `I can help you book any of these services:\n\n${Object.values(bookingSystem.services).map(service => 
            `• ${service.name} (${service.duration} mins) - $${service.price}`
        ).join('\n')}\n\nWhich service would you like?`);
    }
}

function handleDateSelection(message) {
    const selectedDate = parseDate(message);
    
    if (selectedDate) {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        const availableTimes = getAvailableTimesForDate(selectedDate, bookingSystem.currentBooking.stylist);
        
        if (availableTimes.length > 0) {
            bookingSystem.currentBooking.date = selectedDate.toISOString().split('T')[0];
            bookingSystem.bookingStep = 2;
            
            addMessage('bot', `Great! Here are the available times for ${dayName}, ${selectedDate.toLocaleDateString()}:\n\n${availableTimes.join('\n')}\n\nPlease select a time.`);
        } else {
            addMessage('bot', `I'm sorry, but there are no available times on ${dayName}. Please select another date.`);
        }
    } else {
        addMessage('bot', "I didn't catch that date. Please select a date from the list above.");
    }
}

function handleTimeSelection(message) {
    const selectedTime = parseTime(message);
    
    if (selectedTime) {
        const availableTimes = getAvailableTimesForDate(new Date(bookingSystem.currentBooking.date), bookingSystem.currentBooking.stylist);
        
        if (availableTimes.includes(selectedTime)) {
            bookingSystem.currentBooking.time = selectedTime;
            bookingSystem.bookingStep = 3;
            
            addMessage('bot', "Perfect! To complete your booking, I'll need your contact information. Please provide your:\n• Full Name\n• Email\n• Phone Number");
        } else {
            addMessage('bot', "I'm sorry, but that time is not available. Please select a time from the list above.");
        }
    } else {
        addMessage('bot', "I didn't catch that time. Please select a time from the list above.");
    }
}

function handleContactInfo(message) {
    const words = message.split(/\s+/);
    
    if (!bookingSystem.currentBooking.clientName) {
        bookingSystem.currentBooking.clientName = message;
        addMessage('bot', "Thanks! Now, please provide your email address.");
    } else if (!bookingSystem.currentBooking.clientEmail) {
        if (isValidEmail(message)) {
            bookingSystem.currentBooking.clientEmail = message;
            addMessage('bot', "Great! Finally, please provide your phone number.");
        } else {
            addMessage('bot', "That doesn't look like a valid email address. Please try again.");
        }
    } else if (!bookingSystem.currentBooking.clientPhone) {
        if (isValidPhone(message)) {
            bookingSystem.currentBooking.clientPhone = message;
            bookingSystem.bookingStep = 4;
            
            // Show booking summary
            const booking = bookingSystem.currentBooking;
            const service = bookingSystem.services[booking.service];
            addMessage('bot', `Perfect! Here's your booking summary:\n\n` +
                `Service: ${service.name} ($${service.price})\n` +
                `Stylist: ${capitalizeFirstLetter(booking.stylist)}\n` +
                `Date: ${new Date(booking.date).toLocaleDateString()}\n` +
                `Time: ${booking.time}\n` +
                `Name: ${booking.clientName}\n` +
                `Email: ${booking.clientEmail}\n` +
                `Phone: ${booking.clientPhone}\n\n` +
                `Is this correct? Please reply with 'yes' to confirm or 'no' to start over.`);
        } else {
            addMessage('bot', "That doesn't look like a valid phone number. Please provide a 10-digit phone number.");
        }
    }
}

function handleConfirmation(message) {
    if (message === 'yes') {
        try {
            // Generate unique ID for the booking
            const bookingId = generateBookingId();
            
            // Create the final booking object
            const finalBooking = {
                id: bookingId,
                ...bookingSystem.currentBooking,
                status: 'pending',
                created: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save to GunDB with fallback
            saveBooking(finalBooking);
            
            addMessage('bot', "Fantastic! Your appointment has been booked successfully! You'll receive a confirmation email shortly. We look forward to seeing you!");
            
            // Reset booking system
            resetBookingSystem();
        } catch (error) {
            console.error('Error confirming booking:', error);
            addMessage('bot', "I'm sorry, there was an issue confirming your booking. Please try again or contact us directly.");
        }
    } else if (message === 'no') {
        addMessage('bot', "No problem! Let's start over. What service would you like to book?");
        resetBookingSystem();
    } else {
        addMessage('bot', "Please reply with 'yes' to confirm your booking or 'no' to start over.");
    }
}

function handleGeneralInquiry(message) {
    if (message.includes('price') || message.includes('cost')) {
        addMessage('bot', `Here are our service prices:\n\n${Object.values(bookingSystem.services).map(service => 
            `• ${service.name}: $${service.price}`
        ).join('\n')}`);
    } else if (message.includes('hour') || message.includes('time')) {
        addMessage('bot', "Our hours of operation are:\nTuesday-Wednesday: 10AM-4:30PM\nThursday-Friday: 10AM-6:30PM\nSaturday: 9AM-3PM\nSunday-Monday: Closed");
    } else {
        addMessage('bot', "I'm here to help you book an appointment. Would you like to schedule a service? I can tell you about our services and prices as well.");
    }
}

// Helper Functions
function getNextWeekDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (bookingSystem.availableTimeSlots[bookingSystem.currentBooking.stylist][dayName]) {
            dates.push(`${dayName}, ${date.toLocaleDateString()}`);
        }
    }
    
    return dates;
}

function getAvailableTimesForDate(date, stylist) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const availableTimes = bookingSystem.availableTimeSlots[stylist][dayName] || [];
    
    // Filter out already booked times
    const bookings = getStoredBookings();
    const dateStr = date.toISOString().split('T')[0];
    
    return availableTimes.filter(time => {
        return !bookings.some(booking => 
            booking.date === dateStr && 
            booking.time === time && 
            booking.stylist === stylist &&
            booking.status !== 'cancelled'
        );
    });
}

function parseDate(input) {
    const date = new Date(input);
    return isNaN(date) ? null : date;
}

function parseTime(input) {
    // Remove any extra spaces and convert to lowercase
    input = input.toLowerCase().trim();
    
    // Try to match common time formats
    const timeFormats = [
        /^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/,
        /^(\d{1,2})\s*(am|pm)$/
    ];
    
    for (const format of timeFormats) {
        const match = input.match(format);
        if (match) {
            let [_, hours, minutes = '00', period = ''] = match;
            hours = parseInt(hours);
            
            // Convert to 24-hour format if needed
            if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
            if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
            
            // Format as HH:MM
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
    }
    
    return null;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateBookingId() {
    return 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveBooking(booking) {
    try {
        // Save booking to GunDB for real-time sync
        gun.get('bookings').get(booking.id).put(booking);
        console.log('Booking saved to GunDB:', booking.id);
    } catch (error) {
        console.error('Error saving booking to GunDB:', error);
        // Fallback to localStorage if GunDB fails
        const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(existingBookings));
        console.log('Booking saved to localStorage as fallback');
    }
}

function getStoredBookings() {
    try {
        // Try to get bookings from localStorage as fallback
        const stored = localStorage.getItem('bookings');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting stored bookings:', error);
        return [];
    }
}

function resetBookingSystem() {
    bookingSystem.currentBooking = {
        stylist: bookingSystem.currentBooking.stylist, // Keep the selected stylist
        service: null,
        date: null,
        time: null,
        clientName: null,
        clientEmail: null,
        clientPhone: null
    };
    bookingSystem.bookingStep = 0;
} 