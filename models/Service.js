const mongoose = require('mongoose')

const ServiceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true
    },
    serviceDescription: {
        type: String,
        required: true
    },
    serviceImage: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Service', ServiceSchema)