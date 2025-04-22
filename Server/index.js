const express = require('express');
const app = express();

//allow gpt key to be imported
require('dotenv').config({ path: './config.env' });
const { generateRiddle } = require('./GPT-riddler/gpt.js');

//import the sqlite3 needed to interact with the database
const sqlite3 = require('sqlite3').verbose();
let sql;

//connect to the database 
const database = new sqlite3.Database('./city.db', sqlite3.OPEN_READWRITE,(err)=> {
  if (err) return console.error(err.message);
});

//function to get a random city
function getRandomCity() {
  return new Promise((resolve, reject) => {
    database.get("SELECT * FROM cities ORDER BY RANDOM() LIMIT 1", (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

//function to get the data for a specific city
function getCityData(cityName) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM cities WHERE city_name = ?";
    database.get(sql, [cityName], (err, row) => {
      if (err) reject(err);
      else if (!row) reject(new Error("city not found."));
      else resolve(row);
    });
  });
}


//function to figure out city distance 
function findDistance(city1, city2) {
  return new Promise((resolve, reject) => {
    try {
      const toRadians = (degrees) => degrees * (Math.PI / 180);

      const R = 6371; // Earth's radius in kilometers
      const lat1 = toRadians(Number(city1.lat));
      const lat2 = toRadians(Number(city2.lat));
      const dLat = toRadians(Number(city2.lat) - Number(city1.lat));
      const dLon = toRadians(Number(city2.long) - Number(city1.long));
      

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      resolve(distance); // return distance in kilometers
    } catch (error) {
      reject(error);
    }
  });
}


//taking in input for testing purposes
const readline = require('readline');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}
//functions for front end client to use:
app.listen(5000, () => {console.log("Server started on port 5000")});

app.get("/api/getRandomCity", async (req, res) => {
  const city = await getRandomCity();
  res.json(city);
});

app.get("/api/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const city = await getCityData(name);
    res.json(city);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});


app.post("/api/distance", express.json(), async (req, res) => {
  const { city1, city2 } = req.body;
  const distance = await findDistance(city1, city2);
  res.json({distance});
});

app.post("/api/generateRiddle", express.json(), async (req, res) => {
  const { cityName } = req.body;
  try {
    const riddle = await generateRiddle(cityName);
    res.json({ riddle });
  } catch (err) {
    console.error("GPT error:", err.message);
    res.status(500).json({ error: "Failed to generate riddle." });
  }
});

//console.log("API key:", process.env.OPENAI_API_KEY);

/*

async function main() {

  const selectedCity = await getRandomCity();
  console.log("Selected city:", selectedCity.city_name);

  const riddle = await generateRiddle(selectedCity.city_name);
  console.log("Generated riddle:", riddle);
  //take input 
  const Name  = await askQuestion("Enter a city name: ");
  //finding data for the city that was guessed
  const Guesscity = await getCityData(Name);
  //checking data
  console.log(Guesscity);
  console.log(selectedCity);

  if(Guesscity.city_name == selectedCity.city_name) {
    console.log("Congrats you guessed correctly!");
  } else {
    const distance = await findDistance(Guesscity, selectedCity); 
    console.log("Distance from city:", distance);
  }
}

main(); 
*/

//DATA BASE SCHEMA

// Everything below this is me coding the framework for the nodejs and sqlite interaction:



//const sqlite3 = require('sqlite3').verbose();
//let sql;

