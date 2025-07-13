const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    stylist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: true
    },
    service: {
        type: String,
        required: true,
        enum: ['Haircut', 'Color', 'Highlights', 'Extensions', 'Styling']
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: String,
    price: Number,
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
appointmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if time slot is available
appointmentSchema.statics.isTimeSlotAvailable = async function(stylistId, date, startTime, duration) {
    const startDateTime = new Date(date);
    const [hours, minutes] = startTime.split(':');
    startDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
    
    const conflictingAppointment = await this.findOne({
        stylist: stylistId,
        date: date,
        status: { $ne: 'cancelled' },
        $or: [
            {
                startTime: {
                    $gte: startTime,
                    $lt: endDateTime.toTimeString().slice(0, 5)
                }
            },
            {
                $expr: {
                    $and: [
                        { $lt: ['$startTime', endDateTime.toTimeString().slice(0, 5)] },
                        { $gt: [{ $add: ['$startTime', '$duration'] }, startTime] }
                    ]
                }
            }
        ]
    });
    
    return !conflictingAppointment;
};

module.exports = mongoose.model('Appointment', appointmentSchema); 