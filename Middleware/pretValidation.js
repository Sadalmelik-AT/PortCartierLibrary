const Pret = require('../Models/Pret');
const Reservation= require('../Models/Reservation')
const Document = require('../Models/Document');
const session = require('express-session');
const pretValidation = async (req, res, next) => {
    const { selectedDocument, selectedMembre, dateDebut, dateFin } = req.body; // Retrieve form data
    const reservations = await Reservation.find({});
    let pretValid = true;
    

    // Check if dateDebut and dateFin are empty strings
    if (dateDebut.trim() === "" || dateFin.trim() === "") {
        return res.status(400).send('Veuillez entrer une date de début et une date de fin valides.');
        pretValid=false
    }
    const parsedDateDebut = new Date(dateDebut);
    const parsedDateFin = new Date(dateFin);

    if (parsedDateDebut >= parsedDateFin) {
        return res.status(400).send('La date de fin doit être postérieure à la date de début.');
        pretValid = false;
    }
    const hasReservationForDocument = reservations.some(reservation => {
        return reservation.CodeDocument === selectedDocument && reservation['En cours'] === true;
    });
    let matchingReservation 
    if (hasReservationForDocument) {
         matchingReservation = reservations.find(reservation => {
            return reservation.CodeDocument === selectedDocument && reservation.CodeMembre === selectedMembre;
        });

        if (matchingReservation) {
            pretValid = true;
        }else{
            pretValid =false;
        }
    } else {
        pretValid = true;
    }

    
   if(pretValid){
    let count = await Pret.countDocuments();
    const newPret = {
        CodePret: `PRT${(count + 1).toLocaleString('en', { minimumIntegerDigits: 3 }).padStart(3, '0')}`,
        CodeMembre: selectedMembre,
        CodeEmploye: req.session.user.CodeEmploye,
        CodeDocument: selectedDocument,
        DateDebut: dateDebut, // Assuming the dateDebut and dateFin are valid dates
        DateFin: dateFin, // Convert directly to Date objects
        DateRetour: " ",
        Actif: true
    };

    const pretComplet = await Pret.create(newPret);
    if (matchingReservation && pretComplet) {
        await Reservation.findOneAndUpdate(
            { CodeReservation: matchingReservation.CodeReservation }, //Cherche la reservation
            { $set: { 'En cours': false } }, // la desactive
            { new: true } //sauve les changement
        )
        await Document.findOneAndUpdate(
            {CodeDocument: matchingReservation.CodeDocument},//Cherche le document
            { $set: { Reserve: false } },// met disponible pour reservation
            { new: true } //sauve les changement
        )
    }
   } else if (!pretValid) {
    return res.status(400).send('Conditions de réservation non remplies.');
}

    next(); // Move to the next middleware or route handler
};
module.exports = pretValidation;