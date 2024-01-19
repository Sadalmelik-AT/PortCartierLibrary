const mongoose = require('mongoose');
const Schema =  mongoose.Schema
const ReservationSchema = new Schema({
    CodeReservation: String,
    CodeMembre: String,
    CodeDocument: String,
    DateReservation: String,
    'En cours': Boolean, 
});
const reservation = mongoose.model('Reservations', ReservationSchema);
module.exports = reservation

