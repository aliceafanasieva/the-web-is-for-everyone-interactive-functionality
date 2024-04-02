// - - - - - - - Setup - - - - - - - -

// Importeer het npm pakket express uit de node_modules map
import express from "express";

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from "./helpers/fetch-json.js";

// Stel het basis endpoint in
const apiUrl = "https://fdnd-agency.directus.app/items/"
const apiFamily = (apiUrl + 'oba_family')
const apiProfile = (apiUrl + 'oba_profile')
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

// De fetchJson-functie doet een HTTP-verzoek aan een API-endpoint en retourneert JSON-gegevens.

// --- GET route voor de index (homepagina) ---
/* Binnen de routehandler app.get() worden twee asynchrone requests gedaan
 met behulp van fetchJson om gegevens op te halen van twee verschillende
 API-eindpunten: apiFamily en apiProfile.
*/
app.get('/', async function(request, response) {
  // try...catch block, wordt gebruikt om fouten af te handelen die kunnen optreden binnen het try-blok.
  try {
    const families = await fetchJson(apiFamily);
    const profiles = await fetchJson(apiProfile);

    // .data bevat gegevens die door de API worden geretourneerd.
    // console.log wordt gebruikt om raw fetched data te tonen in de terminal.
    //console.log("API Response", families.data);
    //console.log("API Response", profiles.data);

    // .data eigenschap van families en profiles objects wordt verder gebruikt bij rendering van index pagina.
    response.render('index', {
      families: families.data,
      profiles: profiles.data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});


// --- GET route voor de overview (persoonelijke overzichtspagina) ---
app.get('/overview', async function(request, response) {
  try {
    const items = await fetchJson(apiItem);
    const profiles = await fetchJson(apiProfile);

    //console.log("API Response items:", items.data);
    //console.log("API Response", profiles.data);

    response.render('overview', {
      data: items.data,
      profiles: profiles.data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    response.status(500).send('Internal Server Error');
  }
});

// --- Get route voor details pagina (gedetaileerde informatie over objecten uit de bibliotheek) ---

// Het :id is routeparameter in URL, die aangeeft dat het eindpunt 
// een id-parameter in de URL verwacht.
app.get('/detail/:id', function(request, response){
  console.log("Request: ", request.params.id)
  // Functie request.params.id geeft de waarde van id terug. 
  // Het maakt een URL met een filterqueryparameter om alleen  
  // data van item met de specifieke ID op te halen.
  // Fetch data uit API gebasseerd op id parameter :
  fetchJson(apiItem + '?filter={"id":' + request.params.id + '}')
    .then((items) => {
      console.log("API response data:", items.data)

      // Preprocess data door onnodige <h2> en <strong> tags uit de description te verwijderen
      items.data.forEach(item => {
        if (item.description) {
          item.description = item.description.replace(/<\/?h2[^>]*>/g, '').replace('Samenvatting', '');;
        }
      });
      console.log("API response data:", items.data)

      // Render 'detail' met processed data
      response.render('detail', {
        items: items.data
      });
  })
})

// - - - - - - - Start webserver - - - - - - - -

// Stel het poortnummer in waar express op moet gaan luisteren
app.set("port", process.env.PORT || 8003);


// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
