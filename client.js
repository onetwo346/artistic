const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    preferences: {
        preferredStylist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stylist'
        },
        notes: String,
        favoriteServices: [{
            type: String,
            enum: ['Haircut', 'Color', 'Highlights', 'Extensions', 'Styling']
        }]
    },
    history: [{
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        },
        notes: String,
        satisfaction: Number, // 1-5 rating
        feedback: String
    }],
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: true
        }
    },
    lastVisit: Date,
    totalVisits: {
        type: Number,
        default: 0
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
clientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to get client's booking history
clientSchema.methods.getBookingHistory = async function() {
    return await mongoose.model('Appointment')
        .find({ client: this._id })
        .sort('-date')
        .populate('stylist', 'name title');
};

// Method to get recommended services based on history
clientSchema.methods.getRecommendedServices = async function() {
    const history = await this.getBookingHistory();
    const serviceCount = {};
    
    history.forEach(appointment => {
        serviceCount[appointment.service] = (serviceCount[appointment.service] || 0) + 1;
    });
    
    return Object.entries(serviceCount)
        .sort((a, b) => b[1] - a[1])
        .map(([service]) => service);
};

// Method to check if due for appointment
clientSchema.methods.isDueForAppointment = function() {
    if (!this.lastVisit) return true;
    
    const lastVisitDate = new Date(this.lastVisit);
    const currentDate = new Date();
    const weeksSinceLastVisit = Math.floor((currentDate - lastVisitDate) / (7 * 24 * 60 * 60 * 1000));
    
    return weeksSinceLastVisit >= 6; // Assuming 6 weeks is standard interval
};

module.exports = mongoose.model('Client', clientSchema); 