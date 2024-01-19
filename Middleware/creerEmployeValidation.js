const Employe= require('../Models/Employe');
const validator = require('validator');
const creerEmployeValidation = async (req, res, next) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;//regex email
  let employeValide = true
    const {
        prenomEmploye,
        nomEmploye,
        courrielEmploye,
        mdpEmploye,
        admin
    } = req.body
   
      if (
        prenomEmploye == " " || 
        nomEmploye == " "||
        courrielEmploye == " " ||
         mdpEmploye == "") {
            employeValide = false;
        return res.status(400).send(`Erreur: tous les champs sont requis.`)
    }
    if(!emailRegex.test(courrielEmploye)){
        employeValide = false;
        return res.status(400).send(`Erreur: courriel invalide.`)
    }
  if(employeValide){
    const count = await Employe.countDocuments()
    const newEmploye = {
        CodeEmploye: `EMP${(count + 1).toLocaleString('en', { minimumIntegerDigits: 3 }).padStart(3, '0')}`,
        Prenom: prenomEmploye,
        Nom: nomEmploye,
        Courriel: courrielEmploye,
        Mdp: mdpEmploye,
        Admin: admin? true :false
    }
    Employe.create(newEmploye);//creer nouvel employe
  }


    next(); // Move to the next middleware or route handler
};
module.exports = creerEmployeValidation;
