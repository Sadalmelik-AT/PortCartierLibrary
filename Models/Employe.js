const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EmployeSchema = new Schema({
    CodeEmploye : String,
    Prenom :String,
    Nom : String,
    Courriel :String,
    Mdp :String,
    Admin: Boolean
});
const employe = mongoose.model('Employes', EmployeSchema);
module.exports = employe