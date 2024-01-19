const Membre= require('../Models/Membre');
const validator = require('validator');
const creerMembreValidation = async (req, res, next) => {
    const formFields = ['Nom', 'Prenom', 'Adresse', 'Telephone', 'Courriel', 'Mdp'];//recupere les champs
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;//regex email
    let membreValide = true;//membre valide
    let errors = [];

  for (const field of formFields) {//pour chaque champs de la liste
    if (!req.body[field]) {// si le champs est vide
      errors.push(`Erreur: ${field} est vide.`);//ajoute erreur a la liste
      membreValide = false;//membre non valide
    }
    if (field === 'courriel' && !validator.isEmail(req.body[field])) {//si courriel invalide
        errors.push(`Erreur: ${field} n'est pas un courriel valide.`);//ajoute l'erreur
        membreValide = false;//membre invalide
      }
  }
  if(!membreValide && errors.length >0){// si membre invalide et au moins 1 erreur
    return res.status(400).send( `Liste des erreures:' ${errors}`);//affiche liste des erreurs
  } else if(membreValide){//sinon
    let count = await Membre.countDocuments();//recupere le nombre de membre
    let newMembre = {//creer objet membre
        CodeMembre: `MBR${(count + 1).toLocaleString('en', { minimumIntegerDigits: 3 }).padStart(3, '0')}`,
    };
    // loop des donnes 
  for (const field of formFields) {//pour chaque champs
    if (field === 'Telephone') {
      newMembre[field] = req.body[field];
    } else if (field === 'Courriel') {
      newMembre[field] = req.body[field];
    } else {
      newMembre[field] = req.body[field];//ajoute le champ au newMembre
    }
  }
  await Membre.create(newMembre);//creer le membre

  }


    next(); // Move to the next middleware or route handler
};
module.exports = creerMembreValidation;
