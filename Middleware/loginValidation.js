const Membre = require('../Models/Membre');
const Employe = require('../Models/Employe');
const session = require('express-session');
const validateFormMembre = async (req, res, next) => {
  const errors = [];//array de sauvegarde d'erreur
  const reqURL = req.url;//recupere l"URL action du formulaire
  let  redirectURL = '';//creer URL de redirection


  try {
    const { Courriel, Mdp } = req.body;//recupere les donnees du formulaire
    var existingCompte;
   

    switch(reqURL){
      case '/membre/login':
        if (!Courriel || !Mdp) {//si une des entrees vide
          errors.push('Tous les champs sont requis');//creer message erreur
        } else {//sinon
           existingCompte= await Membre.findOne({ Courriel,Mdp });//cherche pour un membre existant
          if(existingCompte === null){//si le membre n'existe pas
            errors.push('Les information sont incorrectes')//creer message erreur
          }
        }
        redirectURL = '/membre/';
      break 
      case '/employe/login':
        
        if (!Courriel || !Mdp) {//si une des entrees vide
          errors.push('Tous les champs sont requis');//creer message erreur
        } else {//sinon
           existingCompte= await Employe.findOne({ Courriel,Mdp });//cherche pour un membre existant
          if(existingCompte === null){//si le membre n'existe pas
            errors.push('Les information sont incorrectes')//creer message erreur
          }
        }
        redirectURL = '/employe/';
      break
    }
    
 /* if(reqURL === '/membre/login'){//Si URL du formulaire membre

   
  }
  if(reqURL === '/employe/login'){//sinon URL du formulaire employe
   
  }*/


    if (errors.length > 0) {//si des erreurs sont crees
      return res.render('login', { errors });//affiche l'(es) erreur(s)
    }else {//sinon
      req.session.authenticated = true;//debut de session utilisateur
      req.session.user = existingCompte;//sauve le user
      const prenom = req.session.user.Prenom;
      const nom = req.session.user.Nom;
      redirectURL = redirectURL + prenom + nom;
      
      res.redirect(`${redirectURL}`);
    }

    
    
  } catch (error) {
    console.error(error);//affiche erreur
    res.status(500).send('Server Error');//creer statut erreur
    //faire une page erreur.ejs pour afficher les bonnes erreurs
  }
};

module.exports = validateFormMembre;
