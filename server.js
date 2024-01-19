"use strict";
//dependencies
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const Documents = require('./Models/Document');
const Reservations = require('./Models/Reservation');
const Membre = require('./Models/Membre');
const Employes = require('./Models/Employe');
const Pret = require('./Models/Pret');

//Application settings
const app = express();
app.set('view engine' , 'ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
}));


mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1/PP2Port-Cartier', {useNewUrlParser: true})

//middlwares
const loginValidation = require('./Middleware/loginValidation')
const pretValidation = require('./Middleware/pretValidation')
const creerMembreValidation = require('./Middleware/creerMembreValidation');
const creerEmployeValidation = require('./Middleware/creerEmployeValidation');
const authenticate = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/');
    }
};
  

app.listen(3000, (req,res)=>{
    console.log('listening on port 3000')
})

//Application pages
const homePage = require('./Controller/login');//home page
const membrePage = require('./Controller/membre');//member UI page
const reservationsPage = require('./Controller/reservation');//resevations UI

///////////////// Routing /////////////////
//get requests 
app.get('/',homePage);//formulaire login
app.get('/membre/:name',authenticate, async (req,res)=>{//UI membre
  try {
    const { name } = req.params;
    const { 
      Categorie, 
      CodeDocument,
      Genre,
      Classement,
      Titre
    } = req.query; // Retrieve the query parameters
    const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
    
    let documents,description;
    
    if(Categorie != null){
      switch (Categorie) {//si la categorie genre n'est pas null
        case 'Livre':
            documents = await Documents.find({ Categorie: 'Livre' });
            break;
        case 'Film':
            documents = await Documents.find({ Categorie: 'Film' });
            break;
        case 'Jeux':
            documents = await Documents.find({ Categorie: 'Jeux' });
            break;
            case 'Musique':
            documents = await Documents.find({ Categorie: 'Musique' });
            break;
    }
    }else if(Genre != null){//si la requete genre n'est pas null
      documents = await Documents.find({ Genre: Genre });
    }else if(CodeDocument != null){//si la requete code document  n'est pas null
      documents = await Documents.find({ CodeDocument: CodeDocument });
      description = true;
    }else if(Classement != null){//si la requete classement  n'est pas null
      documents = await Documents.find({ Classement: Classement });;
    } else if(Titre != null){
      documents = await Documents.find({
        Titre : {$regex : req.query.Titre , $options:'i'}
      });
    }else{
      documents = await Documents.find({});
    }

    res.render('membre', {
        authenticated: req.session.authenticated,
        user: req.session.user,
        genres: uniqueGenres,
        documents: documents,
        description: description,
        baseURL: req.originalUrl
    });
    
} catch (error) {
    console.log(error);
    // Handle error rendering or redirection
}
})
app.get('/membre/:name/reserver/:CodeDocument', async (req, res) => {//pour faire reservation membre
  const { name, CodeDocument } = req.params;
  const document= CodeDocument.split('=')[1];
  
 try {
  // Update document's Reserve status
  const documentReserve = await Documents.findOneAndUpdate(
    { CodeDocument: document },
    { $set: { Reserve: true } },
    { new: true } // Retrieve the updated document
  );
  
  console.log('Updated Document:', documentReserve);
  
  const count = await Reservations.countDocuments();
  const currentDate = new Date();
  
  const reservation = {
    CodeReservation: `RES${(count+1).toLocaleString('en', { minimumIntegerDigits: 3 }).padStart(3, '0')}`,
    CodeMembre: req.session.user.CodeMembre,
    CodeDocument: documentReserve.CodeDocument,
    DateReservation: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
    'En cours': true,
  };

  console.log('Created Reservation:', reservation);
  // Create and save the reservation
  await Reservations.create(reservation);

  
  
 } catch (error) {
  
 }finally{
  res.redirect(`/membre/${req.params.name}`);
 
 }
  
});
app.get('/membre/:name/reservation', async(req,res)=>{//pour afficher reservation membre
  
  
      let documents = [];
      let reservations = await Reservations.find({CodeMembre : req.session.user.CodeMembre});
      const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
      
      for (const reservation of reservations) {
        let document = await Documents.findOne({ CodeDocument: reservation.CodeDocument });
        if (document) {
          documents.push(document);
        }
      }
      
      res.render('reservations', {
        authenticated: req.session.authenticated,
        user: req.session.user,
        genres:uniqueGenres,
        reservations:reservations,
        documents: documents,
        baseURL: req.originalUrl
    });
})

