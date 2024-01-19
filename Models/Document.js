const mongoose = require('mongoose');
const Schema = mongoose.Schema
const DocumentSchema = new Schema({
    CodeDocument: String,
    Titre: String,
    Auteur: String,
    Annee: String,
    Categorie: String,
    Classement: String,
    Genre: String,
    Description: String,
    ISBN: String,
    Reserve: Boolean,
    href:String
});
const document = mongoose.model('Documents',DocumentSchema);
module.exports = document;