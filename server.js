// - - - - - - - Setup - - - - - - - -

// Importeer het npm pakket express uit de node_modules map
import express from "express";
import fetchJson from "./helpers/fetch-json.js";

// Stel het basis endpoint in
const apiUrl = "https://fdnd-agency.directus.app/items/"
const apiProfile = (apiUrl + 'oba_profile')
const apiFamily = (apiUrl + 'oba_family')
const apiItem = (apiUrl + 'oba_item')

// Maak een nieuwe express app aan
const app = express();

// Stel ejs in als template engine
app.set("view engine", "ejs");

// Stel de map met ejs templates in
app.set("views", "./views");

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))


// - - - - - - - Routing - - - - - - - -


// - - - - GET Route voor login pagina - - - - 

app.get('/', function(request, response) {
  response.render('login');
});


// - - - - POST-route voor het afhandelen van het indienen van inlogformulier - - - -

app.post('/login', async function(request, response) {
  const username = request.body.username;
  try {
    // De fetchJson-functie doet een HTTP-verzoek aan een API-endpoint en retourneert JSON-gegevens.
    const profiles = await fetchJson(apiProfile);
    /* profiles bevat data over members {"id":2,"family_id":1,"name":"Daan", etc. . . }
     find() zoekt het eerste profiel uit de profiles.data waarvan de naam 
     (in kleine letters) overeenkomt met de ingevoerde username (ook in kleine letters). */
    const user = profiles.data.find(profile => profile.name.toLowerCase() === username.toLowerCase());

    if (user) {
      response.redirect(`/profile/${user.id}`);
    } else {
      response.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - GET Route voor profile page - - - -

app.get('/profile/:id', async function(request, response) {
  /* Functie request.params.id geeft de waarde van id terug (bijv. 2)
   Het maakt een URL met een filterqueryparameter om alleen  
   data van item met de specifieke ID op te halen. */
  const userId = request.params.id;
  try {
    const profileResponse = await fetchJson(`${apiProfile}?filter={"id":${userId}}`);
    const user = profileResponse.data[0];

    if (user) {
      response.render('profile_page', {
        user: user,
        userId: userId // Передаем userId
      });
    } else {
      response.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - GET route voor HEAD - - - -

app.get('/partials/head/:id', async function(request, response) {
  const userId = request.params.id;
  try {
    response.render('head', {
      userId: userId
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - GET route voor personal page (persoonelijke overzichtspagina) - - - -

app.get('/personal_page/:id', async function(request, response) {
  const userId = request.params.id;
  /* Ik geef informatie over user met specifieke id door
  om personal page aan te passen (bijvoorbeeld de naam van user
  in de welkom bericht). */
  const profileResponse = await fetchJson(`${apiProfile}?filter={"id":${userId}}`);
  const user = profileResponse.data[0];
  try {
    const items = await fetchJson(apiItem);

    response.render('personal_page', {
      data: items.data,
      user: user,
      userId: userId 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - GET route voor detail pagina (informatie over objecten uit de bibl.) - - - -

// Het :id is routeparameter in URL, die aangeeft dat het eindpunt 
// een id-parameter in de URL verwacht.
app.get('/detail/:id', function(request, response){
  // Functie request.params.id geeft de waarde van id terug. 
  // Het maakt een URL met een filterqueryparameter om alleen  
  // data van item met de specifieke ID op te halen.
  // Fetch data uit API gebasseerd op id parameter :
  fetchJson(apiItem + '?filter={"id":' + request.params.id + '}')
    .then((items) => {
      // Preprocess data door onnodige <h2> en <strong> tags uit de description te verwijderen
      items.data.forEach(item => {
        if (item.description) {
          item.description = item.description.replace(/<\/?h2[^>]*>/g, '').replace('Samenvatting', '');;
        }
      });
      // Render 'detail' met processed data
      response.render('detail', {
        items: items.data
      });
  })
})


// - - - - GET route voor de family pagina - - - -

/* Binnen de routehandler app.get() worden twee asynchrone requests 
gedaan met behulp van fetchJson om gegevens op te halen van twee 
verschillende API-eindpunten: apiFamily en apiProfile. */
app.get('/family_page/:id', async function(request, response) {
  const userId = request.params.id;
  // try...catch block, wordt gebruikt om fouten af te handelen die kunnen optreden binnen het try-blok.
  try {
    const families = await fetchJson(apiFamily);
    const profiles = await fetchJson(apiProfile);

  /* .data bevat gegevens die door de API worden geretourneerd.
  console.log wordt gebruikt om raw fetched data te tonen in de terminal: */
    console.log("API Response", families.data);
    console.log("API Response", profiles.data);
  /*.data eigenschap van families en profiles objects wordt verder gebruikt 
  bij rendering van family pagina. */
    response.render('family_page', {
      families: families.data,
      profiles: profiles.data,
      userId: userId 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// - - - - - - - Start webserver - - - - - - - -

// Stel het poortnummer in waar express op moet gaan luisteren
app.set("port", process.env.PORT || 8003);

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