app.get('/employe/:name',authenticate, async (req,res)=>{//UI employe
  const { name } = req.params;
  const { 
    Categorie, 
    CodeDocument,
    Genre,
    Classement,
    Titre
  } = req.query; // Retrieve the query parameters
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
  
  let documents,description;
  
  if(Categorie != null){
    switch (Categorie) {//si la categorie genre n'est pas null
      case 'Livre':
          documents = await Documents.find({ Categorie: 'Livre' });
          break;
      case 'Film':
          documents = await Documents.find({ Categorie: 'Film' });
          break;
      case 'Jeux':
          documents = await Documents.find({ Categorie: 'Jeux' });
          break;
          case 'Musique':
          documents = await Documents.find({ Categorie: 'Musique' });
          break;
  }
  }else if(Genre != null){//si la requete genre n'est pas null
    documents = await Documents.find({ Genre: Genre });
  }else if(CodeDocument != null){//si la requete code document  n'est pas null
    documents = await Documents.find({ CodeDocument: CodeDocument });
    description = true;
  }else if(Classement != null){//si la requete classement  n'est pas null
    documents = await Documents.find({ Classement: Classement });;
  } else if(Titre != null){
    documents = await Documents.find({
      Titre : {$regex : req.query.Titre , $options:'i'}
    });
  }else{
    documents = await Documents.find({});
  }
  res.render('employe',{
        authenticated: req.session.authenticated,
        documents:documents,
        user: req.session.user,
        genres:uniqueGenres,
        description: description,
        baseURL: req.originalUrl
  })
});
app.get('/employe/:name/reservation', async(req,res)=>{//afficher toutes les reservations
  let documents = [];
  let reservations = await Reservations.find({});//recupere toutes les resvervations
  reservations.reverse();//filtre derniere a premiere
  let membre = await Membre.find({});//recupere tous les membres
  let employe = await Employes.find({});//recupere tous les employes
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
  
  for (const reservation of reservations) {//pour chaque reservations
    let document = await Documents.findOne({ CodeDocument: reservation.CodeDocument });//recuperer document associe
    if (document) {//si document trouve
      documents.push(document);//ajouter a la liste de documents
    }
  }
  
  res.render('reservationsEmploye', {
    authenticated: req.session.authenticated,
    user: req.session.user,
    employes: employe,
    membres:membre,
    genres:uniqueGenres,
    reservations:reservations,
    documents: documents,
    baseURL: req.originalUrl
});
})
app.get('/employe/:name/reserver/:CodeDocument',async(req,res)=>{//Pour reservation employe
  const { name, CodeDocument } = req.params;
  const document= CodeDocument.split('=')[1];
  
 try {
  // Update document's Reserve status
  const documentReserve = await Documents.findOneAndUpdate(
    { CodeDocument: document },
    { $set: { Reserve: true } },
    { new: true } // Retrieve the updated document
  );
  

  // Create a new reservation
  const count = await Reservations.countDocuments();
  const currentDate = new Date();
  const reservation = {
    CodeReservation: `RES${(count+1).toLocaleString('en', { minimumIntegerDigits: 3 }).padStart(3, '0')}`,
    CodeMembre: req.session.user.CodeEmploye,
    CodeDocument: documentReserve.CodeDocument,
    DateReservation: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
    'En cours': true,
  };
  await Reservations.create(reservation);
  res.redirect(`/employe/${req.params.name}`);
  } catch (error) {
    console.log(error)
  }

});
app.get('/employe/:name/annulerReservation', async(req,res)=>{//Pour annuler reservation
  const { name } = req.params;
    const { 
      CodeReservation
    } = req.query
    if(CodeReservation != null){
      try {
        let reservationAnnuler = await Reservations.findOne({ CodeReservation });

      if (reservationAnnuler) {
        // Update the 'En cours' property
        reservationAnnuler['En cours'] = false;
      }
        await reservationAnnuler.save();
        res.redirect(`/employe/${name}/reservation`)
      } catch (error) {
        console.log(error)
      }
    }
})
app.get('/employe/:name/pretRetour', async(req,res)=>{
  const { name } = req.params;//recupere nom employe
  
 try {
  let prets = await Pret.find({});//recupere tous les prets
  let documents = await Documents.find({});//recupere tous les documents
  let membres = await Membre.find({})//recupere tous les membres
  let employes = await Employes.find({})//recupere tous les employes
  let reservations = await Reservations.find({});//recupere toutes les reservations
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues

  const latePrets = prets.filter(pret => {//Pour chaue pret
    const dateFin = new Date(pret.DateFin);//recuperer date fin
    const dateRetour = new Date(pret.DateRetour);//recuperet date retour
    return dateRetour > dateFin;//si date retour apres date fin pret est en retard
});
 
    res.render('pretRetour',{
      authenticated: req.session.authenticated,
      user: req.session.user,
      reservations: reservations,
      avertir: null,
      reservationAvertir:null,
      prets: prets,
      latePrets:latePrets,
      genres:uniqueGenres,
      documents:documents,
      membres:membres,
      employes:employes
    })
 } catch (error) {
  console.log(error)
 }
});
app.get('/employe/:name/membres', async(req,res)=>{
  const { name } = req.params;
  const selectedMembre = req.query.selectedMembre;
  const telephone = req.query.Telephone;
  const codePret = req.query.CodePret; 
  let membreInfo,membrePret,membreReservation;
  if(codePret !=null){//si query pour codePret existe
    await Pret.findOneAndUpdate(
      { CodePret: codePret },
      { $set: { Actif: false } },
      { new: true } //
    )
  }

  if(selectedMembre != null && selectedMembre != " "){//recherhe par nom/code membre
    membreInfo = await Membre.findOne({
      CodeMembre : selectedMembre
    })
    membrePret = await Pret.find({
      CodeMembre: selectedMembre
    })
    membreReservation = await Reservations.find({
      CodeMembre: selectedMembre
    })
  }else if(telephone !=null && telephone.length === 12){//recherche pas telephone
    membreInfo = await Membre.findOne({
      Telephone : telephone
    })
    membrePret = await Pret.find({//recherche des prets
      CodeMembre: membreInfo.CodeMembre
    })
    membreReservation = await Reservations.find({//recherche des reservations
      CodeMembre: membreInfo.CodeMembre
    })
    
  }
  
  let prets = await Pret.find({});//recupere tous les prets
  let documents = await Documents.find({});//recupere tous les documents
  let membres = await Membre.find({})//recupere tous les membres
  let reservations = await Reservations.find({});//recupere toutes les reservations
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues

  res.render('listeMembres',{
    authenticated: req.session.authenticated,
    user: req.session.user,
    reservations: reservations,
    selectedMembre:membreInfo,
    membrePret: membrePret,
    membreReservation:membreReservation,
    prets: prets,
    genres:uniqueGenres,
    documents:documents,
    membres:membres,
  })
})
app.get('/employe/:name/creerUser', async (req,res)=>{
  const {name}= req.params

  let prets = await Pret.find({});//recupere tous les prets
  let documents = await Documents.find({});//recupere tous les documents
  let membres = await Membre.find({})//recupere tous les membres
  let reservations = await Reservations.find({});//recupere toutes les reservations
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
  
  res.render('creerUser', {
    authenticated: req.session.authenticated,
    user: req.session.user,
    prets: prets,
    genres:uniqueGenres,
    documents:documents,
    membres:membres,
});
})

