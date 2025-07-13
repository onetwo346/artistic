const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        enum: ['Master Stylist', 'Senior Stylist', 'Stylist']
    },
    specialties: [{
        type: String,
        enum: ['Color Expert', 'Precision Cuts', 'Extensions', 'Styling']
    }],
    schedule: {
        monday: { isWorking: { type: Boolean, default: false }, hours: { start: String, end: String } },
        tuesday: { isWorking: { type: Boolean, default: true }, hours: { start: '10:00', end: '16:30' } },
        wednesday: { isWorking: { type: Boolean, default: true }, hours: { start: '10:00', end: '16:30' } },
        thursday: { isWorking: { type: Boolean, default: true }, hours: { start: '10:00', end: '18:30' } },
        friday: { isWorking: { type: Boolean, default: true }, hours: { start: '10:00', end: '18:30' } },
        saturday: { isWorking: { type: Boolean, default: true }, hours: { start: '09:00', end: '15:00' } },
        sunday: { isWorking: { type: Boolean, default: false }, hours: { start: String, end: String } }
    },
    services: [{
        name: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // Duration in minutes
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    image: String,
    bio: String,
    email: String,
    phone: String,
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
stylistSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to get available time slots for a specific date
stylistSchema.methods.getAvailableTimeSlots = async function(date) {
    const dayOfWeek = new Date(date).toLocaleLowerCase();
    const schedule = this.schedule[dayOfWeek];
    
    if (!schedule.isWorking) {
        return [];
    }
    
    const [startHour, startMinute] = schedule.hours.start.split(':');
    const [endHour, endMinute] = schedule.hours.end.split(':');
    
    const startTime = new Date(date);
    startTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const endTime = new Date(date);
    endTime.setHours(parseInt(endHour), parseInt(endMinute));
    
    // Get all appointments for this date
    const appointments = await mongoose.model('Appointment').find({
        stylist: this._id,
        date: date,
        status: { $ne: 'cancelled' }
    }).sort('startTime');
    
    // Generate available time slots
    const timeSlots = [];
    let currentTime = startTime;
    
    while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        const isAvailable = await mongoose.model('Appointment').isTimeSlotAvailable(
            this._id,
            date,
            timeString,
            30 // Default slot duration
        );
        
        if (isAvailable) {
            timeSlots.push(timeString);
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return timeSlots;
};

module.exports = mongoose.model('Stylist', stylistSchema); 