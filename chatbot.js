const express = require('express');
const router = express.Router();
const natural = require('natural');
const chrono = require('chrono-node');
const tokenizer = new natural.WordTokenizer();
const Appointment = require('../models/appointment');
const Stylist = require('../models/stylist');
const Client = require('../models/client');

// Initialize classifier for intent recognition
const classifier = new natural.BayesClassifier();

// Train the classifier with sample phrases
function trainClassifier() {
    // Booking intents
    classifier.addDocument('I want to book an appointment', 'booking');
    classifier.addDocument('I need a haircut', 'booking');
    classifier.addDocument('Can I schedule a color treatment', 'booking');
    classifier.addDocument('I would like to make an appointment', 'booking');
    
    // Availability intents
    classifier.addDocument('What times are available', 'availability');
    classifier.addDocument('When can I come in', 'availability');
    classifier.addDocument('Do you have any openings', 'availability');
    
    // Price intents
    classifier.addDocument('How much does it cost', 'pricing');
    classifier.addDocument('What are your prices', 'pricing');
    classifier.addDocument('Price for highlights', 'pricing');
    
    // Information intents
    classifier.addDocument('Tell me about your services', 'info');
    classifier.addDocument('What services do you offer', 'info');
    classifier.addDocument('Do you do extensions', 'info');
    
    classifier.train();
}

trainClassifier();

// Helper function to extract dates from natural language
function extractDate(message) {
    const results = chrono.parse(message);
    return results.length > 0 ? results[0].start.date() : null;
}

// Helper function to extract time from natural language
function extractTime(message) {
    const timeRegex = /(\d{1,2}):?(\d{2})?\s*(am|pm)?/i;
    const match = message.match(timeRegex);
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const meridian = match[3] ? match[3].toLowerCase() : null;
    
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Helper function to extract service type
function extractService(message) {
    const services = ['haircut', 'color', 'highlights', 'extensions', 'styling'];
    const tokens = tokenizer.tokenize(message.toLowerCase());
    return services.find(service => tokens.includes(service));
}

// Process message and generate response
async function processMessage(message, sessionData) {
    const intent = classifier.classify(message);
    let response = '';
    
    switch (intent) {
        case 'booking':
            const service = extractService(message);
            const date = extractDate(message);
            const time = extractTime(message);
            
            if (service && date && time) {
                // Check availability
                const isAvailable = await Appointment.isTimeSlotAvailable(
                    sessionData.stylistId,
                    date,
                    time,
                    60 // Default duration
                );
                
                if (isAvailable) {
                    response = `Great! I can book you for a ${service} on ${date.toLocaleDateString()} at ${time}. Would you like to confirm?`;
                    sessionData.pendingBooking = { service, date, time };
                } else {
                    response = `I'm sorry, that time is not available. Would you like to see other available times?`;
                }
            } else {
                response = `I can help you book an appointment. What service would you like?`;
            }
            break;
            
        case 'availability':
            if (sessionData.stylistId) {
                const stylist = await Stylist.findById(sessionData.stylistId);
                const date = extractDate(message) || new Date();
                const availableSlots = await stylist.getAvailableTimeSlots(date);
                
                if (availableSlots.length > 0) {
                    response = `Available times for ${date.toLocaleDateString()}:\n` +
                             availableSlots.join('\n');
                } else {
                    response = `I'm sorry, there are no available times on ${date.toLocaleDateString()}. Would you like to check another date?`;
                }
            } else {
                response = `Please select a stylist first to check their availability.`;
            }
            break;
            
        case 'pricing':
            response = 'Our services are priced as follows:\n' +
                      '• Haircuts: $65-85\n' +
                      '• Color: $85-150\n' +
                      '• Highlights: $120-180\n' +
                      '• Extensions: Consultation required\n' +
                      '• Styling: $55-75';
            break;
            
        case 'info':
            response = 'We offer a full range of hair services including:\n' +
                      '• Precision Haircuts\n' +
                      '• Color Services\n' +
                      '• Highlights and Balayage\n' +
                      '• Extensions\n' +
                      '• Styling for Special Occasions\n\n' +
                      'Would you like more information about any specific service?';
            break;
            
        default:
            response = `I'm not sure I understand. Would you like to book an appointment, check availability, or learn about our services?`;
    }
    
    return response;
}

// Route to handle incoming messages
router.post('/message', async (req, res) => {
    try {
        const { message, sessionId, stylistId } = req.body;
        
        // Get or initialize session data
        let sessionData = {
            stylistId,
            pendingBooking: null
        };
        
        const response = await processMessage(message, sessionData);
        
        res.json({
            response,
            sessionData
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            error: 'Failed to process message',
            details: error.message
        });
    }
});

// Route to confirm booking
router.post('/confirm-booking', async (req, res) => {
    try {
        const { sessionData, clientData } = req.body;
        
        if (!sessionData.pendingBooking) {
            return res.status(400).json({
                error: 'No pending booking found'
            });
        }
        
        // Find or create client
        let client = await Client.findOne({ email: clientData.email });
        if (!client) {
            client = new Client(clientData);
            await client.save();
        }
        
        // Create appointment
        const appointment = new Appointment({
            client: client._id,
            stylist: sessionData.stylistId,
            service: sessionData.pendingBooking.service,
            date: sessionData.pendingBooking.date,
            startTime: sessionData.pendingBooking.time,
            duration: 60, // Default duration
            status: 'scheduled'
        });
        
        await appointment.save();
        
        // Update client's last visit and total visits
        client.lastVisit = appointment.date;
        client.totalVisits += 1;
        await client.save();
        
        res.json({
            success: true,
            appointment,
            message: 'Appointment confirmed successfully!'
        });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({
            error: 'Failed to confirm booking',
            details: error.message
        });
    }
});

module.exports = router; 