/*
app.get('/membre/:name/rechercheTitre', async(req,res)=>{
  const document = await Documents.find({
    Titre : {$regex : req.query.search , $options:'i'}
})
res.render('rechercheTitre', {documents})
});*/


app.get('/logout', (req, res) => {//pour deconnection
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur fin de session:', err);
        res.status(500).send('Erreur fin de session');
      } else {
        res.clearCookie('connect.sid'); // Supprime les cookies
        res.redirect('/'); // Redirige page acceuil
      }
    });
  });


  

//post request
app.post('/membre/login', loginValidation);
app.post('/employe/login', loginValidation)
app.post('/employe/:name/creerPret',pretValidation,async(req,res)=>{
    
    const { name } = req.params;
    let documents = await Documents.find({});
    let membres = await Membre.find({});
    let employes = await Employes.find({});
    let reservations = await Reservations.find({});
    let reservationAvertir;
    let avertir;
    const uniqueGenres = await Documents.distinct('Genre');
    let prets = await Pret.find({});
    const latePrets = prets.filter(pret => {//Pour chaue pret
      const dateFin = new Date(pret.DateFin);//recuperer date fin
      const dateRetour = new Date(pret.DateRetour);//recuperet date retour
      return dateRetour > dateFin;//si date retour apres date fin pret est en retard
  });

    if (reservationAvertir) {
        avertir = true;
    } else {
        avertir = false;
    }

    res.render('pretRetour', {
        authenticated: req.session.authenticated,
        user: req.session.user,
        reservations: reservations,
        prets: prets,
        latePrets:latePrets,
        avertir: avertir,
        reservationAvertir: reservationAvertir,
        genres: uniqueGenres,
        documents: documents,
        membres: membres,
        employes: employes
    });
    
});
app.post("/employe/:name/retourner", async(req,res)=>{
  const{ name }= req.params
  const selectedCodePret = req.body.selectedCodePret;
  let avertir;
  
  let documents = await Documents.find({});//recupere tous les documents
  let membres = await Membre.find({})//recupere tous les membres
  let employes = await Employes.find({})//recupere tous les employes
  let reservations = await Reservations.find({});//recupere toutes les reservations
  let reservationAvertir;
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues

  let selectedPret = await Pret.find({CodePret : selectedCodePret});
  if(selectedPret){
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-indexed
    var day = String(today.getDate()).padStart(2, '0');
    const selectedPret = await Pret.findOneAndUpdate(
      { CodePret: selectedCodePret },
      { $set: { DateRetour:`${year}-${month}-${day}`, Actif: false } },
      { new: true } // 
  );
     reservationAvertir = await Reservations.findOne({
      CodeDocument: selectedPret.CodeDocument,
      "En cours" : true
    })
  
    if(reservationAvertir){
      avertir = true
    }else{
      avertir =false
    }
  }
  let prets = await Pret.find({});//recupere tous les prets
  res.render('pretRetour',{
    authenticated: req.session.authenticated,
    user: req.session.user,
    reservations: reservations,
    prets: prets,
    avertir: avertir,
    reservationAvertir: reservationAvertir,
    genres:uniqueGenres,
    documents:documents,
    membres:membres,
    employes:employes
  })
})
app.post('/employe/:name/creerMembre', creerMembreValidation, async (req,res)=>{

  const {name}= req.params

  let prets = await Pret.find({});//recupere tous les prets
  let documents = await Documents.find({});//recupere tous les documents
  let membres = await Membre.find({})//recupere tous les membres
  let reservations = await Reservations.find({});//recupere toutes les reservations
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
  console.log(req.session.user)
  res.render('creerUser', {
    authenticated: req.session.authenticated,
    user: req.session.user,
    prets: prets,
    genres:uniqueGenres,
    documents:documents,
    membres:membres,
});
})

app.post('/employe/:name/creerEmploye',creerEmployeValidation, async (req,res)=>{

  const {name}= req.params

  let prets = await Pret.find({});//recupere tous les prets
  let documents = await Documents.find({});//recupere tous les documents
  let membres = await Membre.find({})//recupere tous les membres
  let reservations = await Reservations.find({});//recupere toutes les reservations
  const uniqueGenres = await Documents.distinct('Genre');//Recupere les genres unqiues
  console.log(req.session.user)
  res.render('creerUser', {
    authenticated: req.session.authenticated,
    user: req.session.user,
    prets: prets,
    genres:uniqueGenres,
    documents:documents,
    membres:membres,
});
})


