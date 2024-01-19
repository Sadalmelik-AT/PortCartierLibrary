const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MembreSchema = new Schema({
    CodeMembre : String,
    Nom : String,
    Prenom :String,
    Adresse :String,
    Telephone :String,
    Courriel :String,
    Mdp :String,
});
const membre = mongoose.model('Membres', MembreSchema);
module.exports = membre

