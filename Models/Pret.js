const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PretSchema = new Schema({
    CodePret : String,
    CodeMembre  : String,
    CodeEmploye  :String,
    CodeDocument :String,
    DateDebut :String,
    DateFin :String,
    DateRetour :String,
    Actif:Boolean
});
const pret = mongoose.model('Prets', PretSchema);
module.exports = pret