//connect to the database 
/*
const database = new sqlite3.Database('./city.db', sqlite3.OPEN_READWRITE,(err)=> {
  if (err) return console.error(err.message);
});

//we will create a table 
sql = 'CREATE TABLE cities(id INTEGER PRIMARY KEY, city_name, language, lat, long)';
database.run(sql);


// All the cities I want in my game: 
const cityData = [
["Toronto", "English", 43.6532, -79.3832],
["Paris", "French", 48.8566, 2.3522],
["Tokyo", "Japanese", 35.6895, 139.6917],
["New York", "English", 40.7128, -74.0060],
["Delhi", "Hindi", 28.6139, 77.2090],
["London", "English", 51.5074, -0.1278],
["Cairo", "Arabic", 30.0444, 31.2357],
["Sydney", "English", -33.8688, 151.2093],
["Moscow", "Russian", 55.7558, 37.6173],
["São Paulo", "Portuguese", -23.5505, -46.6333],
["Beijing", "Mandarin", 39.9042, 116.4074],
["Los Angeles", "English", 34.0522, -118.2437],
["Istanbul", "Turkish", 41.0082, 28.9784],
["Mexico City", "Spanish", 19.4326, -99.1332],
["Mumbai", "Marathi", 19.0760, 72.8777],
["Bangkok", "Thai", 13.7563, 100.5018],
["Buenos Aires", "Spanish", -34.6037, -58.3816],
["Seoul", "Korean", 37.5665, 126.9780],
["Jakarta", "Indonesian", -6.2088, 106.8456],
["Lagos", "English", 6.5244, 3.3792],
["Tehran", "Persian", 35.6892, 51.3890],
["Kinshasa", "French", -4.4419, 15.2663],
["Chicago", "English", 41.8781, -87.6298],
["Lima", "Spanish", -12.0464, -77.0428],
["Bogotá", "Spanish", 4.7110, -74.0721],
["Ho Chi Minh City", "Vietnamese", 10.8231, 106.6297],
["Baghdad", "Arabic", 33.3152, 44.3661],
["Riyadh", "Arabic", 24.7136, 46.6753],
["Santiago", "Spanish", -33.4489, -70.6693],
["Madrid", "Spanish", 40.4168, -3.7038],
["Dhaka", "Bengali", 23.8103, 90.4125],
["Khartoum", "Arabic", 15.5007, 32.5599],
["Nairobi", "English", -1.2921, 36.8219],
["Caracas", "Spanish", 10.4806, -66.9036],
["Manila", "Filipino", 14.5995, 120.9842],
["Kuala Lumpur", "Malay", 3.1390, 101.6869],
["Berlin", "German", 52.5200, 13.4050],
["Rome", "Italian", 41.9028, 12.4964],
["Hanoi", "Vietnamese", 21.0285, 105.8542],
["Casablanca", "Arabic", 33.5731, -7.5898],
["Barcelona", "Catalan", 41.3851, 2.1734],
["Addis Ababa", "Amharic", 9.1450, 38.7170],
["Yangon", "Burmese", 16.8409, 96.1735],
["Amman", "Arabic", 31.9539, 35.9106],
["Jeddah", "Arabic", 21.4858, 39.1925],
["Kabul", "Dari", 34.5553, 69.2075],
["Doha", "Arabic", 25.276987, 51.520008],
["Abu Dhabi", "Arabic", 24.4539, 54.3773],
["Tunis", "Arabic", 36.8065, 10.1815],
["Bucharest", "Romanian", 44.4268, 26.1025],
["Lisbon", "Portuguese", 38.7169, -9.1399],
["Anchorage", "English", 61.2181, -149.9003],
["Honolulu", "English", 21.3069, -157.8583],
["Quebec City", "French", 46.8139, -71.2082],
["Vancouver", "English", 49.2827, -123.1207],
["Calgary", "English", 51.0447, -114.0719],
["Edmonton", "English", 53.5461, -113.4938],
["Halifax", "English", 44.6488, -63.5752],
["Winnipeg", "English", 49.8951, -97.1384],
["Ottawa", "English", 45.4215, -75.6972],
["Baltimore", "English", 39.2904, -76.6122],
["Boston", "English", 42.3601, -71.0589],
["Philadelphia", "English", 39.9526, -75.1652],
["San Diego", "English", 32.7157, -117.1611],
["Dallas", "English", 32.7767, -96.7970],
["Houston", "English", 29.7604, -95.3698],
["Phoenix", "English", 33.4484, -112.0740],
["San Antonio", "English", 29.4241, -98.4936],
["Austin", "English", 30.2672, -97.7431],
["Denver", "English", 39.7392, -104.9903],
["Seattle", "English", 47.6062, -122.3321],
["Portland", "English", 45.5051, -122.6750],
["Minneapolis", "English", 44.9778, -93.2650],
["Detroit", "English", 42.3314, -83.0458],
["Charlotte", "English", 35.2271, -80.8431],
["Atlanta", "English", 33.7490, -84.3880],
["Tampa", "English", 27.9506, -82.4572],
["Orlando", "English", 28.5383, -81.3792],
["Miami", "English", 25.7617, -80.1918],
["Pittsburgh", "English", 40.4406, -79.9959],
["Cleveland", "English", 41.4993, -81.6944],
["Cincinnati", "English", 39.1031, -84.5120],
["Indianapolis", "English", 39.7684, -86.1581],
["St. Louis", "English", 38.6270, -90.1994],
["Kansas City", "English", 39.0997, -94.5786],
["Salt Lake City", "English", 40.7608, -111.8910],
["Las Vegas", "English", 36.1699, -115.1398],
["New Orleans", "English", 29.9511, -90.0715],
["Memphis", "English", 35.1495, -90.0490],
["Nashville", "English", 36.1627, -86.7816],
["Louisville", "English", 38.2527, -85.7585],
["Milwaukee", "English", 43.0389, -87.9065],
["Columbus", "English", 39.9612, -82.9988],
["Raleigh", "English", 35.7796, -78.6382],
["Richmond", "English", 37.5407, -77.4360],
["Norfolk", "English", 36.8508, -76.2859],
["Albuquerque", "English", 35.0844, -106.6504],
["El Paso", "English", 31.7619, -106.4850],
["Fresno", "English", 36.7378, -119.7871],
["Sacramento", "English", 38.5816, -121.4944],
["San Jose", "English", 37.3382, -121.8863],
["Tucson", "English", 32.2226, -110.9747],
["Mesa", "English", 33.4152, -111.8315],
["Omaha", "English", 41.2565, -95.9345],
["Wellington", "English", -41.2865, 174.7762],
["Auckland", "English", -36.8485, 174.7633],
["Christchurch", "English", -43.5321, 172.6362],
["Dunedin", "English", -45.8788, 170.5028],
["Hobart", "English", -42.8821, 147.3272],
["Adelaide", "English", -34.9285, 138.6007],
["Brisbane", "English", -27.4698, 153.0251],
["Perth", "English", -31.9505, 115.8605],
["Canberra", "English", -35.2809, 149.1300],
["Gold Coast", "English", -28.0167, 153.4000],
["Darwin", "English", -12.4634, 130.8456],
["Hiroshima", "Japanese", 34.3853, 132.4553],
["Fukuoka", "Japanese", 33.5904, 130.4017],
["Osaka", "Japanese", 34.6937, 135.5023],
["Kyoto", "Japanese", 35.0116, 135.7681],
["Nagoya", "Japanese", 35.1815, 136.9066],
["Sendai", "Japanese", 38.2682, 140.8694],
["Sapporo", "Japanese", 43.0618, 141.3545],
["Okayama", "Japanese", 34.6551, 133.9195],
["Kobe", "Japanese", 34.6901, 135.1955],
["Nagasaki", "Japanese", 32.7503, 129.8777],
["Okinawa", "Japanese", 26.3344, 127.8056],
["Busan", "Korean", 35.1796, 129.0756],
["Daegu", "Korean", 35.8714, 128.6014],
["Incheon", "Korean", 37.4563, 126.7052],
["Gwangju", "Korean", 35.1595, 126.8526],
["Daejeon", "Korean", 36.3504, 127.3845],
["Ulsan", "Korean", 35.5384, 129.3114],
["Jeju", "Korean", 33.4996, 126.5312],
["Sejong", "Korean", 36.4800, 127.2897],
["Suva", "English", -18.1248, 178.4501],
["Nukuʻalofa", "Tongan", -21.1394, -175.2018],
["Apia", "Samoan", -13.8333, -171.7667],
["Port Moresby", "English", -9.4780, 147.1500],
["Honiara", "English", -9.4319, 159.9563],
["Nouméa", "French", -22.2558, 166.4505],
["Pago Pago", "Samoan", -14.2756, -170.7020],
];

//insert data into the database
sql = 'INSERT INTO cities(city_name, language, lat, long) VALUES (?,?,?,?)'

cityData.forEach(city => {
  database.run(sql, city, (err) => {
    if(err) return console.error(err.message);
    console.log(`✅ Inserted: ${city[0]}`);
  });
});


// View all rows from the cities table
database.all("SELECT * FROM cities", (err, rows) => {
  if (err) return console.error(" Error reading from database:", err.message);
  console.log(" All cities in the database:");
  console.table(rows); // Pretty prints the rows in a table format
}); */



