/* =====================================================================
   DreamTrail - script.js  (Version 2)
   ---------------------------------------------------------------------
   This file is the BRAIN of the website. It:
     - stores the bucket list in an ARRAY of OBJECTS (saved in localStorage)
     - draws a realistic 3D Earth (globe.gl + real satellite photos)
     - gets REAL live data from free public APIs (no backend, no keys):
         Open-Meteo      -> live weather, forecast, air quality, local time
         OpenStreetMap   -> place search, reverse geocoding, real hotels
         OSRM            -> real road distance and driving time
         Wikipedia       -> real places nearby + popularity (page views)
         ExchangeRate-API-> live currency rates
     - calculates trip cost ESTIMATES (clearly labelled as estimates)
     - runs a small AI travel assistant (rule-based language understanding)
   Every section below starts with a "PART" heading so it is easy to find.
   ===================================================================== */


/* =====================================================================
   PART 1: FIXED DATA
   ===================================================================== */

// Sample bucket list shown on the first visit (real places, real coordinates)
const SAMPLE_DATA = [
  { id: 1, name: "Taj Mahal", country: "India", cc: "IN", continent: "Asia", lat: 27.1751, lng: 78.0421,
    year: 2026, travelDate: "", budget: 25000, saved: 25000, status: "visited",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_(Edited).jpeg?width=640",
    note: "See the white marble glow at sunrise.", visited: true, visitedOn: "2026-03-12", prep: {} },
  { id: 2, name: "Eiffel Tower", country: "France", cc: "FR", continent: "Europe", lat: 48.8584, lng: 2.2945,
    year: 2027, travelDate: "2027-05-15", budget: 180000, saved: 65000, status: "planning",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Tour_Eiffel_Wikimedia_Commons.jpg?width=640",
    note: "Dinner with a view of Paris lights.", visited: false, visitedOn: "", prep: {} },
  { id: 3, name: "Grand Canyon", country: "United States", cc: "US", continent: "Americas", lat: 36.1069, lng: -112.1129,
    year: 2030, travelDate: "", budget: 250000, saved: 40000, status: "dream",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Grand_Canyon_view_from_Pima_Point_2010.jpg?width=640",
    note: "Hike the South Rim trail.", visited: false, visitedOn: "", prep: {} },
  { id: 4, name: "Northern Lights, Tromsø", country: "Norway", cc: "NO", continent: "Europe", lat: 69.6492, lng: 18.9553,
    year: 2029, travelDate: "", budget: 220000, saved: 30000, status: "dream",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Aurora_borealis_above_Lyngenfjorden,_2012_March.jpg?width=640",
    note: "Watch the sky dance in green.", visited: false, visitedOn: "", prep: {} },
  { id: 5, name: "Great Wall of China", country: "China", cc: "CN", continent: "Asia", lat: 40.4319, lng: 116.5704,
    year: 2028, travelDate: "2028-04-10", budget: 120000, saved: 90000, status: "booked",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Great_Wall_of_China_at_Jinshanling.jpg?width=640",
    note: "Walk on a wonder of the world.", visited: false, visitedOn: "", prep: {} },
  { id: 6, name: "Maasai Mara Safari", country: "Kenya", cc: "KE", continent: "Africa", lat: -1.4061, lng: 35.0089,
    year: 2031, travelDate: "", budget: 300000, saved: 15000, status: "dream",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Serengeti_Elefantenherde1.jpg?width=640",
    note: "See the great wildebeest migration.", visited: false, visitedOn: "", prep: {} },
  { id: 7, name: "Sydney Opera House", country: "Australia", cc: "AU", continent: "Oceania", lat: -33.8568, lng: 151.2153,
    year: 2030, travelDate: "", budget: 260000, saved: 50000, status: "dream",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Australia._(21339175489).jpg?width=640",
    note: "Watch a show by the harbour.", visited: false, visitedOn: "", prep: {} }
];

// Famous destinations shown as orange dots on the globe.
// Only real facts: real coordinates, the real country, the best months to visit
// (well-known travel seasons) and the matching Wikipedia article title.
const CITIES = [
  { id: "agra", name: "Taj Mahal, Agra", cc: "IN", lat: 27.1751, lng: 78.0421, tags: ["heritage"], best: [10, 11, 12, 1, 2, 3], wiki: "Taj Mahal" },
  { id: "goa", name: "Goa", cc: "IN", lat: 15.2993, lng: 74.1240, tags: ["beach"], best: [11, 12, 1, 2, 3], wiki: "Goa" },
  { id: "manali", name: "Manali", cc: "IN", lat: 32.2432, lng: 77.1892, tags: ["mountain", "snow"], best: [3, 4, 5, 6, 10, 12, 1], wiki: "Manali, Himachal Pradesh" },
  { id: "jaipur", name: "Jaipur", cc: "IN", lat: 26.9124, lng: 75.7873, tags: ["heritage", "city"], best: [10, 11, 12, 1, 2, 3], wiki: "Jaipur" },
  { id: "leh", name: "Leh, Ladakh", cc: "IN", lat: 34.1526, lng: 77.5771, tags: ["mountain"], best: [6, 7, 8, 9], wiki: "Leh" },
  { id: "munnar", name: "Munnar, Kerala", cc: "IN", lat: 10.0889, lng: 77.0595, tags: ["nature", "mountain"], best: [9, 10, 11, 12, 1, 2, 3], wiki: "Munnar" },
  { id: "varanasi", name: "Varanasi", cc: "IN", lat: 25.3176, lng: 82.9739, tags: ["heritage"], best: [10, 11, 12, 1, 2, 3], wiki: "Varanasi" },
  { id: "kathmandu", name: "Kathmandu", cc: "NP", lat: 27.7172, lng: 85.3240, tags: ["mountain", "heritage"], best: [3, 4, 5, 10, 11], wiki: "Kathmandu" },
  { id: "paro", name: "Paro, Bhutan", cc: "BT", lat: 27.4305, lng: 89.4133, tags: ["mountain", "heritage"], best: [3, 4, 5, 10, 11, 12], wiki: "Paro, Bhutan" },
  { id: "dubai", name: "Dubai", cc: "AE", lat: 25.2048, lng: 55.2708, tags: ["city"], best: [11, 12, 1, 2, 3], wiki: "Dubai" },
  { id: "bangkok", name: "Bangkok", cc: "TH", lat: 13.7563, lng: 100.5018, tags: ["city"], best: [11, 12, 1, 2], wiki: "Bangkok" },
  { id: "bali", name: "Bali", cc: "ID", lat: -8.4095, lng: 115.1889, tags: ["beach", "nature"], best: [4, 5, 6, 7, 8, 9, 10], wiki: "Bali" },
  { id: "singapore", name: "Singapore", cc: "SG", lat: 1.2834, lng: 103.8607, tags: ["city"], best: [2, 3, 4, 7, 8], wiki: "Singapore" },
  { id: "maldives", name: "Malé, Maldives", cc: "MV", lat: 4.1755, lng: 73.5093, tags: ["beach"], best: [12, 1, 2, 3, 4], wiki: "Maldives" },
  { id: "halong", name: "Ha Long Bay", cc: "VN", lat: 20.9101, lng: 107.1839, tags: ["nature"], best: [3, 4, 5, 9, 10, 11], wiki: "Ha Long Bay" },
  { id: "tokyo", name: "Tokyo", cc: "JP", lat: 35.6762, lng: 139.6503, tags: ["city"], best: [3, 4, 5, 10, 11], wiki: "Tokyo" },
  { id: "seoul", name: "Seoul", cc: "KR", lat: 37.5665, lng: 126.9780, tags: ["city"], best: [4, 5, 9, 10, 11], wiki: "Seoul" },
  { id: "greatwall", name: "Great Wall (Mutianyu)", cc: "CN", lat: 40.4319, lng: 116.5704, tags: ["heritage"], best: [4, 5, 9, 10], wiki: "Mutianyu" },
  { id: "paris", name: "Paris", cc: "FR", lat: 48.8566, lng: 2.3522, tags: ["city", "heritage"], best: [4, 5, 6, 9, 10], wiki: "Paris" },
  { id: "london", name: "London", cc: "GB", lat: 51.5072, lng: -0.1276, tags: ["city"], best: [5, 6, 7, 8, 9], wiki: "London" },
  { id: "rome", name: "Rome", cc: "IT", lat: 41.9028, lng: 12.4964, tags: ["heritage", "city"], best: [4, 5, 9, 10], wiki: "Rome" },
  { id: "interlaken", name: "Interlaken, Swiss Alps", cc: "CH", lat: 46.6863, lng: 7.8632, tags: ["mountain", "snow"], best: [6, 7, 8, 9, 12, 1, 2], wiki: "Interlaken" },
  { id: "santorini", name: "Santorini", cc: "GR", lat: 36.3932, lng: 25.4615, tags: ["beach"], best: [5, 6, 9, 10], wiki: "Santorini" },
  { id: "istanbul", name: "Istanbul", cc: "TR", lat: 41.0082, lng: 28.9784, tags: ["heritage", "city"], best: [4, 5, 9, 10, 11], wiki: "Istanbul" },
  { id: "tromso", name: "Tromsø (Northern Lights)", cc: "NO", lat: 69.6492, lng: 18.9553, tags: ["snow", "nature"], best: [10, 11, 12, 1, 2, 3], wiki: "Tromsø" },
  { id: "giza", name: "Giza Pyramids", cc: "EG", lat: 29.9792, lng: 31.1342, tags: ["heritage"], best: [10, 11, 12, 1, 2, 3, 4], wiki: "Giza pyramid complex" },
  { id: "capetown", name: "Cape Town", cc: "ZA", lat: -33.9249, lng: 18.4241, tags: ["beach", "nature"], best: [11, 12, 1, 2, 3], wiki: "Cape Town" },
  { id: "maasaimara", name: "Maasai Mara", cc: "KE", lat: -1.4061, lng: 35.0089, tags: ["nature"], best: [7, 8, 9, 10], wiki: "Maasai Mara" },
  { id: "newyork", name: "New York City", cc: "US", lat: 40.7128, lng: -74.0060, tags: ["city"], best: [4, 5, 6, 9, 10, 11], wiki: "New York City" },
  { id: "grandcanyon", name: "Grand Canyon", cc: "US", lat: 36.1069, lng: -112.1129, tags: ["nature"], best: [3, 4, 5, 9, 10, 11], wiki: "Grand Canyon" },
  { id: "banff", name: "Banff", cc: "CA", lat: 51.1784, lng: -115.5708, tags: ["mountain", "snow", "nature"], best: [6, 7, 8, 9, 12, 1, 2], wiki: "Banff, Alberta" },
  { id: "machupicchu", name: "Machu Picchu", cc: "PE", lat: -13.1631, lng: -72.5450, tags: ["heritage", "mountain"], best: [4, 5, 6, 7, 8, 9, 10], wiki: "Machu Picchu" },
  { id: "rio", name: "Rio de Janeiro", cc: "BR", lat: -22.9068, lng: -43.1729, tags: ["beach", "city"], best: [12, 1, 2, 3, 4, 5], wiki: "Rio de Janeiro" },
  { id: "sydney", name: "Sydney", cc: "AU", lat: -33.8688, lng: 151.2093, tags: ["city", "beach"], best: [9, 10, 11, 3, 4, 5], wiki: "Sydney" },
  { id: "queenstown", name: "Queenstown", cc: "NZ", lat: -45.0312, lng: 168.6626, tags: ["mountain", "snow"], best: [12, 1, 2, 3, 6, 7, 8], wiki: "Queenstown, New Zealand" }
];

// Country facts: [name, currency, estimated daily cost per person in ₹ (comfort style), visa type for Indian passport, continent]
// Visa types: home = India, free = visa-free, voa = visa on arrival, evisa = apply online, visa = embassy/VFS visa.
// Rules are for Indian passport holders and can change: the guide always links to the official site to confirm.
const COUNTRY_TABLE = `
IN|India|INR|3000|home|Asia
NP|Nepal|NPR|2800|free|Asia
BT|Bhutan|BTN|9500|free|Asia
LK|Sri Lanka|LKR|3800|evisa|Asia
MV|Maldives|MVR|14000|voa|Asia
BD|Bangladesh|BDT|2800|visa|Asia
TH|Thailand|THB|4800|free|Asia
MY|Malaysia|MYR|4800|free|Asia
SG|Singapore|SGD|13000|visa|Asia
ID|Indonesia|IDR|4300|voa|Asia
VN|Vietnam|VND|3500|evisa|Asia
KH|Cambodia|KHR|3800|evisa|Asia
LA|Laos|LAK|3300|voa|Asia
MM|Myanmar|MMK|3500|evisa|Asia
PH|Philippines|PHP|4800|free|Asia
JP|Japan|JPY|12000|evisa|Asia
KR|South Korea|KRW|10000|visa|Asia
CN|China|CNY|7500|visa|Asia
HK|Hong Kong|HKD|13000|free|Asia
MO|Macau|MOP|11000|free|Asia
TW|Taiwan|TWD|8000|evisa|Asia
MN|Mongolia|MNT|5000|evisa|Asia
KZ|Kazakhstan|KZT|5000|free|Asia
UZ|Uzbekistan|UZS|4000|evisa|Asia
KG|Kyrgyzstan|KGS|3500|evisa|Asia
AE|United Arab Emirates|AED|11000|evisa|Asia
QA|Qatar|QAR|12000|free|Asia
OM|Oman|OMR|9000|evisa|Asia
SA|Saudi Arabia|SAR|10000|evisa|Asia
BH|Bahrain|BHD|9000|evisa|Asia
KW|Kuwait|KWD|10000|visa|Asia
JO|Jordan|JOD|8000|voa|Asia
IL|Israel|ILS|13000|visa|Asia
TR|Turkey|TRY|6500|visa|Asia
IR|Iran|IRR|4000|free|Asia
AZ|Azerbaijan|AZN|5500|evisa|Asia
GE|Georgia|GEL|5000|evisa|Asia
AM|Armenia|AMD|5000|evisa|Asia
RU|Russia|RUB|7500|evisa|Europe
EG|Egypt|EGP|4500|evisa|Africa
MA|Morocco|MAD|5500|evisa|Africa
TN|Tunisia|TND|4500|free|Africa
KE|Kenya|KES|7000|evisa|Africa
TZ|Tanzania|TZS|7500|evisa|Africa
UG|Uganda|UGX|5000|evisa|Africa
RW|Rwanda|RWF|6000|voa|Africa
ET|Ethiopia|ETB|4500|evisa|Africa
ZA|South Africa|ZAR|6500|visa|Africa
NA|Namibia|NAD|7000|voa|Africa
BW|Botswana|BWP|8000|visa|Africa
ZW|Zimbabwe|USD|6500|voa|Africa
MU|Mauritius|MUR|8000|free|Africa
SC|Seychelles|SCR|14000|free|Africa
MG|Madagascar|MGA|4500|voa|Africa
SN|Senegal|XOF|6000|free|Africa
NG|Nigeria|NGN|6000|visa|Africa
GH|Ghana|GHS|6000|visa|Africa
GB|United Kingdom|GBP|15000|visa|Europe
IE|Ireland|EUR|13000|visa|Europe
FR|France|EUR|13000|schengen|Europe
DE|Germany|EUR|11500|schengen|Europe
IT|Italy|EUR|12000|schengen|Europe
ES|Spain|EUR|10500|schengen|Europe
NL|Netherlands|EUR|13000|schengen|Europe
BE|Belgium|EUR|11500|schengen|Europe
AT|Austria|EUR|11500|schengen|Europe
CH|Switzerland|CHF|21000|schengen|Europe
PT|Portugal|EUR|9000|schengen|Europe
GR|Greece|EUR|9500|schengen|Europe
CZ|Czechia|CZK|7500|schengen|Europe
HU|Hungary|HUF|7000|schengen|Europe
PL|Poland|PLN|6500|schengen|Europe
SE|Sweden|SEK|12000|schengen|Europe
DK|Denmark|DKK|14000|schengen|Europe
NO|Norway|NOK|17000|schengen|Europe
FI|Finland|EUR|12000|schengen|Europe
IS|Iceland|ISK|19000|schengen|Europe
HR|Croatia|EUR|8500|schengen|Europe
SI|Slovenia|EUR|8500|schengen|Europe
SK|Slovakia|EUR|7000|schengen|Europe
EE|Estonia|EUR|8000|schengen|Europe
LV|Latvia|EUR|7000|schengen|Europe
LT|Lithuania|EUR|7000|schengen|Europe
LU|Luxembourg|EUR|14000|schengen|Europe
MT|Malta|EUR|9500|schengen|Europe
RS|Serbia|RSD|5500|visa|Europe
US|United States|USD|16000|visa|Americas
CA|Canada|CAD|13000|visa|Americas
MX|Mexico|MXN|6500|visa|Americas
BR|Brazil|BRL|6500|visa|Americas
AR|Argentina|ARS|6000|visa|Americas
PE|Peru|PEN|6000|visa|Americas
CL|Chile|CLP|7500|visa|Americas
CO|Colombia|COP|5500|visa|Americas
EC|Ecuador|USD|5500|visa|Americas
BO|Bolivia|BOB|4000|voa|Americas
CR|Costa Rica|CRC|8500|visa|Americas
CU|Cuba|CUP|6000|visa|Americas
JM|Jamaica|JMD|9000|free|Americas
BB|Barbados|BBD|12000|free|Americas
TT|Trinidad and Tobago|TTD|9000|free|Americas
AU|Australia|AUD|14000|visa|Oceania
NZ|New Zealand|NZD|13000|visa|Oceania
FJ|Fiji|FJD|8000|free|Oceania
VU|Vanuatu|VUV|9000|free|Oceania
HT|Haiti|HTG|5000|free|Americas
PK|Pakistan|PKR|3000|visa|Asia
AF|Afghanistan|AFN|3000|visa|Asia
TJ|Tajikistan|TJS|3500|evisa|Asia
TM|Turkmenistan|TMT|6000|visa|Asia
BN|Brunei|BND|8000|check|Asia
TL|Timor-Leste|USD|6000|check|Asia
KP|North Korea|KPW|10000|visa|Asia
LB|Lebanon|LBP|7000|check|Asia
SY|Syria|SYP|4000|visa|Asia
IQ|Iraq|IQD|6000|check|Asia
YE|Yemen|YER|5000|visa|Asia
PS|Palestine|ILS|6000|visa|Asia
CY|Cyprus|EUR|9000|visa|Europe
AL|Albania|ALL|5000|check|Europe
BA|Bosnia and Herzegovina|BAM|5000|check|Europe
ME|Montenegro|EUR|6500|check|Europe
MK|North Macedonia|MKD|4500|check|Europe
XK|Kosovo|EUR|4500|check|Europe
MD|Moldova|MDL|4500|check|Europe
UA|Ukraine|UAH|4500|check|Europe
BY|Belarus|BYN|5000|check|Europe
BG|Bulgaria|BGN|6500|schengen|Europe
RO|Romania|RON|6500|schengen|Europe
LI|Liechtenstein|CHF|20000|schengen|Europe
MC|Monaco|EUR|25000|schengen|Europe
SM|San Marino|EUR|10000|schengen|Europe
VA|Vatican City|EUR|12000|schengen|Europe
AD|Andorra|EUR|9000|check|Europe
DZ|Algeria|DZD|4500|visa|Africa
LY|Libya|LYD|5000|visa|Africa
SD|Sudan|SDG|4000|visa|Africa
SS|South Sudan|SSP|6000|visa|Africa
CM|Cameroon|XAF|5000|visa|Africa
CI|Ivory Coast|XOF|6000|check|Africa
ML|Mali|XOF|4500|check|Africa
NE|Niger|XOF|4500|check|Africa
BF|Burkina Faso|XOF|4500|check|Africa
GN|Guinea|GNF|4500|check|Africa
SL|Sierra Leone|SLE|4500|check|Africa
LR|Liberia|LRD|5000|check|Africa
TG|Togo|XOF|4500|check|Africa
BJ|Benin|XOF|4500|check|Africa
GA|Gabon|XAF|7000|check|Africa
CG|Republic of the Congo|XAF|6000|check|Africa
CD|DR Congo|CDF|7000|check|Africa
AO|Angola|AOA|7000|check|Africa
ZM|Zambia|ZMW|6000|check|Africa
MW|Malawi|MWK|4500|check|Africa
MZ|Mozambique|MZN|5500|check|Africa
SO|Somalia|SOS|5000|visa|Africa
DJ|Djibouti|DJF|7000|check|Africa
ER|Eritrea|ERN|5000|visa|Africa
SZ|Eswatini|SZL|5500|check|Africa
LS|Lesotho|LSL|4500|check|Africa
CV|Cape Verde|CVE|6500|check|Africa
GM|Gambia|GMD|4500|check|Africa
MR|Mauritania|MRU|4500|check|Africa
TD|Chad|XAF|5000|check|Africa
CF|Central African Republic|XAF|5000|check|Africa
GQ|Equatorial Guinea|XAF|7000|check|Africa
BI|Burundi|BIF|4000|check|Africa
KM|Comoros|KMF|5000|check|Africa
ST|São Tomé and Príncipe|STN|6000|check|Africa
VE|Venezuela|VES|5000|check|Americas
PY|Paraguay|PYG|4500|check|Americas
UY|Uruguay|UYU|7500|check|Americas
GY|Guyana|GYD|6500|check|Americas
SR|Suriname|SRD|5500|check|Americas
PA|Panama|PAB|7000|check|Americas
GT|Guatemala|GTQ|5000|check|Americas
HN|Honduras|HNL|5000|check|Americas
SV|El Salvador|USD|5500|check|Americas
NI|Nicaragua|NIO|4500|check|Americas
BZ|Belize|BZD|7000|check|Americas
DO|Dominican Republic|DOP|6500|check|Americas
BS|Bahamas|BSD|14000|check|Americas
PR|Puerto Rico|USD|13000|visa|Americas
GL|Greenland|DKK|18000|check|Americas
PG|Papua New Guinea|PGK|8000|check|Oceania
WS|Samoa|WST|7000|check|Oceania
TO|Tonga|TOP|7000|check|Oceania
SB|Solomon Islands|SBD|7000|check|Oceania
NC|New Caledonia|XPF|13000|check|Oceania
PF|French Polynesia|XPF|16000|check|Oceania
KI|Kiribati|AUD|7000|check|Oceania
FM|Micronesia|USD|8000|check|Oceania`;

// Turn the text table above into an object: COUNTRIES.FR = { name, currency, cost, visa, continent }
const COUNTRIES = {};
COUNTRY_TABLE.trim().split("\n").forEach(line => {
  const [cc, name, currency, cost, visa, continent] = line.split("|");
  COUNTRIES[cc] = { name, currency, cost: Number(cost), visa, continent };
});

// Approx. official tourist visa fee per person in ₹ (single entry). Falls back to the visa type default.
const VISA_FEE = { GB: 14000, US: 16000, CA: 11000, AU: 11500, NZ: 15000, JP: 500, CN: 3000, KR: 2500,
  SG: 2500, AE: 7500, TR: 5500, VN: 2100, EG: 2100, KE: 2800, ID: 2700, KH: 3000, LA: 3400, JO: 4700,
  RU: 4400, GE: 1700, AZ: 2200, SA: 11000, OM: 4300, LK: 0, MV: 0 };
const VISA_DEFAULT_FEE = { home: 0, free: 0, voa: 3000, evisa: 3500, visa: 7000, schengen: 8500, check: 5000 };

// How many days before the trip you should start each visa type
const VISA_LEAD_DAYS = { home: 0, free: 0, voa: 7, evisa: 21, visa: 60, schengen: 60, check: 45 };

// Official government visa pages we are confident about. Others get a search link.
const VISA_LINKS = {
  GB: "https://www.gov.uk/standard-visitor",
  US: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html",
  CA: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
  AU: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
  NZ: "https://www.immigration.govt.nz/",
  SG: "https://www.ica.gov.sg/",
  VN: "https://evisa.gov.vn/",
  LK: "https://www.eta.gov.lk/",
  TR: "https://www.evisa.gov.tr/",
  EG: "https://visa2egypt.gov.eg/",
  KE: "https://www.etakenya.go.ke/",
  AZ: "https://evisa.gov.az/",
  GE: "https://www.evisa.gov.ge/",
  KH: "https://www.evisa.gov.kh/",
  RU: "https://evisa.kdmid.ru/",
  CN: "https://www.visaforchina.cn/",
  JP: "https://www.in.emb-japan.go.jp/"
};

// Text shown for each visa type
const VISA_TEXT = {
  home: { label: "🏠 Domestic trip: no passport or visa needed",
          docs: ["Government photo ID (Aadhaar / Driving Licence / Voter ID)", "Train/flight e-ticket", "Hotel booking"],
          steps: ["Book train (IRCTC) or flight", "Book your stay", "Carry an original ID for check-in"] },
  free: { label: "✅ Visa-free for Indian passport holders",
          docs: ["Passport valid 6+ months", "Return/onward ticket", "Hotel booking", "Proof of funds (bank statement / forex)"],
          steps: ["Check the allowed stay length on the official site", "Carry printed bookings", "Fill any online arrival card if required"] },
  voa:  { label: "🛬 Visa on Arrival (get it at the airport)",
          docs: ["Passport valid 6+ months", "2 passport photos", "Return ticket", "Hotel booking", "Cash in USD for the fee"],
          steps: ["Fill the arrival form", "Pay the fee at the airport counter", "Get the visa stamp at immigration"] },
  evisa:{ label: "💻 e-Visa / eTA: apply online",
          docs: ["Passport scan (valid 6+ months)", "Digital photo", "Return ticket", "Hotel booking", "Debit/credit card for the fee"],
          steps: ["Apply on the OFFICIAL government portal only", "Pay the fee online", "Wait 3-10 working days", "Print the approved e-Visa"] },
  visa: { label: "🏛️ Visa required: apply at the embassy / VFS centre",
          docs: ["Passport valid 6+ months with 2 blank pages", "Filled visa form + photos", "6-month bank statement + ITR", "Flight & hotel bookings",
                 "Travel insurance", "Leave letter / college ID (students)"],
          steps: ["Fill the online form on the official website", "Book a biometrics appointment (VFS/BLS)", "Pay the fee", "Give fingerprints & photo",
                  "Track the application; collect your passport"] },
  check: { label: "🔎 Check the official rules (we don't store this country's rule, to avoid giving wrong info)",
          docs: ["Passport valid 6+ months", "Passport photos", "Return ticket", "Hotel booking", "Proof of funds"],
          steps: ["Open the official embassy / immigration website (button below)", "Check if Indians need a visa, e-Visa or visa on arrival",
                  "Apply at least 45 days before travel if a visa is needed"] },
  schengen: { label: "🇪🇺 Schengen visa (one visa for 29 European countries)",
          docs: ["Passport valid 3+ months after return, issued in last 10 years", "Schengen visa form + 2 photos", "Travel insurance (min €30,000 cover)",
                 "Day-by-day itinerary", "Flight & hotel bookings", "6-month bank statement + ITR", "Cover letter"],
          steps: ["Apply to the country where you spend the most nights", "Book a VFS/BLS appointment (up to 6 months ahead)",
                  "Give biometrics and pay ~€90", "Decision usually in 15 days"] }
};

const CONTINENT_EMOJI = { Asia: "🏯", Europe: "🏰", Americas: "🗽", Africa: "🦁", Oceania: "🏝️" };
const STAMP_COLORS = ["#ff6b6b", "#ffd166", "#06d6a0", "#4cc9f0", "#f72585", "#c9a227"];
const QUOTES = [
  ["The world is a book, and those who do not travel read only one page.", "Saint Augustine"],
  ["Travel is the only thing you buy that makes you richer.", "Anonymous"],
  ["Jobs fill your pocket, but adventures fill your soul.", "Jaime Lyn Beatty"],
  ["Take only memories, leave only footprints.", "Chief Seattle"],
  ["Life is short and the world is wide.", "Simon Raven"]
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Cities you can start your trip from (real coordinates)
const HOME_CITIES = [
  { id: "lpu", name: "Phagwara (LPU), Punjab", lat: 31.2560, lng: 75.7051 },
  { id: "delhi", name: "New Delhi", lat: 28.6139, lng: 77.2090 },
  { id: "mumbai", name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { id: "bengaluru", name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { id: "kolkata", name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { id: "chennai", name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { id: "hyderabad", name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { id: "chandigarh", name: "Chandigarh", lat: 30.7333, lng: 76.7794 }
];

// Trip status steps (real-time status of each trip)
const STATUSES = [
  { id: "dream", label: "💭 Dreaming" },
  { id: "planning", label: "📝 Planning" },
  { id: "booked", label: "🎫 Booked" },
  { id: "packed", label: "🎒 Packed" },
  { id: "travelling", label: "✈️ Travelling now" },
  { id: "visited", label: "✅ Visited" }
];

// Weather codes used by Open-Meteo (WMO standard)
function weatherInfo(code) {
  if (code === 0) return ["☀️", "Clear sky"];
  if (code <= 2) return ["🌤️", "Partly cloudy"];
  if (code === 3) return ["☁️", "Cloudy"];
  if (code <= 48) return ["🌫️", "Fog"];
  if (code <= 57) return ["🌦️", "Drizzle"];
  if (code <= 67) return ["🌧️", "Rain"];
  if (code <= 77) return ["❄️", "Snow"];
  if (code <= 82) return ["🌦️", "Rain showers"];
  if (code <= 86) return ["🌨️", "Snow showers"];
  return ["⛈️", "Thunderstorm"];
}

const STYLE_MULT = { budget: 0.5, mid: 1, luxury: 2.5 };
const STYLE_NAME = { budget: "🎒 Budget", mid: "🧳 Comfort", luxury: "💎 Luxury" };

// Real globe images (NASA Blue Marble, night lights, terrain bumps, star sky)
const IMG = "https://cdn.jsdelivr.net/npm/three-globe@2.45.0/example/img/";
// Real satellite photo tiles from Esri World Imagery (sharper as you zoom in)
const SATELLITE_TILE = (x, y, l) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`;

const STORAGE_KEY = "dreamtrail_destinations";
const SETTINGS_KEY = "dreamtrail_settings";


/* =====================================================================
   PART 2: APP STATE (variables that remember what is going on)
   ===================================================================== */
let destinations = [];          // the main bucket list array
let settings = { home: "lpu", theme: "dark", docs: {}, pack: {} };
let currentContinent = "All";   // selected continent chip
let savingForId = null;         // card we are adding savings to
let currentPlace = null;        // place shown in the tour guide
let gpsPosition = null;         // { lat, lng, accuracy } from the device GPS
let gpsWatchId = null;
let globe = null;               // the globe.gl object
let globeLayer = "satellite";
let planStyle = "mid";
let balShowAll = false;          // Balance Bucket: show all trips or just the top 8
let rates = null;               // live currency rates (base INR)
let nearbyPins = [];            // real photo pins of top places shown on the globe
let zoomedIn = false;           // true when the globe camera is at city level
let currentUser = null;         // { name, email } of the signed-in user (null = guest)
let authMode = "signup";
let zoomTimer = null;
let lenis = null;               // smooth-scroll engine


/* =====================================================================
   PART 3: GETTING HTML ELEMENTS
   ===================================================================== */
const $ = id => document.getElementById(id);
const cardsGrid = $("cardsGrid");
const searchInput = $("searchInput");
const sortSelect = $("sortSelect");
const statusSelect = $("statusSelect");
const formModal = $("formModal");
const saveModal = $("saveModal");
const liveModal = $("liveModal");
const destForm = $("destForm");
const toast = $("toast");


/* =====================================================================
   PART 4: LOCAL STORAGE (save & load)
   localStorage stores TEXT, so we use JSON.stringify / JSON.parse.
   ===================================================================== */
// Each signed-in user gets their own storage keys: "dreamtrail_destinations:email"
function dataKey() { return currentUser ? STORAGE_KEY + ":" + currentUser.email : STORAGE_KEY; }
function settingsKey() { return currentUser ? SETTINGS_KEY + ":" + currentUser.email : SETTINGS_KEY; }

function loadData() {
  try {
    const stored = localStorage.getItem(dataKey());
    destinations = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(SAMPLE_DATA));
  } catch (e) {
    destinations = JSON.parse(JSON.stringify(SAMPLE_DATA));
  }
  // Upgrade old (version 1) items so they have all the new fields
  destinations.forEach(d => {
    if (!d.status) d.status = d.visited ? "visited" : "dream";
    if (!d.prep) d.prep = {};
    if (d.travelDate === undefined) d.travelDate = "";
    if (d.visited && !d.visitedOn && d.visitedDate) {
      const parsed = new Date(d.visitedDate);
      d.visitedOn = isNaN(parsed) ? "" : parsed.toISOString().slice(0, 10);
    }
  });
  saveData();

  settings = { home: "lpu", theme: settings.theme || "dark", docs: {}, pack: {} };
  try {
    const s = JSON.parse(localStorage.getItem(settingsKey()));
    if (s) settings = Object.assign(settings, s);
  } catch (e) { /* keep default settings */ }
}

function saveData() {
  try { localStorage.setItem(dataKey(), JSON.stringify(destinations)); } catch (e) { /* storage blocked */ }
}

function saveSettings() {
  try { localStorage.setItem(settingsKey(), JSON.stringify(settings)); } catch (e) { /* storage blocked */ }
}


/* =====================================================================
   PART 5: SMALL HELPER FUNCTIONS
   ===================================================================== */

// 150000 -> "₹1,50,000"
function formatMoney(amount) {
  return "₹" + Math.round(Number(amount) || 0).toLocaleString("en-IN");
}

// Make text safe before putting it inside HTML (prevents XSS attacks)
function escapeHTML(text) {
  return String(text ?? "").replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// REAL great-circle distance between two points on Earth (Haversine formula), in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;                                   // radius of Earth in km
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatKm(km) {
  if (km < 1) return Math.round(km * 1000) + " m";
  return Math.round(km).toLocaleString("en-IN") + " km";
}

function formatHours(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs ? `${hrs} h ${mins} min` : `${mins} min`;
}

// Country flag image (Windows cannot show flag emojis, so we use real flag PNGs)
function flagImg(cc, width = 40) {
  if (!cc) return "";
  return `<img src="https://flagcdn.com/w${width}/${cc.toLowerCase()}.png" alt="${cc} flag" onerror="this.remove()">`;
}

function starText(stars) {
  const full = Math.round(stars);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function getPercent(dest) {
  if (dest.budget <= 0) return 0;
  return Math.min(100, Math.round((dest.saved / dest.budget) * 100));
}

function monthsLeft(targetYear) {
  const today = new Date();
  return (targetYear - today.getFullYear()) * 12 + (12 - today.getMonth());
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Whole days from today until an ISO date (negative if the date has passed)
function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

function niceDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function getSavingTip(dest) {
  const remaining = dest.budget - dest.saved;
  if (dest.visited) return { text: "🎉 Trip completed! Great memories made.", done: true };
  if (remaining <= 0) return { text: "✅ Budget complete! You are ready to book.", done: true };
  // if a travel date is set, count months until that date
  let months = monthsLeft(dest.year);
  if (dest.travelDate) months = Math.max(0, Math.floor(daysUntil(dest.travelDate) / 30.4));
  if (months <= 0) return { text: "⏰ Trip time is here. Need " + formatMoney(remaining) + " more.", done: false };
  const perMonth = Math.ceil(remaining / months);
  return { text: "💡 Save " + formatMoney(perMonth) + "/month for " + months + " months to reach your goal.", done: false };
}

// The point the user travels FROM: live GPS if on, otherwise the chosen home city
function getOrigin() {
  if (gpsPosition) return { name: gpsPosition.place ? "you (" + gpsPosition.place + ")" : "your live location",
                            lat: gpsPosition.lat, lng: gpsPosition.lng, live: true };
  const home = HOME_CITIES.find(h => h.id === settings.home) || HOME_CITIES[0];
  return { name: home.name, lat: home.lat, lng: home.lng, live: false };
}

function countryOf(cc) {
  return COUNTRIES[(cc || "").toUpperCase()] || null;
}

// Wraps fetch(): adds a timeout, turns the answer into JSON and keeps a short cache
const apiCache = new Map();
async function fetchJSON(url, { timeout = 15000, cacheMinutes = 10 } = {}) {
  const hit = apiCache.get(url);
  if (hit && Date.now() - hit.time < cacheMinutes * 60000) return hit.data;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    apiCache.set(url, { time: Date.now(), data });
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// OpenStreetMap (Nominatim) asks for max 1 request per second, so we queue our calls
let nominatimQueue = Promise.resolve();
function nominatim(path) {
  const url = "https://nominatim.openstreetmap.org/" + path + (path.includes("?") ? "&" : "?") + "format=jsonv2&accept-language=en";
  const job = nominatimQueue.then(() => fetchJSON(url, { cacheMinutes: 60 }));
  nominatimQueue = job.catch(() => {}).then(() => new Promise(r => setTimeout(r, 1100)));
  return job;
}


/* =====================================================================
   PART 6: TRIP COST ESTIMATES
   Prices change every day, so these are ESTIMATES (clearly shown as estimates):
     - distance is REAL (Haversine formula on real coordinates)
     - flight ≈ ₹4,000 + ₹7 per km (economy, return, per person)
     - daily costs come from each country's cost-of-living level
   ===================================================================== */
function travelEstimate(km, domestic) {
  if (domestic && km < 700) {
    // short trips inside India: train / bus / cab
    return { mode: "🚆 Train / road", hours: km / 55, costPerPerson: Math.max(600, km * 2 * 2.5) };
  }
  const hours = km / 780 + 1.5 + (km > 7500 ? 3 : 0);   // cruise speed + airport time (+ stopover)
  return { mode: km > 7500 ? "✈️ Flight (usually 1 stop)" : "✈️ Direct flight", hours, costPerPerson: 4000 + 7 * km };
}

function tripCost({ lat, lng, cc }, days, people, style, origin = getOrigin()) {
  const country = countryOf(cc);
  const daily = country ? country.cost : 9000;          // unknown country -> world average
  const m = STYLE_MULT[style] || 1;
  const km = haversine(origin.lat, origin.lng, lat, lng);
  const domestic = (cc || "").toUpperCase() === "IN";
  const travel = travelEstimate(km, domestic);
  const travelMult = { budget: 0.85, mid: 1, luxury: 3 }[style] || 1;
  const visaType = domestic ? "home" : (country ? country.visa : "check");
  const visaFee = domestic ? 0 : (VISA_FEE[(cc || "").toUpperCase()] ?? VISA_DEFAULT_FEE[visaType]);

  const items = {
    "✈️ Travel (return)": travel.costPerPerson * travelMult * people,
    "🏨 Stay": daily * 0.45 * m * days * people,
    "🍛 Food": daily * 0.25 * m * days * people,
    "🚕 Local transport": daily * 0.12 * m * days * people,
    "🎟️ Activities & tickets": daily * 0.18 * m * days * people,
    "🛂 Visa fees": visaFee * people,
    "🛡️ Travel insurance": domestic ? 0 : 80 * days * people
  };
  const subtotal = Object.values(items).reduce((s, v) => s + v, 0);
  items["🧯 Emergency buffer (10%)"] = subtotal * 0.1;
  const total = Math.round(subtotal * 1.1 / 100) * 100;   // round to nearest ₹100
  return { items, total, perPerson: total / people, km, travel, visaType, domestic };
}


/* =====================================================================
   PART 7: LIVE DATA FROM REAL APIs
   ===================================================================== */

// Live weather + 5-day forecast + local time offset + sunrise/sunset (Open-Meteo)
function getWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
    `&timezone=auto&forecast_days=7`;
  return fetchJSON(url, { cacheMinutes: 10 });
}

// Live air quality (US AQI) from Open-Meteo
function getAirQuality(lat, lng) {
  return fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5`, { cacheMinutes: 30 });
}

function aqiInfo(aqi) {
  if (aqi <= 50) return ["Good", "green"];
  if (aqi <= 100) return ["Moderate", "orange"];
  if (aqi <= 150) return ["Unhealthy for sensitive people", "orange"];
  if (aqi <= 200) return ["Unhealthy", "red"];
  if (aqi <= 300) return ["Very unhealthy", "red"];
  return ["Hazardous", "red"];
}

// Live exchange rates with INR as base (1 INR = x foreign)
async function getRates() {
  if (rates) return rates;
  const data = await fetchJSON("https://open.er-api.com/v6/latest/INR", { cacheMinutes: 60 });
  rates = { values: data.rates, updated: data.time_last_update_utc };
  return rates;
}

// Short real description + photo of a place from Wikipedia
async function getWikiSummary(title) {
  return fetchJSON("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_")), { cacheMinutes: 120 });
}

// Words that mean an article is NOT a tourist place (events, offices, areas, companies…)
const NOT_A_PLACE = /\b(attacks?|bombings?|shootings?|massacre|riots?|fires?|ceremony|election|protests?|accident|crash|murder|siege|arrondissement|municipal|commune|ward|constituency|station|metro|company|school|lycée|hospital|street|rue|avenue|boulevard|embassy|headquarters|organi[sz]ation|body|bank|hotel|empire|regime|dynasty|timeline|fashion|brand|court|police|prefecture|government|ministry|party|census|village development|storming|battle|revolution|treaty|uprising|war|highway|institute|order|chamber|parliament|senate|deputies|council|agency|authority)\b/i;

// Real places near a point from Wikipedia, ranked by REAL popularity (page views in the last 30 days).
// Step 1: get up to 500 real articles with coordinates within 10 km.
// Step 2: remove events/offices/areas, keep the 20 biggest articles (big article = notable place).
// Step 3: get the real 30-day page views of those 20 and sort by them.
async function getNearbyPlaces(lat, lng, radius = 10000, placeName = "") {
  const url = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*" +
    `&generator=geosearch&ggscoord=${lat}|${lng}&ggsradius=${radius}&ggslimit=500` +
    "&prop=coordinates|description|info|pageimages&piprop=thumbnail&pithumbsize=160&pilimit=max&colimit=max";
  const data = await fetchJSON(url, { cacheMinutes: 60 });
  const own = placeName.toLowerCase().split(",")[0].trim();
  const pages = Object.values((data.query && data.query.pages) || {})
    .filter(p => !/^(List of|Timeline of|History of|\d{4}\b)/i.test(p.title))
    .filter(p => p.title.toLowerCase().split(",")[0].trim() !== own)
    .filter(p => !NOT_A_PLACE.test(p.title + " " + (p.description || "")))
    .sort((a, b) => b.length - a.length)
    .slice(0, 20);
  if (!pages.length) return [];

  const viewsUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageviews&pvipdays=30&titles=" +
    encodeURIComponent(pages.map(p => p.title).join("|"));
  const views = {};
  try {
    const v = await fetchJSON(viewsUrl, { cacheMinutes: 60 });
    Object.values(v.query.pages).forEach(p => {
      views[p.title] = Object.values(p.pageviews || {}).reduce((s, x) => s + (x || 0), 0);
    });
  } catch (e) { /* views unavailable: keep size order */ }

  return pages.map(p => {
    const c = p.coordinates && p.coordinates[0];
    const v = views[p.title] || 0;
    return {
      title: p.title,
      desc: p.description || "",
      thumb: p.thumbnail ? p.thumbnail.source : "",
      lat: c ? c.lat : null,
      lng: c ? c.lon : null,
      views: v,
      stars: Math.max(1, Math.min(5, Math.log10(v + 1) - 0.5)),
      dist: c ? haversine(lat, lng, c.lat, c.lon) : null
    };
  }).sort((a, b) => b.views - a.views);
}

// Real hotels near a point from OpenStreetMap (with their real star rating when tagged)
async function getHotels(lat, lng) {
  const d = 0.06;   // about 6 km around the point
  const box = [lng - d, lat + d, lng + d, lat - d].join(",");
  const list = await nominatim(`search?q=hotel&viewbox=${box}&bounded=1&limit=15&extratags=1`);
  return list.map(h => {
    const tags = h.extratags || {};
    return {
      name: h.name || (h.display_name || "").split(",")[0],
      stars: tags.stars ? parseFloat(tags.stars) : null,
      type: h.type,
      lat: parseFloat(h.lat),
      lng: parseFloat(h.lon),
      address: (h.display_name || "").split(",").slice(1, 3).join(","),
      website: tags.website || tags["contact:website"] || "",
      dist: haversine(lat, lng, parseFloat(h.lat), parseFloat(h.lon))
    };
  }).filter(h => h.name);
}

// Real airports near a place (OpenStreetMap)
async function getAirports(lat, lng) {
  const d = 1.2;
  const box = [lng - d, lat + d, lng + d, lat - d].join(",");
  const list = await nominatim(`search?q=airport&viewbox=${box}&bounded=1&limit=15`);
  return list
    .filter(a => /airport/i.test(a.name || "") && !/heliport|helipad|airstrip|military|air force|aéro-?club/i.test(a.name || ""))
    .map(a => ({ name: a.name, lat: +a.lat, lng: +a.lon, dist: haversine(lat, lng, +a.lat, +a.lon),
                 intl: /international/i.test(a.name) }))
    .sort((a, b) => (b.intl - a.intl) || a.dist - b.dist)      // international airports first, then nearest
    .slice(0, 3);
}

// Nearest real railway station (within ~35 km) from OpenStreetMap
async function getNearestStation(place) {
  try {
    const d = 0.32;
    const box = [place.lng - d, place.lat + d, place.lng + d, place.lat - d].join(",");
    const list = await nominatim(`search?q=railway station&viewbox=${box}&bounded=1&limit=5`);
    const stations = list.filter(s => /station|junction|railway/i.test(s.display_name + " " + s.type))
      .map(s => ({ name: s.name || s.display_name.split(",")[0], dist: haversine(place.lat, place.lng, +s.lat, +s.lon) }))
      .sort((a, b) => a.dist - b.dist);
    return stations[0] || null;
  } catch (e) {
    return null;
  }
}

// Real road route (distance + driving time) from OSRM. Fails across oceans -> returns null
async function getRoadRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const data = await fetchJSON(url, { timeout: 12000, cacheMinutes: 60 });
    if (data.code !== "Ok" || !data.routes.length) return null;
    return { km: data.routes[0].distance / 1000, hours: data.routes[0].duration / 3600 };
  } catch (e) {
    return null;
  }
}

// Search any place in the world by name (OpenStreetMap)
async function searchPlaces(text) {
  const list = await nominatim("search?q=" + encodeURIComponent(text) + "&limit=6&addressdetails=1");
  return list.map(r => {
    const a = r.address || {};
    return {
      name: r.name || r.display_name.split(",")[0],
      country: a.country || "",
      cc: (a.country_code || "").toUpperCase(),
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      label: r.display_name
    };
  });
}

// What is at this point? (reverse geocoding). Returns null for the ocean.
async function reverseGeocode(lat, lng) {
  try {
    const r = await nominatim(`reverse?lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
    if (!r || r.error) return null;
    const a = r.address || {};
    return {
      name: a.city || a.town || a.village || a.municipality || a.county || a.state_district || a.state || r.name || "Unknown place",
      region: a.state || "",
      country: a.country || "",
      cc: (a.country_code || "").toUpperCase(),
      lat, lng
    };
  } catch (e) {
    return null;
  }
}


/* =====================================================================
   PART 8: THE 3D GLOBE (globe.gl)
   ===================================================================== */
function initGlobe() {
  const el = $("globe");
  if (typeof Globe === "undefined") {           // library did not load (offline)
    $("globeFallback").classList.add("show");
    $("globeHint").style.display = "none";
    return;
  }

  globe = new Globe(el, { animateIn: true })
    .globeImageUrl(IMG + "earth-blue-marble.jpg")
    .bumpImageUrl(IMG + "earth-topology.png")
    .backgroundImageUrl(IMG + "night-sky.png")
    .showAtmosphere(true)
    .atmosphereColor("#7ec8ff")
    .atmosphereAltitude(0.18)
    // Orange dots = famous destinations, green = visited, blue = my bucket list
    .pointLat("lat").pointLng("lng")
    .pointColor(p => p.color)
    .pointAltitude(0.015)
    .pointRadius(p => p.size)
    .pointLabel(p => `<div class="globe-label">${escapeHTML(p.label)}</div>`)
    .onPointClick(p => openGuide(p.place))
    .onGlobeClick(({ lat, lng }) => exploreAt(lat, lng))
    // Pulsing rings for the selected place and your location
    .ringColor(r => t => `rgba(${r.rgb},${1 - t})`)
    .ringMaxRadius(r => r.max)
    .ringPropagationSpeed(2)
    .ringRepeatPeriod(1000)
    // Animated flight arc from you to the selected place
    .arcColor(() => ["#4cc9f0", "#ff6b35"])
    .arcStroke(0.7)
    .arcDashLength(0.45)
    .arcDashGap(0.15)
    .arcDashAnimateTime(2200)
    .arcAltitudeAutoScale(0.4)
    .arcLabel(a => `<div class="globe-label">${escapeHTML(a.label)}</div>`)
    // Floating name tag with the real distance
    .htmlTransitionDuration(0)
    .htmlLat("lat").htmlLng("lng").htmlAltitude(d => (d.type === "photo" || zoomedIn ? 0.0003 : 0.02))   // pins sit on the ground
    .htmlElement(d => {
      const div = document.createElement("div");
      if (d.type === "photo") {
        // Google-Maps-style photo pin of a real famous place
        div.className = "photo-pin";
        div.innerHTML = `<img src="${escapeHTML(d.thumb)}" alt=""><span>${escapeHTML(d.title)}</span>`;
        div.addEventListener("click", e => { e.stopPropagation(); openPhoto(d); });
        return div;
      }
      div.className = "globe-label";
      div.textContent = d.text;
      return div;
    });

  setGlobeLayer(settings.globeLayer || "satellite");
  globe.pointOfView({ lat: 22, lng: 78, altitude: 2.3 }, 0);   // start over India

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  // When you zoom close (street/city level) hide the big dots, arcs and rings
  // so only the real satellite photo and the photo pins are visible.
  let settleTimer = null;
  globe.onZoom(pov => {
    const close = pov.altitude < 0.15;
    if (close !== zoomedIn) {
      zoomedIn = close;
      refreshGlobeData();
    }
    // when the camera stops moving, redraw the photo pins so they always appear
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { if (zoomedIn && nearbyPins.length) refreshGlobeData(); }, 400);
  });

  resizeGlobe();
  window.addEventListener("resize", resizeGlobe);
  refreshGlobeData();

  // Performance: stop drawing the 3D globe while it is off-screen (keeps scrolling smooth, saves battery)
  new IntersectionObserver(entries => {
    entries.forEach(en => en.isIntersecting ? globe.resumeAnimation() : globe.pauseAnimation());
  }).observe(document.querySelector(".globe-wrap"));
}

function resizeGlobe() {
  if (!globe) return;
  const box = $("globe");
  globe.width(box.clientWidth).height(box.clientHeight);
}

// Switch between real satellite photos, NASA Blue Marble and city lights at night
function setGlobeLayer(layer) {
  globeLayer = layer;
  settings.globeLayer = layer;
  saveSettings();
  document.querySelectorAll("#globeLayers button").forEach(b => b.classList.toggle("active", b.dataset.layer === layer));
  if (!globe) return;
  if (layer === "satellite") {
    globe.globeImageUrl(IMG + "earth-blue-marble.jpg").globeTileEngineUrl(SATELLITE_TILE);
  } else if (layer === "night") {
    globe.globeTileEngineUrl(null).globeImageUrl(IMG + "earth-night.jpg");
  } else {
    globe.globeTileEngineUrl(null).globeImageUrl(IMG + "earth-blue-marble.jpg");
  }
}

// Redraw all dots, rings, the arc and labels on the globe
function refreshGlobeData() {
  if (!globe) return;

  const points = CITIES.map(c => ({
    lat: c.lat, lng: c.lng, color: "#ff6b35", size: 0.35,
    label: `${c.name} · ${countryOf(c.cc).name}`, place: cityToPlace(c)
  }));
  destinations.filter(d => d.lat != null).forEach(d => points.push({
    lat: d.lat, lng: d.lng, color: d.visited ? "#2bb673" : "#4cc9f0", size: 0.4,
    label: (d.visited ? "✅ " : "🧳 ") + d.name, place: destToPlace(d)
  }));
  globe.pointsData(zoomedIn ? [] : points);

  const origin = getOrigin();
  const rings = [{ lat: origin.lat, lng: origin.lng, rgb: "76,201,240", max: origin.live ? 3 : 2 }];
  const arcs = [];
  const labels = [{ lat: origin.lat, lng: origin.lng, text: (origin.live ? "📡 You" + (gpsPosition.place ? " · " + gpsPosition.place : "") : "🏠 " + origin.name.split(",")[0]) }];

  if (currentPlace) {
    const km = haversine(origin.lat, origin.lng, currentPlace.lat, currentPlace.lng);
    rings.push({ lat: currentPlace.lat, lng: currentPlace.lng, rgb: "255,179,71", max: 4 });
    labels.push({ lat: currentPlace.lat, lng: currentPlace.lng, text: `📍 ${currentPlace.name} · ${formatKm(km)}` });
    if (km > 30) {
      arcs.push({ startLat: origin.lat, startLng: origin.lng, endLat: currentPlace.lat, endLng: currentPlace.lng,
                  label: `${formatKm(km)} from ${origin.name}` });
    }
  }
  // fresh copies ({...p}) so the globe library redraws the pins at the right height every time
  const pins = nearbyPins.map(p => ({ ...p }));
  if (zoomedIn) globe.ringsData([]).arcsData([]).htmlElementsData(pins.length ? pins : labels.slice(1));
  else globe.ringsData(rings).arcsData(arcs).htmlElementsData(labels.concat(pins.slice(0, 1)));
}

// Load real photos of the top places around the selected point and pin them on the globe
async function loadPhotoPins(place) {
  nearbyPins = [];
  refreshGlobeData();
  try {
    const list = await getNearbyPlaces(place.lat, place.lng, 10000, place.name);
    if (currentPlace !== place) return;          // user already picked another place
    nearbyPins = list.filter(p => p.thumb && p.lat != null).slice(0, 8).map(p => ({ ...p, type: "photo" }));
    refreshGlobeData();
  } catch (e) { /* no pins if Wikipedia is unreachable */ }
}

// Big photo popup for a real place (from a globe pin or the gallery)
async function openPhoto(p) {
  liveModal.classList.add("open");
  const box = $("liveContent");
  box.innerHTML = `<h2>📸 ${escapeHTML(p.title)}</h2><p class="loader">Loading photo…</p>`;
  let s = null;
  try { s = await getWikiSummary(p.title); } catch (e) { s = null; }
  const img = (s && s.thumbnail) ? s.thumbnail.source.replace(/\/\d+px-/, "/960px-") : p.thumb;
  const origin = getOrigin();
  box.innerHTML = `<h2>📸 ${escapeHTML(p.title)}</h2>
    <img class="photo-big" src="${escapeHTML(img)}" alt="${escapeHTML(p.title)}" onerror="this.onerror=null; this.src='${escapeHTML(p.thumb)}'">
    <div class="meta mt">
      <span class="stars">${starText(p.stars)}</span>
      <span class="pill">👀 ${p.views.toLocaleString("en-IN")} readers / 30 days</span>
      ${p.lat != null ? `<span class="pill blue">📏 ${formatKm(haversine(origin.lat, origin.lng, p.lat, p.lng))} from ${escapeHTML(origin.name.split(",")[0])}</span>` : ""}
    </div>
    <p class="mt">${s ? escapeHTML(s.extract) : escapeHTML(p.desc)}</p>
    <div class="link-btns">
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">🧭 Directions</a>
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/@${p.lat},${p.lng},18z/data=!3m1!1e3">🛰️ Satellite</a>
      <a class="link-btn" target="_blank" rel="noopener" href="https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}">📖 Wikipedia</a>
      <button class="btn btn-primary btn-sm" onclick="closeModals(); flyTo(${p.lat}, ${p.lng}, 0.008)">🔍 Zoom here on globe</button>
    </div>
    <p class="note">Photo & text: Wikipedia / Wikimedia Commons (a real photo of this place).</p>`;
}

function flyTo(lat, lng, altitude = 1.4) {
  if (!globe) return;
  globe.controls().autoRotate = false;
  globe.pointOfView({ lat, lng, altitude }, 1500);
}

// Convert a CITIES item or a bucket list item to a "place" object used by the guide
function cityToPlace(c) {
  return { name: c.name, cc: c.cc, country: countryOf(c.cc).name, lat: c.lat, lng: c.lng, wiki: c.wiki, best: c.best, cityId: c.id };
}

function destToPlace(d) {
  return { name: d.name, cc: d.cc, country: d.country, lat: d.lat, lng: d.lng, wiki: d.name, destId: d.id };
}

// User clicked an empty part of the globe
async function exploreAt(lat, lng) {
  showGuideLoading(`Finding what is at ${lat.toFixed(2)}°, ${lng.toFixed(2)}°…`);
  const place = await reverseGeocode(lat, lng);
  if (!place) {
    $("guidePanel").innerHTML = `<div class="guide-empty"><div class="big-emoji">🌊</div>
      <h3>You clicked the ocean!</h3><p>There is no town here (${lat.toFixed(2)}°, ${lng.toFixed(2)}°). Try clicking on land or pick a city button above.</p></div>`;
    return;
  }
  openGuide(place);
}


/* =====================================================================
   PART 9: LIVE GPS LOCATION (real-time distance)
   watchPosition() keeps sending your position while you move.
   ===================================================================== */
function startGPS() {
  if (!navigator.geolocation) {
    showToast("❌ Your browser does not support location.");
    return;
  }
  if (gpsWatchId !== null) {          // already on -> turn it off
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    gpsPosition = null;
    $("gpsBtn").textContent = "📡 Use my live location";
    updateGpsText();
    refreshGlobeData();
    return;
  }
  $("gpsText").textContent = "Asking for permission…";
  gpsWatchId = navigator.geolocation.watchPosition(pos => {
    const first = !gpsPosition;
    const prev = gpsPosition;
    gpsPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy,
                    place: prev ? prev.place : "", country: prev ? prev.country : "" };
    // find the REAL name of where you are (again only if you moved more than 2 km)
    if (!prev || haversine(prev.lat, prev.lng, gpsPosition.lat, gpsPosition.lng) > 2) {
      reverseGeocode(gpsPosition.lat, gpsPosition.lng).then(r => {
        if (!r || !gpsPosition) return;
        gpsPosition.place = r.name;
        gpsPosition.country = r.country;
        updateGpsText();
        refreshGlobeData();
      });
    }
    $("gpsBtn").textContent = "⏹ Stop live location";
    updateGpsText();
    refreshGlobeData();
    if (first) {
      flyTo(gpsPosition.lat, gpsPosition.lng, 1.6);
      showToast("📡 Live location on. Distances now start from where you are.");
    }
  }, err => {
    gpsWatchId = null;
    $("gpsText").textContent = err.code === 1
      ? "Location permission was denied. Allow it in the browser address bar."
      : "Could not get your location (" + err.message + ").";
  }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
}

function updateGpsText() {
  const box = $("gpsText");
  if (!gpsPosition) {
    box.textContent = "Turn on live location to see your real distance to any place.";
    return;
  }
  let html = `📍 You are in: <b>${escapeHTML(gpsPosition.place || "finding…")}${gpsPosition.country ? ", " + escapeHTML(gpsPosition.country) : ""}</b>
    <br>${gpsPosition.lat.toFixed(4)}, ${gpsPosition.lng.toFixed(4)} (±${Math.round(gpsPosition.accuracy)} m)`;
  if (currentPlace) {
    const km = haversine(gpsPosition.lat, gpsPosition.lng, currentPlace.lat, currentPlace.lng);
    html += `<br>To ${escapeHTML(currentPlace.name)}: <b>${formatKm(km)}</b> (straight line, live)`;
  }
  box.innerHTML = html;
}


/* =====================================================================
   PART 10: TOUR GUIDE PANEL
   ===================================================================== */
function showGuideLoading(text) {
  $("guidePanel").innerHTML = `<div class="guide-empty"><p class="loader">${escapeHTML(text)}</p></div>`;
}

// Open the full tour guide for a place: { name, country, cc, lat, lng, wiki?, best? }
async function openGuide(place) {
  if (!place.country && place.cc) place.country = (countryOf(place.cc) || {}).name || "";
  currentPlace = place;
  refreshGlobeData();
  updateGpsText();
  // Fly in two steps: first the region (see the route arc), then down to city level
  // where real satellite photos and photo pins of the top places appear.
  flyTo(place.lat, place.lng, 0.6);
  clearTimeout(zoomTimer);
  zoomTimer = setTimeout(() => {
    if (currentPlace === place && globe) {
      globe.pointOfView({ lat: place.lat, lng: place.lng, altitude: 0.004 }, 2400);
      setTimeout(() => { if (currentPlace === place) refreshGlobeData(); }, 2600);   // redraw pins once the camera stops
    }
  }, 2600);
  loadPhotoPins(place);
  updatePlannerOptions();

  const origin = getOrigin();
  const est = tripCost(place, 5, 1, "mid", origin);
  const country = countryOf(place.cc);
  const visaType = est.visaType;

  $("guidePanel").innerHTML = `
    <div class="guide-head" id="guideHead">
      <p>${flagImg(place.cc, 20)} ${escapeHTML(place.country || "")}${country ? " · " + escapeHTML(country.continent) : ""}</p>
      <h3>${escapeHTML(place.name)}</h3>
      <p>📍 ${place.lat.toFixed(4)}°, ${place.lng.toFixed(4)}°</p>
      <div class="guide-stats">
        <div><b>${formatKm(est.km)}</b><span>from ${escapeHTML(origin.name.split(",")[0])}</span></div>
        <div><b>${formatHours(est.travel.hours)}</b><span>est. travel time</span></div>
        <div><b>${formatMoney(est.total)}</b><span>est. 5 days · 1 person</span></div>
        <div><b>${visaType === "home" ? "No visa" : VISA_TEXT[visaType].label.split(" ")[0] + " " + visaShort(visaType)}</b><span>visa (Indian)</span></div>
      </div>
      <div class="guide-actions">
        <button class="btn btn-primary" onclick="addPlaceToBucket()">+ Add to Bucket List</button>
        <button class="btn btn-outline" onclick="planCurrentPlace()">🧮 Plan this trip</button>
      </div>
    </div>
    <div class="tabs" id="guideTabs">
      <button class="tab active" data-tab="overview">Overview</button>
      <button class="tab" data-tab="live">🔴 Live</button>
      <button class="tab" data-tab="places">⭐ Places</button>
      <button class="tab" data-tab="stay">🏨 Stay</button>
      <button class="tab" data-tab="map">🗺️ Map</button>
      <button class="tab" data-tab="cost">💰 Cost</button>
      <button class="tab" data-tab="visa">🛂 Visa</button>
      <button class="tab" data-tab="reach">✈️ Reach</button>
    </div>
    <div class="tab-body" id="tabBody"></div>`;

  document.querySelectorAll("#guideTabs .tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#guideTabs .tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      showGuideTab(tab.dataset.tab);
    });
  });
  showGuideTab("overview");

  // Load a real photo for the header from Wikipedia
  try {
    const s = await getWikiSummary(place.wiki || place.name);
    const img = s.originalimage || s.thumbnail;
    if (img && currentPlace === place) $("guideHead").style.backgroundImage = `url("${img.source}")`;
  } catch (e) { /* no photo: keep the gradient */ }
}

function visaShort(type) {
  return { free: "Visa-free", voa: "On arrival", evisa: "e-Visa", visa: "Visa needed", schengen: "Schengen", check: "Check rules" }[type] || "";
}

function showGuideTab(tab) {
  const body = $("tabBody");
  const place = currentPlace;
  if (!body || !place) return;
  const renderers = { overview: tabOverview, live: tabLive, places: tabPlaces, stay: tabStay,
                      map: tabMap, cost: tabCost, visa: tabVisa, reach: tabReach };
  renderers[tab](body, place);
}

// ----- Overview tab: real Wikipedia summary + best season -----
async function tabOverview(body, place) {
  const country = countryOf(place.cc);
  const month = new Date().getMonth() + 1;
  let season = "";
  if (place.best) {
    const good = place.best.includes(month);
    season = `<p class="pill ${good ? "green" : "orange"}">${good ? "✅ Now is a great time to visit" : "⚠️ Not the best season now"}</p>
      <p><b>Best months:</b> ${place.best.map(m => MONTHS[m - 1]).join(", ")}</p>`;
  }
  body.innerHTML = `
    <h4>📸 Top places around (real photos)</h4><div class="gallery" id="ovGallery"><p class="loader">Loading photos…</p></div>
    <h4>About</h4><div id="ovText" class="loader">Loading from Wikipedia…</div>
    ${season ? "<h4>When to go</h4>" + season : ""}
    <h4>Quick facts</h4>
    <div class="info-grid">
      <div class="info-box"><span>Country</span><b>${flagImg(place.cc, 20)} ${escapeHTML(place.country || "-")}</b></div>
      <div class="info-box"><span>Currency</span><b>${country ? country.currency : "-"}</b></div>
      <div class="info-box"><span>Est. daily cost (comfort)</span><b>${country ? formatMoney(country.cost) : "-"}/person</b></div>
      <div class="info-box"><span>Visa for Indians</span><b>${visaShort(country ? country.visa : "check") || "Not needed"}</b></div>
    </div>`;
  // real photo gallery of the most popular places nearby (click to open big)
  getNearbyPlaces(place.lat, place.lng, 10000, place.name).then(list => {
    const box = $("ovGallery");
    if (!box) return;
    const withPhoto = list.filter(p => p.thumb).slice(0, 10);
    window._gallery = withPhoto;
    box.innerHTML = withPhoto.length
      ? withPhoto.map((p, i) => `<button class="gal-item" onclick="openPhoto(window._gallery[${i}])">
          <img src="${escapeHTML(p.thumb)}" alt="${escapeHTML(p.title)}" loading="lazy"><span>${escapeHTML(p.title)}</span></button>`).join("")
      : "<p class='note'>No photos of famous places within 10 km.</p>";
  }).catch(() => { if ($("ovGallery")) $("ovGallery").innerHTML = "<p class='note'>Photos unavailable (check internet).</p>"; });
  try {
    let s = null;
    try { s = await getWikiSummary(place.wiki || place.name); } catch (e) { s = null; }
    if (!s || s.type === "disambiguation") {
      // fall back to the most popular real article near this point
      const near = await getNearbyPlaces(place.lat, place.lng, 10000, place.name);
      if (near.length) s = await getWikiSummary(near[0].title);
    }
    const box = $("ovText");
    if (!box) return;
    box.className = "";
    box.innerHTML = s
      ? `<p>${escapeHTML(s.extract)}</p><div class="link-btns"><a class="link-btn" target="_blank" rel="noopener" href="${escapeHTML(s.content_urls.desktop.page)}">📖 Read on Wikipedia</a></div>`
      : "<p>No Wikipedia article found for this exact spot.</p>";
  } catch (e) {
    if ($("ovText")) $("ovText").textContent = "Could not load the description (check internet).";
  }
}

// ----- Live tab: real weather, time, air quality, currency -----
function tabLive(body, place) {
  renderLiveStatus(body, place);
}

async function renderLiveStatus(box, place) {
  box.innerHTML = `<p class="loader">Getting live data for ${escapeHTML(place.name)}…</p>`;
  try {
    const [w, air, fx] = await Promise.all([
      getWeather(place.lat, place.lng),
      getAirQuality(place.lat, place.lng).catch(() => null),
      getRates().catch(() => null)
    ]);
    const cur = w.current;
    const [emoji, text] = weatherInfo(cur.weather_code);
    const country = countryOf(place.cc);
    let fxHtml = "";
    if (fx && country && country.currency !== "INR" && fx.values[country.currency]) {
      const r = fx.values[country.currency];
      fxHtml = `<div class="info-box"><span>💱 Live exchange rate</span><b>1 ${country.currency} = ₹${(1 / r).toFixed(2)}</b>
                <span>₹1,000 = ${(1000 * r).toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${country.currency}</span></div>`;
    }
    let aqiHtml = "";
    if (air && air.current && air.current.us_aqi != null) {
      const [label, color] = aqiInfo(air.current.us_aqi);
      aqiHtml = `<div class="info-box"><span>🌬️ Air quality (US AQI)</span><b>${air.current.us_aqi}</b> <span class="pill ${color}">${label}</span></div>`;
    }
    const forecast = w.daily.time.slice(0, 5).map((day, i) => {
      const [e] = weatherInfo(w.daily.weather_code[i]);
      const name = i === 0 ? "Today" : new Date(day + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" });
      return `<div>${name}<b>${e}</b>${Math.round(w.daily.temperature_2m_max[i])}° / ${Math.round(w.daily.temperature_2m_min[i])}°
              <br><small>💧${w.daily.precipitation_probability_max[i] ?? 0}%</small></div>`;
    }).join("");

    box.innerHTML = `
      <p><span class="live-dot"></span><b>LIVE</b> · updated ${new Date().toLocaleTimeString()}</p>
      <div class="live-now">
        <div class="big">${emoji}</div>
        <div><h3>${Math.round(cur.temperature_2m)}°C</h3><p>${text} · feels like ${Math.round(cur.apparent_temperature)}°C</p></div>
      </div>
      <div class="info-grid">
        <div class="info-box"><span>🕒 Local time (${escapeHTML(w.timezone)})</span><b class="local-clock" data-offset="${w.utc_offset_seconds}">--:--</b></div>
        <div class="info-box"><span>💧 Humidity · 💨 Wind</span><b>${cur.relative_humidity_2m}% · ${Math.round(cur.wind_speed_10m)} km/h</b></div>
        <div class="info-box"><span>🌅 Sunrise · 🌇 Sunset</span><b>${w.daily.sunrise[0].slice(11)} · ${w.daily.sunset[0].slice(11)}</b></div>
        ${aqiHtml}
        ${fxHtml}
      </div>
      <h4>Next 5 days</h4>
      <div class="forecast">${forecast}</div>
      <p class="note">${travelAdvice(w)}</p>
      <p class="note">Sources: Open-Meteo (weather & air), ExchangeRate-API (currency).</p>`;
    tickClocks();
  } catch (e) {
    box.innerHTML = `<p>❌ Could not load live data. Check your internet and try again.</p>`;
  }
}

// Simple advice from the real forecast
function travelAdvice(w) {
  const rain = Math.max(...w.daily.precipitation_probability_max.slice(0, 5).map(v => v || 0));
  const max = Math.max(...w.daily.temperature_2m_max.slice(0, 5));
  const min = Math.min(...w.daily.temperature_2m_min.slice(0, 5));
  const tips = [];
  if (rain >= 60) tips.push("☔ High chance of rain: carry an umbrella / raincoat");
  if (min <= 5) tips.push("🧥 Very cold nights: pack thermals and a heavy jacket");
  else if (min <= 15) tips.push("🧶 Cool evenings: pack a sweater");
  if (max >= 35) tips.push("🥵 Very hot: sunscreen, cap, and drink lots of water");
  if (!tips.length) tips.push("😊 Pleasant weather for sightseeing");
  return "Advice: " + tips.join(" · ");
}

// ----- Places tab: REAL places from Wikipedia ranked by real popularity -----
async function tabPlaces(body, place) {
  body.innerHTML = `<h4>⭐ Best places nearby</h4><p class="loader">Finding real places within 10 km…</p>`;
  try {
    const list = (await getNearbyPlaces(place.lat, place.lng, 10000, place.name)).slice(0, 15);
    if (!list.length) {
      body.innerHTML = "<h4>⭐ Best places nearby</h4><p>No famous places recorded within 10 km. Try a bigger town nearby.</p>";
      return;
    }
    body.innerHTML = `<h4>⭐ Best places nearby (${list.length})</h4>
      <p class="note">Ranked by real popularity: Wikipedia readers in the last 30 days. Distance is from the selected point.</p>` +
      list.map(p => `
        <div class="row-item">
          ${p.thumb ? `<img src="${escapeHTML(p.thumb)}" alt="">` : `<div class="row-thumb">📍</div>`}
          <div class="grow">
            <h5>${escapeHTML(p.title)}</h5>
            <p>${escapeHTML(p.desc)}</p>
            <div class="meta">
              <span class="stars" title="Popularity">${starText(p.stars)}</span>
              <span class="pill">👀 ${p.views.toLocaleString("en-IN")} views/30 days</span>
              ${p.dist != null ? `<span class="pill blue">📏 ${formatKm(p.dist)}</span>` : ""}
            </div>
            <div class="link-btns">
              <a class="link-btn" target="_blank" rel="noopener" href="https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}">📖 About</a>
              ${p.lat != null ? `<a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}">🧭 Directions</a>` : ""}
            </div>
          </div>
        </div>`).join("");
  } catch (e) {
    body.innerHTML = "<p>❌ Could not load places (check internet).</p>";
  }
}

// ----- Stay tab: REAL hotels from OpenStreetMap + estimated price -----
async function tabStay(body, place) {
  const country = countryOf(place.cc);
  const base = (country ? country.cost : 9000) * 0.45 * 2;          // ≈ one room per night (comfort)
  const starMult = { 1: 0.45, 2: 0.65, 3: 1, 4: 1.7, 5: 3 };
  const searchName = encodeURIComponent(place.name + (place.country ? ", " + place.country : ""));
  body.innerHTML = `
    <h4>💡 Best for stay</h4>
    <div class="info-grid">
      <div class="info-box"><span>🎒 Budget (hostel / guest house)</span><b>~${formatMoney(base * 0.45)}</b><span>per room / night (est.)</span></div>
      <div class="info-box"><span>🧳 Comfort (3★)</span><b>~${formatMoney(base)}</b><span>per room / night (est.)</span></div>
      <div class="info-box"><span>💎 Luxury (5★)</span><b>~${formatMoney(base * 3)}</b><span>per room / night (est.)</span></div>
      <div class="info-box"><span>🏆 Tip</span><b>Stay near the centre</b><span>saves taxi money and time</span></div>
    </div>
    <div class="link-btns">
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.booking.com/searchresults.html?ss=${searchName}">🔎 Live prices on Booking.com</a>
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/travel/hotels/${searchName}">🔎 Google Hotels</a>
    </div>
    <h4>🏨 Real hotels nearby (OpenStreetMap)</h4>
    <div id="hotelList"><p class="loader">Loading real hotels…</p></div>`;
  try {
    const hotels = await getHotels(place.lat, place.lng);
    const box = $("hotelList");
    if (!box) return;
    if (!hotels.length) {
      box.innerHTML = "<p>No hotels are mapped in OpenStreetMap right here. Use the live price buttons above.</p>";
      return;
    }
    hotels.sort((a, b) => (b.stars || 0) - (a.stars || 0) || a.dist - b.dist);
    box.innerHTML = hotels.map(h => {
      const price = base * (starMult[Math.round(h.stars)] || 1);
      return `<div class="row-item">
        <div class="row-thumb">🏨</div>
        <div class="grow">
          <h5>${escapeHTML(h.name)}</h5>
          <p>${escapeHTML(h.address)}</p>
          <div class="meta">
            ${h.stars ? `<span class="stars">${starText(h.stars)}</span><span class="pill">${h.stars}★ official</span>` : `<span class="pill">Stars not listed</span>`}
            <span class="pill orange">~${formatMoney(price)}/night (est.)</span>
            <span class="pill blue">📏 ${formatKm(h.dist)}</span>
          </div>
          <div class="link-btns">
            <a class="link-btn" target="_blank" rel="noopener" href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name + " " + place.name)}">💲 Check price</a>
            <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}&query_place_id=">⭐ Reviews on Maps</a>
          </div>
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    const box = $("hotelList");
    if (box) box.innerHTML = "<p>Hotel list is busy right now. Use the live price buttons above.</p>";
  }
}

// ----- Map tab: real OpenStreetMap map + satellite view link -----
function tabMap(body, place) {
  const d = 0.04;
  const bbox = [place.lng - d, place.lat - d, place.lng + d, place.lat + d].join(",");
  body.innerHTML = `
    <h4>🗺️ Real map (OpenStreetMap)</h4>
    <iframe class="map-frame" loading="lazy" title="Map of ${escapeHTML(place.name)}"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${place.lat},${place.lng}"></iframe>
    <div class="link-btns">
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/@${place.lat},${place.lng},15z/data=!3m1!1e3">🛰️ Satellite view</a>
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}">📍 Open in Google Maps</a>
      <a class="link-btn" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=13/${place.lat}/${place.lng}">🗺️ Big map</a>
    </div>
    <p class="note">Tip: switch the globe to 🛰️ Satellite and scroll to zoom into real satellite photos.</p>`;
}

// ----- Cost tab: interactive estimate -----
function tabCost(body, place) {
  body.innerHTML = `
    <h4>💰 Trip cost calculator</h4>
    <div class="form-grid">
      <div class="form-row"><label>Days: <b id="gcDaysVal">5</b></label><input type="range" id="gcDays" min="1" max="30" value="5"></div>
      <div class="form-row"><label>Travellers: <b id="gcPeopleVal">1</b></label><input type="range" id="gcPeople" min="1" max="10" value="1"></div>
    </div>
    <div class="segmented" id="gcStyle">
      <button type="button" data-style="budget">🎒 Budget</button>
      <button type="button" data-style="mid" class="active">🧳 Comfort</button>
      <button type="button" data-style="luxury">💎 Luxury</button>
    </div>
    <div id="gcResult" class="mt"></div>`;
  let style = "mid";
  const update = () => {
    const days = +$("gcDays").value, people = +$("gcPeople").value;
    $("gcDaysVal").textContent = days;
    $("gcPeopleVal").textContent = people;
    $("gcResult").innerHTML = costBreakdownHTML(tripCost(place, days, people, style), people);
  };
  $("gcDays").addEventListener("input", update);
  $("gcPeople").addEventListener("input", update);
  document.querySelectorAll("#gcStyle button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("#gcStyle button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    style = b.dataset.style;
    update();
  }));
  update();
}

// Shared HTML for a cost breakdown (bars)
function costBreakdownHTML(cost, people) {
  const colors = ["#1e88e5", "#ff6b35", "#2bb673", "#f72585", "#7b5cd6", "#c9a227", "#06d6a0", "#94a3b8"];
  const max = Math.max(...Object.values(cost.items));
  const rows = Object.entries(cost.items).filter(([, v]) => v > 0).map(([k, v], i) => `
    <div class="cost-row"><span>${k}</span>
      <div class="bar"><div style="width:${(v / max) * 100}%;background:${colors[i % colors.length]}"></div></div>
      <b>${formatMoney(v)}</b></div>`).join("");
  return `<div class="total-box">
      <div><small>Estimated total</small><h3>${formatMoney(cost.total)}</h3></div>
      <div><small>Per person</small><br><b>${formatMoney(cost.perPerson)}</b> · ${people} traveller${people > 1 ? "s" : ""}</div>
    </div>${rows}
    <p class="note">Estimate = real distance (${formatKm(cost.km)}) + the country's cost-of-living level. Live prices may differ.</p>`;
}

// ----- Visa tab -----
function tabVisa(body, place) {
  const cc = (place.cc || "").toUpperCase();
  const country = countryOf(cc);
  const type = cc === "IN" ? "home" : (country ? country.visa : "check");
  const info = VISA_TEXT[type];
  const fee = type === "home" ? 0 : (VISA_FEE[cc] ?? VISA_DEFAULT_FEE[type]);
  const official = VISA_LINKS[cc];
  const search = `https://www.google.com/search?q=${encodeURIComponent((place.country || "country") + " tourist visa for Indian citizens official website")}`;
  body.innerHTML = `
    <div class="visa-badge visa-${type === "schengen" ? "visa" : type}">${info.label}</div>
    ${!country && cc !== "IN" ? `<p class="note">We don't have saved rules for this country, so please check the official website.</p>` : ""}
    ${type !== "home" ? `<p><b>Approx. fee:</b> ${fee ? formatMoney(fee) + " per person" : "Free"} · <b>Apply:</b> ${VISA_LEAD_DAYS[type] ? VISA_LEAD_DAYS[type] + "+ days before travel" : "no advance visa needed"}</p>` : ""}
    <h4>📄 Documents needed</h4>
    <ul class="steps-list">${info.docs.map(d => `<li>${d}</li>`).join("")}</ul>
    <h4>🪜 How to apply</h4>
    <ol class="steps-list">${info.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    ${type !== "home" ? `
    <h4>🛂 Don't have a passport yet?</h4>
    <ol class="steps-list">
      <li>Register on <a href="https://www.passportindia.gov.in/" target="_blank" rel="noopener">passportindia.gov.in</a> (official Passport Seva site)</li>
      <li>Fill the form, pay the fee (₹1,500 normal / ₹3,500 Tatkal for 36 pages)</li>
      <li>Visit the Passport Seva Kendra with Aadhaar + 10th marksheet / birth certificate</li>
      <li>Police verification, then the passport arrives by Speed Post</li>
    </ol>` : ""}
    <div class="link-btns">
      ${official ? `<a class="link-btn" target="_blank" rel="noopener" href="${official}">🏛️ Official visa website</a>` : ""}
      ${type !== "home" ? `<a class="link-btn" target="_blank" rel="noopener" href="${search}">🔎 Find the official rules</a>` : ""}
    </div>
    <p class="note">⚠️ Visa rules change. Always confirm on the official government website before booking.</p>`;
}

// ----- Reach tab: real distance, real road route, real airports -----
async function tabReach(body, place) {
  const origin = getOrigin();
  const km = haversine(origin.lat, origin.lng, place.lat, place.lng);
  const domestic = (place.cc || "").toUpperCase() === "IN";
  const from = origin.name.split(",")[0].split(" (")[0];
  body.innerHTML = `
    <h4>📏 Distance from ${escapeHTML(origin.name)}${origin.live ? " (live GPS)" : ""}</h4>
    <div class="info-grid">
      <div class="info-box"><span>Straight-line (real, Haversine)</span><b>${formatKm(km)}</b></div>
      <div class="info-box"><span>By road (real, OSRM)</span><b id="roadKm">checking…</b></div>
    </div>
    <h4>🧭 All ways to go (one way, per person)</h4>
    <div id="modesBox"><p class="loader">Checking the real road route…</p></div>
    <h4>🛫 Nearest airports</h4><div id="airportBox"><p class="loader">Finding airports…</p></div>
    <p class="note">Distances and road times are real (live from OpenStreetMap/OSRM). Fares are estimates: tap a booking button for today's live price.</p>`;

  // Real road route (only tried when it could be on the same landmass)
  const road = km < 4000 ? await getRoadRoute(origin, place) : null;
  if ($("roadKm")) $("roadKm").textContent = road ? `${formatKm(road.km)} · ${formatHours(road.hours)}` : "No road (sea / too far)";

  // Build every travel option: flight, train, bus, own car
  const modes = [];
  let trainNote = "";
  const flightHours = km / 780 + (km > 7500 ? 4.5 : 1.5) + 1.5;            // flying + check-in/security (+ stop)
  const flightDocs = domestic ? "Photo ID (Aadhaar / DL / Voter ID) + e-ticket"
    : "Passport (6+ months valid) + visa/e-Visa + return ticket + hotel booking";
  if (km > 250 || !road) {
    modes.push({ icon: "✈️", name: km > 7500 ? "Flight (1 stop)" : "Flight", km, hours: flightHours,
      cost: (4000 + 7 * km) / 2, docs: flightDocs,
      link: `https://www.google.com/travel/flights?q=${encodeURIComponent("flights from " + from + " to " + place.name)}`, linkText: "Live flight prices" });
  }
  if (road && domestic) {
    // Is there a REAL railway station near the destination? (OpenStreetMap)
    const station = await getNearestStation(place);
    if (station) {
      // Indian Railways: ~50 km/h average; fares ≈ ₹0.5/km sleeper, ₹1.3/km 3AC (approx.)
      modes.push({ icon: "🚆", name: "Train (Sleeper / 3AC)", km: road.km, hours: road.km / 50 + 0.5,
        cost: road.km * 0.5, cost2: road.km * 1.3, docs: "e-ticket (IRCTC) + original photo ID",
        note: `Nearest station: <b>${escapeHTML(station.name)}</b> (${formatKm(station.dist)} from ${escapeHTML(place.name.split(",")[0])})`,
        link: "https://www.irctc.co.in/nget/train-search", linkText: "IRCTC trains" });
    } else {
      trainNote = `🚆 No railway station within ~35 km of ${escapeHTML(place.name.split(",")[0])} (OpenStreetMap). Take a train to the nearest big city, then a bus or taxi.`;
    }
  }
  if (road && road.km < 1600) {
    modes.push({ icon: "🚌", name: "Bus (AC sleeper)", km: road.km, hours: road.hours * 1.25,
      cost: road.km * 1.6, docs: domestic ? "Bus ticket + photo ID" : "Passport + visa + bus ticket",
      link: `https://www.redbus.in/search?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(place.name.split(",")[0])}`, linkText: "Search buses" });
  }
  if (road) {
    // petrol car: ~₹7/km fuel (₹105/L, 15 km/L) + ~₹1.5/km tolls, shared by up to 4 people
    modes.push({ icon: "🚗", name: "Own car / taxi", km: road.km, hours: road.hours,
      cost: road.km * 8.5 / 4, note: `Car total ≈ ${formatMoney(road.km * 8.5)} (fuel + tolls), split by 4`,
      docs: domestic ? "Driving licence + RC + insurance + PUC" : "Driving licence + IDP + car permit at border + passport",
      link: `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${place.lat},${place.lng}&travelmode=driving`, linkText: "Live traffic route" });
  }
  const fastest = Math.min(...modes.map(m => m.hours));
  const cheapest = Math.min(...modes.map(m => m.cost));
  if ($("modesBox")) {
    $("modesBox").innerHTML = modes.map(m => `
      <div class="row-item">
        <div class="row-thumb">${m.icon}</div>
        <div class="grow">
          <h5>${m.name} ${m.hours === fastest ? '<span class="pill blue">⚡ Fastest</span>' : ""} ${m.cost === cheapest ? '<span class="pill green">💸 Cheapest</span>' : ""}</h5>
          <div class="meta">
            <span class="pill">📏 ${formatKm(m.km)}</span>
            <span class="pill">⏱️ ${formatHours(m.hours)}</span>
            <span class="pill orange">💰 ~${formatMoney(m.cost)}${m.cost2 ? " – " + formatMoney(m.cost2) : ""}</span>
          </div>
          <p>📄 ${m.docs}</p>
          ${m.note ? `<p>${m.note}</p>` : ""}
          <div class="link-btns"><a class="link-btn" target="_blank" rel="noopener" href="${m.link}">🔎 ${m.linkText}</a></div>
        </div>
      </div>`).join("") + (trainNote ? `<p class="note">${trainNote}</p>` : "");
  }
  try {
    const airports = await getAirports(place.lat, place.lng);
    if ($("airportBox")) {
      $("airportBox").innerHTML = airports.length
        ? airports.map(a => `<div class="row-item"><div class="row-thumb">🛫</div><div class="grow"><h5>${escapeHTML(a.name)}</h5>
            <p>${formatKm(a.dist)} from ${escapeHTML(place.name)} · about ${formatHours(a.dist / 35 + 0.25)} by taxi (city traffic)</p></div></div>`).join("")
        : "<p>No airport within ~120 km. Fly to the nearest big city, then take a train, bus or taxi.</p>";
    }
  } catch (e) {
    if ($("airportBox")) $("airportBox").innerHTML = "<p>Airport search is busy, try again later.</p>";
  }
}

// Buttons inside the guide header
function addPlaceToBucket() {
  if (!currentPlace) return;
  const est = tripCost(currentPlace, 5, 1, "mid");
  openAddForm({
    name: currentPlace.name, country: currentPlace.country, cc: currentPlace.cc,
    continent: (countryOf(currentPlace.cc) || {}).continent || "",
    lat: currentPlace.lat, lng: currentPlace.lng, budget: est.total
  });
}

function planCurrentPlace() {
  updatePlannerOptions();
  $("planDest").value = "current";
  goTo("planner");
  calculatePlan();
}


/* =====================================================================
   PART 11: SEARCH ANY PLACE + QUICK CITY BUTTONS
   ===================================================================== */
async function runSearch(text, resultsBox) {
  if (!text.trim()) return;
  resultsBox.innerHTML = `<button disabled>🔎 Searching…</button>`;
  try {
    const list = await searchPlaces(text);
    if (!list.length) {
      resultsBox.innerHTML = `<button disabled>No place found. Check the spelling.</button>`;
      return;
    }
    resultsBox.innerHTML = list.map((p, i) =>
      `<button data-i="${i}">📍 ${escapeHTML(p.name)} <small>${escapeHTML(p.label)}</small></button>`).join("");
    resultsBox.querySelectorAll("button[data-i]").forEach(btn => btn.addEventListener("click", () => {
      resultsBox.innerHTML = "";
      openGuide(list[btn.dataset.i]);
      goTo("explore");
    }));
  } catch (e) {
    resultsBox.innerHTML = `<button disabled>Search failed. Check internet.</button>`;
  }
}

function renderQuickCities() {
  $("quickCities").innerHTML = CITIES.map(c => `<button class="chip" data-city="${c.id}">${escapeHTML(c.name)}</button>`).join("");
  $("quickCities").querySelectorAll(".chip").forEach(btn => btn.addEventListener("click", () => {
    openGuide(cityToPlace(CITIES.find(c => c.id === btn.dataset.city)));
  }));
}

function renderHomeSelect() {
  $("homeSelect").innerHTML = HOME_CITIES.map(h => `<option value="${h.id}">${h.name}</option>`).join("");
  $("homeSelect").value = settings.home;
}


/* =====================================================================
   PART 12: TRIP BUDGET PLANNER
   ===================================================================== */
function updatePlannerOptions() {
  const select = $("planDest");
  const old = select.value;
  let html = "";
  if (currentPlace) html += `<option value="current">📍 ${escapeHTML(currentPlace.name)} (selected on globe)</option>`;
  html += `<optgroup label="Famous destinations">` +
    CITIES.map(c => `<option value="city:${c.id}">${escapeHTML(c.name)} · ${countryOf(c.cc).name}</option>`).join("") + "</optgroup>";
  const mine = destinations.filter(d => d.lat != null && !d.visited);
  if (mine.length) {
    html += `<optgroup label="My bucket list">` +
      mine.map(d => `<option value="dest:${d.id}">${escapeHTML(d.name)}</option>`).join("") + "</optgroup>";
  }
  select.innerHTML = html;
  if ([...select.options].some(o => o.value === old)) select.value = old;

  // packing list destination select uses the same choices
  const pack = $("packDest");
  const oldPack = pack.value;
  pack.innerHTML = html;
  if ([...pack.options].some(o => o.value === oldPack)) pack.value = oldPack;
}

function placeFromSelect(value) {
  if (value === "current") return currentPlace;
  const [type, id] = value.split(":");
  if (type === "city") return cityToPlace(CITIES.find(c => c.id === id));
  const d = destinations.find(x => String(x.id) === id);
  return d ? destToPlace(d) : null;
}

async function calculatePlan(event) {
  if (event) event.preventDefault();
  const place = placeFromSelect($("planDest").value);
  const days = Math.max(1, Math.min(60, parseInt($("planDays").value) || 1));
  const people = Math.max(1, Math.min(20, parseInt($("planPeople").value) || 1));
  const month = parseInt($("planMonth").value);
  if (!place) return;

  const cost = tripCost(place, days, people, planStyle);
  const city = CITIES.find(c => c.id === place.cityId);
  let seasonNote = "";
  if (city) {
    seasonNote = city.best.includes(month)
      ? `<span class="pill green">✅ ${MONTHS[month - 1]} is a great month to visit</span>`
      : `<span class="pill orange">⚠️ ${MONTHS[month - 1]} is off-season. Best: ${city.best.map(m => MONTHS[m - 1]).join(", ")}</span>`;
  }
  const visaLead = VISA_LEAD_DAYS[cost.visaType];

  $("planResult").innerHTML = `
    <h3>${flagImg(place.cc, 20)} ${escapeHTML(place.name)} · ${days} days · ${people} traveller${people > 1 ? "s" : ""} · ${STYLE_NAME[planStyle]}</h3>
    <div class="meta mt">${seasonNote}
      <span class="pill blue">📏 ${formatKm(cost.km)} from ${escapeHTML(getOrigin().name.split(",")[0])}</span>
      <span class="pill">${cost.travel.mode} · ${formatHours(cost.travel.hours)}</span>
      <span class="pill ${cost.visaType === "home" || cost.visaType === "free" ? "green" : "orange"}">🛂 ${cost.visaType === "home" ? "No visa" : visaShort(cost.visaType)}${visaLead ? " · apply " + visaLead + " days early" : ""}</span>
    </div>
    <div class="mt">${costBreakdownHTML(cost, people)}</div>
    <h4 class="mt">🗓️ Day-by-day plan (real top places)</h4>
    <div class="itinerary" id="itinerary"><p class="loader">Building itinerary from real places…</p></div>
    <div class="link-btns no-print">
      <button class="btn btn-primary btn-sm" id="planAddBtn">+ Add to Bucket List with this budget</button>
      <button class="btn btn-sm btn-outline-dark" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>`;

  $("planAddBtn").addEventListener("click", () => openAddForm({
    name: place.name, country: place.country, cc: place.cc,
    continent: (countryOf(place.cc) || {}).continent || "", lat: place.lat, lng: place.lng, budget: cost.total
  }));

  // Real itinerary: top places by popularity, 2 per full day
  try {
    const spots = (await getNearbyPlaces(place.lat, place.lng, 10000, place.name)).slice(0, Math.max(2, (days - 1) * 2));
    const box = $("itinerary");
    if (!box) return;
    const rows = [];
    for (let day = 1; day <= Math.min(days, 14); day++) {
      let text;
      if (day === 1) text = `Arrive (${cost.travel.mode}), check in, relax and explore the local market.`;
      else if (day === days) text = "Souvenir shopping and return journey.";
      else {
        const two = spots.slice((day - 2) * 2, (day - 2) * 2 + 2).map(s => `<b>${escapeHTML(s.title)}</b>`);
        text = two.length ? "Visit " + two.join(" and ") + "." : "Free day: local food walk or a day trip nearby.";
      }
      rows.push(`<div class="day"><div class="day-num">Day<br>${day}</div><p>${text}</p></div>`);
    }
    if (days > 14) rows.push(`<p class="note">…plus ${days - 14} more days of free exploring.</p>`);
    box.innerHTML = rows.join("");
  } catch (e) {
    if ($("itinerary")) $("itinerary").innerHTML = "<p>Could not load places for the itinerary (check internet).</p>";
  }
}


/* =====================================================================
   PART 13: BALANCE BUCKET (where can I go with my money?)
   ===================================================================== */
function renderBalance(event) {
  if (event) event.preventDefault();
  const balance = Math.max(0, parseFloat($("balAmount").value) || 0);
  const days = Math.max(1, parseInt($("balDays").value) || 1);
  const people = Math.max(1, parseInt($("balPeople").value) || 1);
  const style = $("balStyle").value;
  const scope = $("balScope").value;

  let list = CITIES
    .filter(c => scope === "all" || (scope === "india" ? c.cc === "IN" : c.cc !== "IN"))
    .map(c => ({ city: c, cost: tripCost(cityToPlace(c), days, people, style) }));

  const ok = list.filter(x => x.cost.total <= balance).sort((a, b) => b.cost.total - a.cost.total);
  const no = list.filter(x => x.cost.total > balance).sort((a, b) => a.cost.total - b.cost.total);

  $("balSummary").innerHTML = `<div class="summary-card">
      <div><h3>🎉 You can afford ${ok.length} of ${list.length} trips</h3>
        <p class="muted">${formatMoney(balance)} · ${days} days · ${people} traveller${people > 1 ? "s" : ""} · ${STYLE_NAME[style]} · from ${escapeHTML(getOrigin().name.split(",")[0])}</p></div>
      ${no.length ? `<p>Next goal: <b>${escapeHTML(no[0].city.name)}</b>, save <b>${formatMoney(no[0].cost.total - balance)}</b> more</p>` : "<p>🌍 You can go anywhere on our list!</p>"}
    </div>`;

  // keep it simple: show the best 8 first, the rest after "Show all trips"
  const all = [...ok, ...no];
  const shown = balShowAll ? all : all.slice(0, 8);
  $("balMore").style.display = all.length > 8 ? "inline-block" : "none";
  $("balMore").textContent = balShowAll ? "Show fewer" : `Show all ${all.length} trips`;
  $("balGrid").innerHTML = shown.map(({ city, cost }) => {
    const fits = cost.total <= balance;
    const pct = Math.min(100, Math.round((balance / cost.total) * 100));
    const country = countryOf(city.cc);
    return `<div class="bal-card ${fits ? "ok" : "no"}">
      <div class="top">${flagImg(city.cc, 40)}<div><h4>${escapeHTML(city.name)}</h4><small class="muted">${country.name} · ${formatKm(cost.km)}</small></div></div>
      <div class="cost">${formatMoney(cost.total)}</div>
      <small class="muted">${formatMoney(cost.perPerson)} per person · ${visaShort(cost.visaType) || "No visa"}</small>
      <div class="progress mt"><div class="progress-fill savings" style="width:${pct}%"></div></div>
      <p class="tip ${fits ? "done" : ""}">${fits ? "✅ Affordable! " + formatMoney(balance - cost.total) + " left over" : "🔒 Need " + formatMoney(cost.total - balance) + " more (" + pct + "% ready)"}</p>
      <div class="card-actions">
        <button class="btn-save" onclick="openGuide(cityToPlace(CITIES.find(c => c.id === '${city.id}')))">🧭 Guide</button>
        <button class="btn-visit" onclick="addCityFromBalance('${city.id}', ${cost.total})">+ Bucket</button>
      </div>
    </div>`;
  }).join("");
}

function addCityFromBalance(cityId, total) {
  const c = CITIES.find(x => x.id === cityId);
  const balance = Math.max(0, parseFloat($("balAmount").value) || 0);
  openAddForm({ name: c.name, country: countryOf(c.cc).name, cc: c.cc, continent: countryOf(c.cc).continent,
                lat: c.lat, lng: c.lng, budget: total, saved: Math.min(balance, total) });
}


/* =====================================================================
   PART 14: RENDER BUCKET LIST CARDS
   ===================================================================== */
function renderCards() {
  const searchText = searchInput.value.toLowerCase().trim();
  const status = statusSelect.value;

  let list = destinations.filter(dest => {
    const continentOK = currentContinent === "All" || dest.continent === currentContinent;
    const statusOK = status === "all" || (status === "visited" && dest.visited) || (status === "dream" && !dest.visited);
    const searchOK = dest.name.toLowerCase().includes(searchText) || dest.country.toLowerCase().includes(searchText);
    return continentOK && statusOK && searchOK;
  });

  const sortBy = sortSelect.value;
  if (sortBy === "year") list.sort((a, b) => a.year - b.year);
  if (sortBy === "budget") list.sort((a, b) => a.budget - b.budget);
  if (sortBy === "progress") list.sort((a, b) => getPercent(b) - getPercent(a));
  if (sortBy === "newest") list.sort((a, b) => b.id - a.id);

  $("emptyState").style.display = list.length === 0 ? "block" : "none";

  cardsGrid.innerHTML = list.map(dest => {
    const percent = getPercent(dest);
    const tip = getSavingTip(dest);
    const emoji = CONTINENT_EMOJI[dest.continent] || "🌍";
    const stepIndex = STATUSES.findIndex(s => s.id === dest.status);
    const days = daysUntil(dest.travelDate);
    let countdown = "";
    if (!dest.visited && days != null) {
      countdown = days > 0 ? `⏳ ${days} days to go` : days === 0 ? "🎉 Trip starts today!" : "📅 Trip date passed";
    }
    const photoHTML = dest.photo ? `<img src="${escapeHTML(dest.photo)}" alt="${escapeHTML(dest.name)}" onerror="this.remove()">` : "";

    return `
      <div class="card ${dest.visited ? "is-visited" : ""}">
        <div class="card-img">
          ${emoji}
          ${photoHTML}
          <span class="continent-badge">${emoji} ${escapeHTML(dest.continent)}</span>
          <span class="year-badge">🎯 ${dest.travelDate ? niceDate(dest.travelDate) : dest.year}</span>
          ${dest.visited ? `<span class="stamp">VISITED ✔</span>` : ""}
        </div>

        <div class="card-body">
          <h3>${escapeHTML(dest.name)}</h3>
          <p class="card-country">📍 ${escapeHTML(dest.country)}</p>
          ${dest.note ? `<p class="card-note">"${escapeHTML(dest.note)}"</p>` : ""}

          <div class="money-row">
            <span>Saved: <b>${formatMoney(dest.saved)}</b></span>
            <span>Goal: ${formatMoney(dest.budget)}</span>
          </div>
          <div class="progress"><div class="progress-fill savings" style="width:${percent}%"></div></div>
          <div class="money-row"><span>${percent}% saved</span></div>

          <p class="tip ${tip.done ? "done" : ""}">${tip.text}</p>

          <!-- Trip status tracker -->
          <div class="status-track">${STATUSES.map((s, i) => `<span class="${i <= stepIndex ? "on" : ""}" title="${s.label}"></span>`).join("")}</div>
          <div class="status-row">
            <select onchange="changeStatus(${dest.id}, this.value)" aria-label="Trip status">
              ${STATUSES.map(s => `<option value="${s.id}" ${s.id === dest.status ? "selected" : ""}>${s.label}</option>`).join("")}
            </select>
            <span class="countdown">${countdown}</span>
          </div>

          <div class="card-actions">
            <button class="btn-save" onclick="openSaveModal(${dest.id})">💰 Save</button>
            <button class="btn-visit ${dest.visited ? "visited" : ""}" onclick="toggleVisited(${dest.id})">
              ${dest.visited ? "✔ Visited!" : "📍 Mark Visited"}
            </button>
            <button class="btn-live" title="Live status" onclick="openLiveStatus(${dest.id})">🔴</button>
            <button class="btn-edit" title="Show on globe & guide" onclick="showDestOnGlobe(${dest.id})">🌍</button>
            <button class="btn-edit" title="Edit" onclick="openEditForm(${dest.id})">✏️</button>
            <button class="btn-delete" title="Delete" onclick="deleteDestination(${dest.id})">🗑️</button>
          </div>
        </div>
      </div>`;
  }).join("");
}

function renderStats() {
  const total = destinations.length;
  const visited = destinations.filter(d => d.visited).length;
  const totalBudget = destinations.reduce((sum, d) => sum + d.budget, 0);
  const totalSaved = destinations.reduce((sum, d) => sum + Math.min(d.saved, d.budget), 0);
  const completion = total ? Math.round((visited / total) * 100) : 0;
  const savePercent = totalBudget ? Math.round((totalSaved / totalBudget) * 100) : 0;

  // numbers count up smoothly to their new value
  animateNumber($("statTotal"), total, n => Math.round(n));
  animateNumber($("statVisited"), visited, n => Math.round(n));
  animateNumber($("statSaved"), totalSaved, formatMoney);
  animateNumber($("statBudget"), totalBudget, formatMoney);
  $("completionText").textContent = completion + "% (" + visited + "/" + total + ")";
  $("completionBar").style.width = completion + "%";
  $("overallSaveText").textContent = savePercent + "%";
  $("overallSaveBar").style.width = savePercent + "%";

  const next = destinations.filter(d => !d.visited && d.travelDate && daysUntil(d.travelDate) >= 0)
    .sort((a, b) => a.travelDate.localeCompare(b.travelDate))[0];
  $("nextTrip").innerHTML = next
    ? `⏳ Next adventure: <b>${escapeHTML(next.name)}</b> on ${niceDate(next.travelDate)}<div class="timer" data-date="${next.travelDate}"></div>`
    : "⏳ No upcoming trip date yet. Use Tools → Trip Countdown or set a travel date on a card.";
}

function renderPassport() {
  const visitedList = destinations.filter(d => d.visited).sort((a, b) => (a.visitedOn || "").localeCompare(b.visitedOn || ""));
  $("stampCount").textContent = visitedList.length + (visitedList.length === 1 ? " stamp" : " stamps");
  $("emptyPassport").style.display = visitedList.length ? "none" : "block";
  $("stampsGrid").innerHTML = visitedList.map((dest, index) => {
    const color = STAMP_COLORS[index % STAMP_COLORS.length];
    const angle = (index % 2 === 0 ? -1 : 1) * (6 + (index % 3) * 4);
    return `
      <div class="passport-stamp" style="color:${color}; border-color:${color}; transform:rotate(${angle}deg)">
        <span class="s-emoji">${CONTINENT_EMOJI[dest.continent] || "🌍"}</span>
        <span class="s-name">${escapeHTML(dest.name)}</span>
        <span class="s-date">${escapeHTML(dest.country)} · ${niceDate(dest.visitedOn)}</span>
      </div>`;
  }).join("");
}

// One function that refreshes everything that depends on the bucket list
function renderAll() {
  renderCards();
  renderStats();
  renderPassport();
  renderTimeline();
  refreshGlobeData();
  updatePlannerOptions();
  updateExtraSelects();
  tickClocks();
}


/* =====================================================================
   PART 15: ADD / EDIT FORM
   ===================================================================== */
// prefill = optional values (used when adding from the globe, planner or balance bucket)
function openAddForm(prefill = {}) {
  destForm.reset();
  clearErrors();
  $("destId").value = "";
  $("destName").value = prefill.name || "";
  $("destCountry").value = prefill.country || "";
  $("destContinent").value = prefill.continent || "";
  $("destYear").value = prefill.year || new Date().getFullYear() + 1;
  $("destBudget").value = prefill.budget ? Math.round(prefill.budget) : "";
  $("destSaved").value = prefill.saved ? Math.round(prefill.saved) : 0;
  $("destLat").value = prefill.lat ?? "";
  $("destLng").value = prefill.lng ?? "";
  $("destCc").value = prefill.cc || "";
  $("formTitle").textContent = "🌍 Add Dream Destination";
  $("submitBtn").textContent = "Save Destination";
  updatePhotoPreview();
  formModal.classList.add("open");
}

function openEditForm(id) {
  const dest = destinations.find(d => d.id === id);
  if (!dest) return;
  clearErrors();
  $("destId").value = dest.id;
  $("destName").value = dest.name;
  $("destCountry").value = dest.country;
  $("destContinent").value = dest.continent;
  $("destYear").value = dest.year;
  $("destDate").value = dest.travelDate || "";
  $("destBudget").value = dest.budget;
  $("destSaved").value = dest.saved;
  $("destPhoto").value = dest.photo;
  $("destNote").value = dest.note;
  $("destLat").value = dest.lat ?? "";
  $("destLng").value = dest.lng ?? "";
  $("destCc").value = dest.cc || "";
  $("formTitle").textContent = "✏️ Edit Destination";
  $("submitBtn").textContent = "Update Destination";
  updatePhotoPreview();
  formModal.classList.add("open");
}

function closeModals() {
  formModal.classList.remove("open");
  saveModal.classList.remove("open");
  liveModal.classList.remove("open");
  $("authModal").classList.remove("open");
}

function clearErrors() {
  document.querySelectorAll(".error").forEach(el => (el.textContent = ""));
  document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
}

function setError(inputId, errorId, message) {
  $(inputId).classList.add("invalid");
  $(errorId).textContent = message;
}

function validateForm(data) {
  clearErrors();
  let ok = true;
  const thisYear = new Date().getFullYear();
  if (data.name.length < 2) { setError("destName", "errName", "Please enter a destination name (min 2 letters)."); ok = false; }
  if (data.country.length < 2) { setError("destCountry", "errCountry", "Please enter the country."); ok = false; }
  if (!data.continent) { setError("destContinent", "errContinent", "Please choose a continent."); ok = false; }
  if (!data.year || data.year < thisYear - 50 || data.year > thisYear + 50) {
    setError("destYear", "errYear", "Enter a year between " + (thisYear - 50) + " and " + (thisYear + 50) + "."); ok = false;
  }
  if (!data.budget || data.budget <= 0) { setError("destBudget", "errBudget", "Budget must be more than ₹0."); ok = false; }
  if (data.saved < 0 || isNaN(data.saved)) { setError("destSaved", "errSaved", "Saved amount cannot be negative."); ok = false; }
  return ok;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const lat = $("destLat").value, lng = $("destLng").value;
  const data = {
    name: $("destName").value.trim(),
    country: $("destCountry").value.trim(),
    continent: $("destContinent").value,
    year: parseInt($("destYear").value),
    travelDate: $("destDate").value,
    budget: parseFloat($("destBudget").value),
    saved: parseFloat($("destSaved").value) || 0,
    photo: $("destPhoto").value.trim(),
    note: $("destNote").value.trim(),
    lat: lat === "" ? null : parseFloat(lat),
    lng: lng === "" ? null : parseFloat(lng),
    cc: $("destCc").value
  };
  if (!validateForm(data)) return;

  const editId = $("destId").value;
  let dest;
  if (editId) {
    dest = destinations.find(d => d.id === Number(editId));
    Object.assign(dest, data);
    showToast("✏️ " + data.name + " updated!");
  } else {
    dest = { id: Date.now(), ...data, visited: false, visitedOn: "", status: data.travelDate ? "planning" : "dream", prep: {} };
    destinations.push(dest);
    showToast("🌍 " + data.name + " added to your bucket list!");
  }
  saveData();
  renderAll();
  closeModals();

  // No map position yet? Look it up on OpenStreetMap so live status & globe work.
  if (dest.lat == null) locateDestination(dest);
}

async function locateDestination(dest) {
  try {
    const found = (await searchPlaces(dest.name + ", " + dest.country))[0] || (await searchPlaces(dest.name))[0];
    if (!found) return false;
    dest.lat = found.lat;
    dest.lng = found.lng;
    dest.cc = dest.cc || found.cc;
    saveData();
    renderAll();
    return true;
  } catch (e) {
    return false;
  }
}

function updatePhotoPreview() {
  const url = $("destPhoto").value.trim();
  const preview = $("photoPreview");
  if (url) {
    preview.style.backgroundImage = `url("${url.replace(/["\\]/g, "")}")`;
    preview.textContent = "";
  } else {
    preview.style.backgroundImage = "none";
    preview.textContent = "🖼️ Photo preview";
  }
}


/* =====================================================================
   PART 16: SAVINGS, STATUS, VISITED, DELETE
   ===================================================================== */
function openSaveModal(id) {
  const dest = destinations.find(d => d.id === id);
  savingForId = id;
  $("saveForName").textContent = "For " + dest.name + " · Saved " + formatMoney(dest.saved) + " of " + formatMoney(dest.budget);
  $("saveAmount").value = "";
  $("errSave").textContent = "";
  saveModal.classList.add("open");
  $("saveAmount").focus();
}

function confirmSavings() {
  const amount = parseFloat($("saveAmount").value);
  if (!amount || amount <= 0) {
    $("errSave").textContent = "Enter an amount greater than ₹0.";
    return;
  }
  const dest = destinations.find(d => d.id === savingForId);
  const wasComplete = dest.saved >= dest.budget;
  dest.saved += amount;
  saveData();
  renderAll();
  closeModals();
  if (!wasComplete && dest.saved >= dest.budget) {
    showToast("🎉 Goal reached! You can now afford " + dest.name + "!");
    launchConfetti();
  } else {
    showToast("💰 " + formatMoney(amount) + " added to " + dest.name);
  }
}

function changeStatus(id, status) {
  const dest = destinations.find(d => d.id === id);
  if (status === "visited" && !dest.visited) {
    toggleVisited(id);
    return;
  }
  if (status !== "visited" && dest.visited) {
    dest.visited = false;
    dest.visitedOn = "";
  }
  dest.status = status;
  saveData();
  renderAll();
  showToast("📌 " + dest.name + ": " + STATUSES.find(s => s.id === status).label);
}

function toggleVisited(id) {
  const dest = destinations.find(d => d.id === id);
  dest.visited = !dest.visited;
  if (dest.visited) {
    dest.visitedOn = todayISO();
    dest.status = "visited";
    showToast("🛂 Passport stamped! You visited " + dest.name + "!");
    launchConfetti();
  } else {
    dest.visitedOn = "";
    dest.status = "dream";
    showToast("↩️ " + dest.name + " moved back to dreams.");
  }
  saveData();
  renderAll();
}

function deleteDestination(id) {
  const dest = destinations.find(d => d.id === id);
  if (!confirm('Delete "' + dest.name + '" from your bucket list?')) return;
  destinations = destinations.filter(d => d.id !== id);
  saveData();
  renderAll();
  showToast("🗑️ " + dest.name + " removed.");
}

async function showDestOnGlobe(id) {
  const dest = destinations.find(d => d.id === id);
  if (dest.lat == null) {
    showToast("🔎 Finding " + dest.name + " on the map…");
    if (!(await locateDestination(dest))) { showToast("❌ Could not find this place on the map."); return; }
  }
  goTo("explore");
  openGuide(destToPlace(dest));
}


/* =====================================================================
   PART 17: LIVE STATUS POPUP (for a bucket list card)
   ===================================================================== */
async function openLiveStatus(id) {
  const dest = destinations.find(d => d.id === id);
  liveModal.classList.add("open");
  const box = $("liveContent");
  box.innerHTML = `<h2>🔴 Live status: ${escapeHTML(dest.name)}</h2><p class="loader">Locating…</p>`;
  if (dest.lat == null && !(await locateDestination(dest))) {
    box.innerHTML = `<h2>🔴 Live status</h2><p>❌ Could not find "${escapeHTML(dest.name)}" on the map. Edit the name and try again.</p>`;
    return;
  }
  const origin = getOrigin();
  const km = haversine(origin.lat, origin.lng, dest.lat, dest.lng);
  const days = daysUntil(dest.travelDate);
  box.innerHTML = `<h2>🔴 Live status: ${flagImg(dest.cc, 20)} ${escapeHTML(dest.name)}</h2>
    <div class="meta">
      <span class="pill blue">📏 ${formatKm(km)} from ${escapeHTML(origin.name)}${origin.live ? " (live GPS)" : ""}</span>
      <span class="pill">${STATUSES.find(s => s.id === dest.status).label}</span>
      ${days != null && !dest.visited ? `<span class="pill orange">⏳ ${days >= 0 ? days + " days to go" : "date passed"}</span>` : ""}
      <span class="pill green">💰 ${getPercent(dest)}% saved</span>
    </div>
    <div id="liveBody" class="mt"></div>`;
  renderLiveStatus($("liveBody"), destToPlace(dest));
}

// Every second: update all local clocks and countdown timers on the page
function tickClocks() {
  // your own current date & time (from your device clock and time zone)
  const now = new Date();
  if ($("nowClock")) {
    $("nowClock").textContent = now.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit" });
    $("nowZone").textContent = "· " + Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  document.querySelectorAll(".local-clock").forEach(el => {
    const local = new Date(Date.now() + Number(el.dataset.offset) * 1000);
    el.textContent = local.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
      " · " + local.toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
  });
  document.querySelectorAll(".timer[data-date]").forEach(el => {
    let ms = new Date(el.dataset.date + "T00:00:00") - Date.now();
    if (ms < 0) ms = 0;
    const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24,
          m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    el.innerHTML = `<div><b>${d}</b><span>days</span></div><div><b>${h}</b><span>hours</span></div>
                    <div><b>${m}</b><span>mins</span></div><div><b>${s}</b><span>secs</span></div>`;
  });
}


/* =====================================================================
   PART 18: TRIP TIMELINE (past · now · future) + PREP CHECKLIST
   ===================================================================== */
// Build the list of things to do before a trip, each with a real due date
function prepTasks(dest) {
  const cc = (dest.cc || "").toUpperCase();
  const country = countryOf(cc);
  const abroad = cc ? cc !== "IN" : !/india/i.test(dest.country);
  const type = !abroad ? "home" : (country ? country.visa : "check");
  const date = dest.travelDate;
  const due = n => (date ? addDays(date, -n) : "");
  const tasks = [];
  if (abroad) {
    tasks.push({ key: "passport", text: "🛂 Passport valid 6+ months after return", due: due(90) });
    if (type === "free") tasks.push({ key: "visa", text: "✅ Visa-free: print return ticket & hotel booking", due: due(7) });
    else if (type === "voa") tasks.push({ key: "visa", text: "🛬 Visa on arrival: carry photos + USD cash", due: due(7) });
    else tasks.push({ key: "visa", text: `${type === "evisa" ? "💻 Apply e-Visa online" : "🏛️ Apply for " + (type === "schengen" ? "Schengen visa" : "visa")} (${VISA_LEAD_DAYS[type]} days before)`, due: due(VISA_LEAD_DAYS[type]) });
  } else {
    tasks.push({ key: "id", text: "🪪 Carry original photo ID (Aadhaar etc.)", due: due(1) });
  }
  tasks.push({ key: "tickets", text: abroad ? "✈️ Book flights" : "🚆 Book train / flight", due: due(abroad ? 45 : 30) });
  tasks.push({ key: "stay", text: "🏨 Book hotel", due: due(30) });
  if (dest.saved < dest.budget) tasks.push({ key: "money", text: `💰 Save remaining ${formatMoney(dest.budget - dest.saved)}`, due: due(14) });
  if (abroad) {
    tasks.push({ key: "insurance", text: "🛡️ Buy travel insurance", due: due(7) });
    tasks.push({ key: "forex", text: `💱 Forex card / cash in ${country ? country.currency : "local currency"}`, due: due(5) });
  }
  tasks.push({ key: "pack", text: "🎒 Check live weather & pack", due: due(2) });
  return tasks;
}

function renderTimeline() {
  const past = destinations.filter(d => d.visited).sort((a, b) => (b.visitedOn || "").localeCompare(a.visitedOn || ""));
  const now = destinations.filter(d => !d.visited && d.status === "travelling");
  const future = destinations.filter(d => !d.visited && d.status !== "travelling")
    .sort((a, b) => (a.travelDate || "9999").localeCompare(b.travelDate || "9999"));

  $("tlPast").innerHTML = past.length ? past.map(d => `
    <div class="tl-item"><h4>${flagImg(d.cc, 20)} ${escapeHTML(d.name)}</h4>
      <p>✅ Visited on ${niceDate(d.visitedOn) || "-"} · ${escapeHTML(d.country)}</p></div>`).join("")
    : `<p class="tl-empty">No past trips yet. Mark a trip as visited to see it here.</p>`;

  $("tlNow").innerHTML = now.length ? now.map(d => `
    <div class="tl-item"><h4>${flagImg(d.cc, 20)} ${escapeHTML(d.name)}</h4>
      <p>✈️ You are travelling now. Enjoy!</p>
      <div class="card-actions">
        <button class="btn-live" style="flex:1 !important" onclick="openLiveStatus(${d.id})">🔴 Live weather & time</button>
        <button class="btn-visit" onclick="toggleVisited(${d.id})">✅ Trip done</button>
      </div></div>`).join("")
    : `<p class="tl-empty">No trip in progress. Set a card's status to "✈️ Travelling now" when you leave.</p>`;

  const today = todayISO();
  $("tlFuture").innerHTML = future.length ? future.map(d => {
    const tasks = prepTasks(d);
    const done = tasks.filter(t => d.prep[t.key]).length;
    const timer = d.travelDate && d.travelDate >= today
      ? `<div class="timer" data-date="${d.travelDate}"></div>`
      : `<p class="countdown">${d.travelDate ? "📅 Date passed. Update it!" : `📅 No date yet <button class="link-btn" onclick="openEditForm(${d.id})">Set date</button>`}</p>`;
    return `<div class="tl-item">
      <h4>${flagImg(d.cc, 20)} ${escapeHTML(d.name)}</h4>
      <p>${STATUSES.find(s => s.id === d.status).label}${d.travelDate ? " · " + niceDate(d.travelDate) : " · target " + d.year}</p>
      ${timer}
      <details class="prep" ${d.travelDate ? "open" : ""}>
        <summary><b>📋 Prep checklist (${done}/${tasks.length})</b></summary>
        <div class="checklist">${tasks.map(t => {
          const late = t.due && t.due < today && !d.prep[t.key];
          return `<label class="${d.prep[t.key] ? "done" : ""}">
            <input type="checkbox" ${d.prep[t.key] ? "checked" : ""} onchange="togglePrep(${d.id}, '${t.key}', this.checked)">
            <span>${t.text}</span>
            ${t.due ? `<small class="due ${late ? "late" : ""}">${late ? "⚠️ " : "by "}${niceDate(t.due)}</small>` : ""}
          </label>`;
        }).join("")}</div>
      </details>
    </div>`;
  }).join("") : `<p class="tl-empty">All your dreams are done! Add a new destination.</p>`;
  tickClocks();
}

function togglePrep(id, key, checked) {
  const dest = destinations.find(d => d.id === id);
  dest.prep[key] = checked;
  saveData();
  renderTimeline();
}


/* =====================================================================
   PART 19: TRAVEL TOOLS (currency, packing list, document checklist)
   ===================================================================== */
async function initCurrency() {
  try {
    const r = await getRates();
    const codes = Object.keys(r.values).sort();
    const top = ["INR", "USD", "EUR", "GBP", "AED", "THB", "SGD", "JPY", "AUD", "CAD"];
    const options = [...top, ...codes.filter(c => !top.includes(c))].map(c => `<option>${c}</option>`).join("");
    $("fxFrom").innerHTML = options;
    $("fxTo").innerHTML = options;
    $("fxFrom").value = "INR";
    $("fxTo").value = "USD";
    $("fxUpdated").textContent = "Live rates · last update: " + r.updated;
    convertCurrency();
  } catch (e) {
    $("fxResult").textContent = "❌ Live rates unavailable (check internet).";
  }
}

function convertCurrency() {
  if (!rates) return;
  const amount = parseFloat($("fxAmount").value) || 0;
  const from = $("fxFrom").value, to = $("fxTo").value;
  // rates are "1 INR = x CUR", so convert from -> INR -> to
  const result = (amount / rates.values[from]) * rates.values[to];
  $("fxResult").textContent = `${amount.toLocaleString("en-IN")} ${from} = ${result.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${to}`;
}

async function makePackingList() {
  const place = placeFromSelect($("packDest").value);
  const days = Math.max(1, parseInt($("packDays").value) || 1);
  const type = $("packType").value;
  if (!place) return;
  const box = $("packList");
  box.innerHTML = `<p class="loader">Reading the live forecast for ${escapeHTML(place.name)}…</p>`;
  let w = null;
  try { w = await getWeather(place.lat, place.lng); } catch (e) { w = null; }

  const min = w ? Math.min(...w.daily.temperature_2m_min) : 20;
  const max = w ? Math.max(...w.daily.temperature_2m_max) : 28;
  const rain = w ? Math.max(...w.daily.precipitation_probability_max.map(v => v || 0)) : 30;
  const abroad = (place.cc || "").toUpperCase() !== "IN";
  const clothes = Math.min(days, 7);

  const groups = {
    "📄 Documents": [abroad ? "Passport + visa copy" : "Original photo ID", "Tickets & hotel booking (printed + phone)",
                    abroad ? "Travel insurance papers" : "Emergency contact list", abroad ? "Forex card / local cash" : "UPI + some cash"],
    "👕 Clothes": [`${clothes} T-shirts / tops`, `${Math.ceil(clothes / 2)} pants / jeans`, `${clothes} sets of innerwear & socks`, "Comfortable walking shoes", "Sleepwear"],
    "🧴 Care": ["Toothbrush & toothpaste", "Sunscreen SPF 50", "Basic medicines (fever, stomach, band-aids)", "Hand sanitizer"],
    "🔌 Gadgets": ["Phone + charger", "Power bank", abroad ? "Universal travel adapter" : "Earphones"]
  };
  if (min <= 5) groups["👕 Clothes"].push("Thermal innerwear", "Heavy jacket", "Gloves, woollen cap");
  else if (min <= 15) groups["👕 Clothes"].push("Sweater / light jacket");
  if (max >= 32) groups["🧴 Care"].push("Cap / hat", "Sunglasses", "Reusable water bottle");
  if (rain >= 50) groups["👕 Clothes"].push("Umbrella / raincoat");
  if (type === "beach") groups["👕 Clothes"].push("Swimwear", "Flip-flops", "Beach towel");
  if (type === "mountain") groups["👕 Clothes"].push("Trekking shoes", "Small backpack", "Lip balm & moisturiser");

  const key = $("packDest").value;
  const saved = settings.pack[key] || {};
  box.innerHTML = `<p class="note">${w ? `Live forecast: ${Math.round(min)}°C to ${Math.round(max)}°C, max rain chance ${rain}%.` : "Forecast unavailable: general list."}</p>` +
    Object.entries(groups).map(([group, items]) => `<h5>${group}</h5>` + items.map(item => `
      <label class="${saved[item] ? "done" : ""}"><input type="checkbox" data-item="${escapeHTML(item)}" ${saved[item] ? "checked" : ""}><span>${escapeHTML(item)}</span></label>`).join("")).join("");
  box.querySelectorAll("input").forEach(cb => cb.addEventListener("change", () => {
    settings.pack[key] = settings.pack[key] || {};
    settings.pack[key][cb.dataset.item] = cb.checked;
    cb.parentElement.classList.toggle("done", cb.checked);
    saveSettings();
  }));
}

const DOC_ITEMS = ["Passport valid 6+ months", "Visa / e-Visa printed", "Flight / train tickets", "Hotel booking confirmations",
  "Travel insurance", "Forex card / cash", "Copies of documents in email/cloud", "Emergency contacts saved", "Inform your bank about travel",
  "Download offline maps"];

function renderDocList() {
  $("docList").innerHTML = DOC_ITEMS.map((item, i) => `
    <label class="${settings.docs[i] ? "done" : ""}"><input type="checkbox" data-i="${i}" ${settings.docs[i] ? "checked" : ""}><span>${item}</span></label>`).join("");
  const done = DOC_ITEMS.filter((_, i) => settings.docs[i]).length;
  $("docBar").style.width = (done / DOC_ITEMS.length) * 100 + "%";
  $("docText").textContent = `${done} of ${DOC_ITEMS.length} ready`;
  $("docList").querySelectorAll("input").forEach(cb => cb.addEventListener("change", () => {
    settings.docs[cb.dataset.i] = cb.checked;
    saveSettings();
    renderDocList();
  }));
}


/* =====================================================================
   PART 20: AI TRAVEL ASSISTANT
   A rule-based AI: it understands the question using keyword patterns
   (simple Natural Language Processing), finds the place, then answers
   with REAL live data from the same APIs used by the website.
   ===================================================================== */
const AI_SUGGESTIONS = ["Where can I go with ₹50,000?", "Weather in Paris", "Visa for Japan", "Cost of 5 days in Bali for 2",
  "Places to visit in Rome", "Hotels in Goa", "How far is London?", "Suggest a snow trip", "Convert 100 USD to INR", "My next trip"];

function openAI() {
  $("aiChat").classList.add("open");
  if (!$("aiMessages").children.length) {
    botSay(`Hi! 👋 I'm the <b>DreamTrail AI travel assistant</b>. Ask me about weather, visas, trip costs, places to visit, hotels,
      distances, or where you can go with your money. I answer with <b>real live data</b>.`);
    $("aiSuggest").innerHTML = AI_SUGGESTIONS.map(s => `<button type="button">${s}</button>`).join("");
    $("aiSuggest").querySelectorAll("button").forEach(b => b.addEventListener("click", () => askAI(b.textContent)));
  }
  $("aiText").focus();
}

function addMsg(html, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.innerHTML = html;
  $("aiMessages").appendChild(div);
  $("aiMessages").scrollTop = $("aiMessages").scrollHeight;
  return div;
}

function botSay(html) { return addMsg(html, "bot"); }

async function askAI(question, fromVoice = false) {
  if (!question.trim()) return;
  addMsg(escapeHTML(question), "user");
  $("aiText").value = "";
  const typing = botSay(`<span class="typing"><span></span><span></span><span></span></span>`);
  try {
    const answer = await answerQuestion(question);
    typing.innerHTML = answer;
  } catch (e) {
    typing.innerHTML = "😕 Sorry, I couldn't get live data just now. Please check your internet and ask again.";
  }
  $("aiMessages").scrollTop = $("aiMessages").scrollHeight;
  if (fromVoice || voiceCall) speak(typing.innerText);      // talk back in voice mode
}

// Answer any general question with the real Wikipedia article that best matches it
async function wikiAnswer(q) {
  const query = q.replace(/[?!.]/g, "")
    .replace(/^(who|what|when|why|how|which|where)\s+(is|was|are|were|did|does|do|has|have)?\s*/i, "")
    .replace(/^(tell me about|explain|define|history of)\s*/i, "")
    .replace(/^(built|build|made|founded|invented|discovered|wrote|designed|created|named|painted|located)\s+/i, "")
    .replace(/\b(the|a|an|please)\b/gi, " ").replace(/\s+/g, " ").trim();
  if (!query) return "🤔 Please ask a full question, e.g. 'Who built the Taj Mahal?'";
  const search = await fetchJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srlimit=1&srsearch=" +
    encodeURIComponent(query), { cacheMinutes: 60 });
  const hit = search.query && search.query.search[0];
  if (!hit) return `🤔 I couldn't find a real answer for "${escapeHTML(query)}". Try asking it another way.`;
  const s = await getWikiSummary(hit.title);
  const sentences = (s.extract || "").split(/(?<=\.)\s+/).slice(0, 3).join(" ");
  return `📚 <b>${escapeHTML(s.title)}</b><br>${escapeHTML(sentences)}<br>
    <small>Source: <a href="${escapeHTML(s.content_urls.desktop.page)}" target="_blank" rel="noopener">Wikipedia</a></small>`;
}


/* ----- Voice: speak questions (speech-to-text) and hear answers (text-to-speech) -----
   Uses the browser's built-in Web Speech API (works in Chrome and Edge). */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let voiceCall = false;     // true while the 📞 voice call is on
let recognizer = null;

function listen() {
  if (!SpeechRec) {
    showToast("🎤 Voice needs Chrome or Edge.");
    return;
  }
  try { if (recognizer) recognizer.abort(); } catch (e) { /* ignore */ }
  recognizer = new SpeechRec();
  recognizer.lang = "en-IN";
  recognizer.interimResults = true;
  $("aiVoice").innerHTML = `<span class="live-dot"></span>Listening… speak now`;
  $("aiMicBtn").classList.add("on");
  recognizer.onresult = e => {
    const res = e.results[e.results.length - 1];
    $("aiVoice").textContent = "🎙️ " + res[0].transcript;
    if (res.isFinal) askAI(res[0].transcript, true);
  };
  recognizer.onerror = e => {
    $("aiVoice").textContent = e.error === "not-allowed" ? "🎤 Microphone permission was blocked." : "";
    if (e.error === "not-allowed") stopCall();
  };
  recognizer.onend = () => { $("aiMicBtn").classList.remove("on"); if (!voiceCall) $("aiVoice").textContent = ""; };
  recognizer.start();
}

function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const clean = text.replace(/\p{Extended_Pictographic}/gu, "").replace(/Open full guide|Source: Wikipedia/g, "").replace(/₹/g, " rupees ").trim();
  const u = new SpeechSynthesisUtterance(clean.slice(0, 600));
  const voices = speechSynthesis.getVoices();
  u.voice = voices.find(v => /en-IN/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
  u.rate = 1.02;
  $("aiVoice").innerHTML = "🔊 Speaking…";
  u.onend = () => { if (voiceCall) listen(); else $("aiVoice").textContent = ""; };   // keep the call going
  speechSynthesis.speak(u);
}

function toggleCall() {
  if (voiceCall) { stopCall(); return; }
  if (!SpeechRec) { showToast("📞 Voice call needs Chrome or Edge."); return; }
  voiceCall = true;
  $("aiCallBtn").classList.add("on");
  botSay("📞 <b>Voice call started.</b> Ask me anything out loud. Press 📞 again to hang up.");
  speak("Hello! I am your DreamTrail travel assistant. What would you like to know?");
}

function stopCall() {
  voiceCall = false;
  $("aiCallBtn").classList.remove("on");
  try { if (recognizer) recognizer.abort(); } catch (e) { /* ignore */ }
  if (window.speechSynthesis) speechSynthesis.cancel();
  $("aiVoice").textContent = "";
}

// Read numbers like "₹50,000", "50k", "1.5 lakh"
function readMoney(text) {
  const m = text.match(/(?:₹|rs\.?|inr)\s*([\d,.]+)\s*(k|lakh|lac|l)?|([\d,.]+)\s*(k|lakh|lac|rupees|rs|inr)\b/i);
  if (!m) return null;
  let n = parseFloat((m[1] || m[3]).replace(/,/g, ""));
  const unit = (m[2] || m[4] || "").toLowerCase();
  if (unit === "k") n *= 1000;
  if (unit === "lakh" || unit === "lac" || unit === "l") n *= 100000;
  return n;
}

function readNumber(text, words) {
  const m = text.match(new RegExp("(\\d+)\\s*(" + words + ")", "i"));
  return m ? parseInt(m[1]) : null;
}

// Find which place the question is about
async function findPlaceInText(text) {
  // match WHOLE words only (so "ha" in "Thailand" never matches "Ha Long Bay")
  const hasWord = phrase => phrase.length > 2 &&
    new RegExp("(^|[^a-z])" + phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z])", "i").test(text);
  const mainName = name => name.split(/[,(]/)[0].trim();          // "Taj Mahal, Agra" -> "Taj Mahal"
  const city = CITIES.find(c => hasWord(mainName(c.name)) || hasWord(c.id) || hasWord(c.wiki.split(",")[0]));
  if (city) return cityToPlace(city);
  const mine = destinations.find(d => hasWord(mainName(d.name)));
  if (mine && mine.lat != null) return destToPlace(mine);
  for (const [cc, c] of Object.entries(COUNTRIES)) {
    if (hasWord(c.name)) {
      const capitalCity = CITIES.find(x => x.cc === cc);
      if (capitalCity) return cityToPlace(capitalCity);
    }
  }
  // take the words after "in / to / for / at / of / visit" and search the real map
  const m = text.match(/\b(?:in|to|for|at|of|visit|near)\s+([a-zA-Z][a-zA-Z .'-]{1,40})/i);
  if (m) {
    const phrase = m[1].replace(/\b(for|with|from|in|days?|people|persons|me|my|trip|now|today|please)\b.*$/i, "").trim();
    if (phrase.length > 1) {
      const found = (await searchPlaces(phrase))[0];
      if (found) return found;
    }
  }
  return currentPlace;
}

function openBtn(place) {
  window._aiPlace = place;
  return `<br><button class="msg-btn" onclick="openGuide(window._aiPlace); goTo('explore')">🧭 Open full guide</button>`;
}

async function answerQuestion(q) {
  const t = q.toLowerCase();
  const money = readMoney(q);
  const days = readNumber(q, "days?|din|nights?") || 5;
  const forN = q.match(/\bfor (\d+)\b(?!\s*(?:days?|din|nights?))/i);           // "... for 2" = 2 travellers
  const people = readNumber(q, "people|persons?|friends|travell?ers|log|of us") || (forN ? parseInt(forN[1]) : 1);
  const style = /luxury|5 star|premium/.test(t) ? "luxury" : /cheap|budget|low cost|sasta/.test(t) ? "budget" : "mid";

  if (/^(hi|hello|hey|namaste|hii+)\b/.test(t)) return "Hello! 😊 Where do you dream of going? Try one of the suggestions below.";
  if (/\bhelp\b|what can you do/.test(t)) {
    return `I can tell you:<ul><li>🌦️ live weather / time / air quality</li><li>🛂 visa & passport steps</li><li>💰 trip cost estimates</li>
      <li>💳 where you can go with your balance</li><li>⭐ best places & 🏨 hotels</li><li>📏 real distance from you</li><li>💱 currency conversion</li>
      <li>📚 general questions (answered from Wikipedia)</li><li>🎤 voice questions & 📞 voice call</li></ul>`;
  }

  // General knowledge question ("Who built the Taj Mahal?") -> real answer from Wikipedia
  const GENERAL = /^(who|what|when|why|how|which|where (is|was|are)|tell me|explain|define|history of)\b/i;
  const TRAVEL = /weather|visa|passport|cost|price|budget|hotel|stay|distance|far|time in|aqi|air quality|places|things to do|pack|best time|convert|afford|suggest|recommend|my trip|temperature|rain/i;
  if (GENERAL.test(t) && !TRAVEL.test(t)) return wikiAnswer(q);

  // Currency conversion: "convert 100 usd to inr"
  const fx = q.match(/([\d,.]+)\s*([a-z]{3})\s*(?:to|in|into)\s*([a-z]{3})/i);
  if (fx && /convert|to|in/.test(t)) {
    const r = await getRates();
    const amt = parseFloat(fx[1].replace(/,/g, "")), from = fx[2].toUpperCase(), to = fx[3].toUpperCase();
    if (r.values[from] && r.values[to]) {
      const res = (amt / r.values[from]) * r.values[to];
      return `💱 ${amt.toLocaleString("en-IN")} ${from} = <b>${res.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${to}</b><br><small>Live rate · ${r.updated}</small>`;
    }
  }

  // My bucket list / next trip
  if (/my (next )?trip|my bucket|my savings|how much (more )?(do i|to) save|countdown/.test(t)) {
    const next = destinations.filter(d => !d.visited && d.travelDate && daysUntil(d.travelDate) >= 0).sort((a, b) => a.travelDate.localeCompare(b.travelDate))[0];
    const saved = destinations.reduce((s, d) => s + Math.min(d.saved, d.budget), 0);
    const need = destinations.filter(d => !d.visited).reduce((s, d) => s + Math.max(0, d.budget - d.saved), 0);
    return `🧳 You have <b>${destinations.length}</b> dreams, <b>${destinations.filter(d => d.visited).length}</b> visited.<br>
      💰 Saved ${formatMoney(saved)} · still need ${formatMoney(need)}.<br>
      ${next ? `⏳ Next trip: <b>${escapeHTML(next.name)}</b> in <b>${daysUntil(next.travelDate)} days</b> (${niceDate(next.travelDate)}).` : "📅 No trip date set yet."}`;
  }

  // Balance: where can I go with ₹X
  if (money && /where|afford|can i go|kahan|budget of|with/.test(t)) {
    const list = CITIES.map(c => ({ c, cost: tripCost(cityToPlace(c), days, people, style) }))
      .filter(x => x.cost.total <= money).sort((a, b) => b.cost.total - a.cost.total).slice(0, 6);
    if (!list.length) {
      const cheapest = CITIES.map(c => ({ c, cost: tripCost(cityToPlace(c), days, people, "budget") })).sort((a, b) => a.cost.total - b.cost.total)[0];
      return `😅 With ${formatMoney(money)} for ${days} days, nothing on our list fits yet. Cheapest: <b>${escapeHTML(cheapest.c.name)}</b> at about ${formatMoney(cheapest.cost.total)} (budget style).`;
    }
    return `💳 With <b>${formatMoney(money)}</b> (${days} days, ${people} traveller${people > 1 ? "s" : ""}, ${STYLE_NAME[style]}) you can go to:<ul>` +
      list.map(x => `<li>${escapeHTML(x.c.name)}: ~${formatMoney(x.cost.total)} (${formatMoney(money - x.cost.total)} left)</li>`).join("") +
      `</ul><small>Estimates from real distance + cost of living.</small>`;
  }

  // Suggest a trip by type
  if (/suggest|recommend|idea|where should|best place for/.test(t)) {
    const tag = /snow|ice|cold/.test(t) ? "snow" : /beach|sea|island/.test(t) ? "beach" : /mountain|hill|trek/.test(t) ? "mountain"
      : /history|heritage|culture/.test(t) ? "heritage" : /nature|wild|safari/.test(t) ? "nature" : /city|shopping/.test(t) ? "city" : null;
    const month = new Date().getMonth() + 1;
    let list = CITIES.filter(c => (!tag || c.tags.includes(tag)));
    const inSeason = list.filter(c => c.best.includes(month));
    if (inSeason.length) list = inSeason;
    list = list.map(c => ({ c, cost: tripCost(cityToPlace(c), days, people, style) })).sort((a, b) => a.cost.total - b.cost.total).slice(0, 5);
    return `✨ ${tag ? "Best " + tag + " trips" : "Great trips"} for <b>${MONTHS[month - 1]}</b> (in season now):<ul>` +
      list.map(x => `<li><b>${escapeHTML(x.c.name)}</b>, ${countryOf(x.c.cc).name}: ~${formatMoney(x.cost.total)} for ${days} days</li>`).join("") + "</ul>";
  }

  const place = await findPlaceInText(q);
  if (!place) return wikiAnswer(q);          // not about a place -> answer from Wikipedia
  const name = escapeHTML(place.name);

  if (/\b(weather|temperature|mausam|rain|raining|hot|cold|climate|forecast)\b/.test(t) && !/hotel|stay/.test(t)) {
    const w = await getWeather(place.lat, place.lng);
    const [e, text] = weatherInfo(w.current.weather_code);
    return `${e} <b>${name}</b> right now: <b>${Math.round(w.current.temperature_2m)}°C</b>, ${text}, humidity ${w.current.relative_humidity_2m}%.<br>
      Next days: ${w.daily.temperature_2m_min.slice(0, 5).map((mn, i) => `${Math.round(w.daily.temperature_2m_max[i])}°/${Math.round(mn)}°`).join(" · ")}<br>
      ${travelAdvice(w)}` + openBtn(place);
  }

  if (/time|clock|samay/.test(t) && !/best time|when/.test(t)) {
    const w = await getWeather(place.lat, place.lng);
    const local = new Date(Date.now() + w.utc_offset_seconds * 1000);
    return `🕒 Local time in <b>${name}</b>: <b>${local.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })}</b>
      (${w.timezone}, ${local.toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "long" })}).`;
  }

  if (/aqi|air quality|pollution/.test(t)) {
    const a = await getAirQuality(place.lat, place.lng);
    const [label] = aqiInfo(a.current.us_aqi);
    return `🌬️ Air quality in <b>${name}</b>: US AQI <b>${a.current.us_aqi}</b> (${label}), PM2.5 ${a.current.pm2_5} µg/m³.`;
  }

  if (/visa|passport/.test(t)) {
    const cc = (place.cc || "").toUpperCase();
    const country = countryOf(cc);
    const type = cc === "IN" ? "home" : (country ? country.visa : "check");
    const info = VISA_TEXT[type];
    return `🛂 <b>${escapeHTML(place.country || name)}</b> for Indian passport: <b>${info.label}</b><br>
      Documents: ${info.docs.slice(0, 4).join(", ")}…<br>
      ${type !== "home" ? `Start ${VISA_LEAD_DAYS[type] || 0}+ days before travel.` : ""}
      <small>Rules change: confirm on the official site.</small>` + openBtn(place);
  }

  if (/distance|how far|kitna door|far is|km/.test(t)) {
    const origin = getOrigin();
    const km = haversine(origin.lat, origin.lng, place.lat, place.lng);
    const road = km < 4000 ? await getRoadRoute(origin, place) : null;
    return `📏 <b>${name}</b> is <b>${formatKm(km)}</b> (straight line) from ${escapeHTML(origin.name)}${origin.live ? " (live GPS)" : ""}.` +
      (road ? `<br>🛣️ By road: ${formatKm(road.km)}, about ${formatHours(road.hours)} driving.` : "<br>✈️ Best reached by flight.") + openBtn(place);
  }

  if (/best time|when (to|should)|season/.test(t)) {
    if (place.best) return `📅 Best months for <b>${name}</b>: ${place.best.map(m => MONTHS[m - 1]).join(", ")}.` + openBtn(place);
    return `📅 I don't have season data for ${name}, but I can show the live 5-day forecast in the guide.` + openBtn(place);
  }

  if (/hotel|stay|rehne|hostel|room/.test(t)) {
    const hotels = (await getHotels(place.lat, place.lng)).sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 5);
    if (!hotels.length) return `🏨 No hotels are mapped near ${name} in OpenStreetMap. Check the Stay tab for live price links.` + openBtn(place);
    return `🏨 Real hotels near <b>${name}</b>:<ul>` +
      hotels.map(h => `<li>${escapeHTML(h.name)} ${h.stars ? "· " + h.stars + "★" : ""} · ${formatKm(h.dist)}</li>`).join("") + "</ul>" + openBtn(place);
  }

  if (/cost|price|budget|kharcha|how much|expense/.test(t)) {
    const c = tripCost(place, days, people, style);
    return `💰 <b>${name}</b>, ${days} days, ${people} traveller${people > 1 ? "s" : ""} (${STYLE_NAME[style]}):<br>
      Total ≈ <b>${formatMoney(c.total)}</b> (${formatMoney(c.perPerson)} per person)<br>
      Travel ${formatMoney(Object.values(c.items)[0])} · Stay ${formatMoney(Object.values(c.items)[1])} · Food ${formatMoney(Object.values(c.items)[2])}<br>
      <small>Estimate from real distance (${formatKm(c.km)}) + cost of living.</small>` + openBtn(place);
  }

  if (/place|visit|see|attraction|things to do|ghum|famous|explore/.test(t)) {
    const list = (await getNearbyPlaces(place.lat, place.lng, 10000, place.name)).slice(0, 6);
    if (!list.length) return `I couldn't find famous places right at ${name}.` + openBtn(place);
    return `⭐ Most popular places in <b>${name}</b> (by real Wikipedia readers):<ul>` +
      list.map(p => `<li>${escapeHTML(p.title)} ${starText(p.stars)}</li>`).join("") + "</ul>" + openBtn(place);
  }

  if (/pack|packing|carry|clothes/.test(t)) {
    const w = await getWeather(place.lat, place.lng);
    return `🎒 For <b>${name}</b>: ${travelAdvice(w)}. Use <b>Tools → Smart Packing List</b> for a full checklist.`;
  }

  // Default: give a short live summary of the place
  const w = await getWeather(place.lat, place.lng);
  const c = tripCost(place, days, people, style);
  const [e, text] = weatherInfo(w.current.weather_code);
  return `📍 <b>${name}</b>${place.country ? ", " + escapeHTML(place.country) : ""}:<br>${e} ${Math.round(w.current.temperature_2m)}°C ${text}<br>
    📏 ${formatKm(c.km)} away · 💰 ~${formatMoney(c.total)} for ${days} days` + openBtn(place);
}


/* =====================================================================
   PART 21: CONFETTI, THEME, QUOTES
   ===================================================================== */
function launchConfetti() {
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ["#ff6b35", "#ffd166", "#06d6a0", "#4cc9f0", "#f72585"];
  const pieces = [];
  for (let i = 0; i < 150; i++) {
    pieces.push({ x: Math.random() * canvas.width, y: Math.random() * -canvas.height, size: 6 + Math.random() * 6,
                  speed: 2 + Math.random() * 4, drift: -2 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)] });
  }
  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    });
    frames++;
    if (frames < 180) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

let quoteIndex = 0;
function rotateQuote() {
  quoteIndex = (quoteIndex + 1) % QUOTES.length;
  $("quoteText").textContent = '"' + QUOTES[quoteIndex][0] + '"';
  $("quoteAuthor").textContent = "- " + QUOTES[quoteIndex][1];
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  $("themeBtn").textContent = isDark ? "☀️" : "🌙";
  settings.theme = isDark ? "dark" : "light";
  saveSettings();
}

function loadTheme() {
  const dark = settings.theme !== "light";     // premium dark look is the default
  document.body.classList.toggle("dark", dark);
  $("themeBtn").textContent = dark ? "☀️" : "🌙";
}


/* =====================================================================
   PART 21B: PREMIUM MOTION (smooth scroll, reveal, 3D tilt, count-up, parallax)
   Everything uses transform/opacity + requestAnimationFrame, so it stays smooth.
   ===================================================================== */
function initMotion() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) Apple-style smooth scrolling with Lenis (if the CDN loaded)
  if (typeof Lenis !== "undefined" && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // all "#section" links scroll smoothly (and leave room for the floating navbar)
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    if (!document.querySelector(a.getAttribute("href"))) return;
    e.preventDefault();
    goTo(a.getAttribute("href").slice(1));
  }));

  // 2) Scroll reveal: fade + rise when a block enters the screen
  // keep the emoji in gradient titles in full colour
  document.querySelectorAll(".section-title").forEach(h => {
    h.innerHTML = h.innerHTML.replace(/^(\S+)\s/, '<span class="emo">$1</span> ');
  });
  // numbered label above each section (one consistent style across the site)
  const EYEBROWS = { mission: "The Brief", explore: "Explore", dashboard: "Dashboard", planner: "Plan", balance: "Budget",
                     bucketlist: "Bucket List", timeline: "Timeline", passport: "Passport", tools: "Tools",
                     memories: "Memories", reviews: "Reviews", about: "Team" };
  Object.entries(EYEBROWS).forEach(([id, text], i) => {
    const title = document.querySelector("#" + id + " .section-title");
    if (title) title.insertAdjacentHTML("beforebegin", `<span class="eyebrow">${String(i).padStart(2, "0")} · ${text}</span>`);
  });
  const revealList = document.querySelectorAll(".eyebrow, .mission-grid, .flow, .section-title, .section-sub, .stats-grid, .overall-box, .explore-bar, " +
    ".planner-grid, .balance-form, .timeline-grid, .passport-book, .tools-grid, .about-card, .toolbar, .filters, .memory-layout, .review-layout");
  revealList.forEach(el => el.classList.add("reveal"));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0, rootMargin: "0px 0px -8% 0px" });
  revealList.forEach(el => io.observe(el));

  // 3) Navbar shrinks after scrolling + highlights the section you are in
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const heroBg = $("heroBg");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      document.querySelector(".navbar").classList.toggle("scrolled", y > 40);
      if (heroBg && y < window.innerHeight * 1.2) heroBg.style.transform = `translateY(${y * 0.35}px) scale(${1 + y / 4000})`;  // parallax
      let current = null;
      sections.forEach(s => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
      ticking = false;
    });
  }, { passive: true });

  // 4) 3D tilt on cards that follows the mouse (desktop only)
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", e => {
      const card = e.target.closest(".card, .stat-card, .about-card, .bal-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    document.addEventListener("pointerout", e => {
      const card = e.target.closest(".card, .stat-card, .about-card, .bal-card");
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  }

  // 5) Count-up numbers in the hero
  document.querySelectorAll("[data-count]").forEach(el => animateNumber(el, Number(el.dataset.count), n => Math.round(n)));

  // 6) Floating hero cards show real live numbers
  fillHeroCards();

  // 7) Moving strip of destinations
  const items = CITIES.map(c => `<span><b>✦</b>${escapeHTML(c.name)}</span>`).join("");
  $("marquee").innerHTML = items + items;      // twice, so the loop is seamless
}

// Real data for the floating hero cards: live Paris weather, real distance, your real savings
async function fillHeroCards() {
  const paris = CITIES.find(c => c.id === "paris");
  const origin = getOrigin();
  $("fcDist").textContent = formatKm(haversine(origin.lat, origin.lng, paris.lat, paris.lng));
  $("fcDistText").textContent = "Paris from " + origin.name.split(",")[0].split(" (")[0];
  const budget = destinations.reduce((s, d) => s + d.budget, 0);
  const saved = destinations.reduce((s, d) => s + Math.min(d.saved, d.budget), 0);
  $("fcSaved").textContent = (budget ? Math.round((saved / budget) * 100) : 0) + "% saved";
  try {
    const w = await getWeather(paris.lat, paris.lng);
    $("fcWeather").textContent = "Paris " + Math.round(w.current.temperature_2m) + "°C " + weatherInfo(w.current.weather_code)[0];
  } catch (e) {
    $("fcWeather").textContent = "Paris";
  }
}

// Smoothly scroll to a section by its id (uses Lenis when available)
function goTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
  else target.scrollIntoView({ behavior: "smooth" });
}

// Animate a number from its current value to the target (used by the dashboard too)
function animateNumber(el, target, format) {
  const start = Number(el.dataset.value || 0);
  el.dataset.value = target;
  const t0 = performance.now(), dur = 900;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = format(start + (target - start) * eased);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}



/* =====================================================================
   PART 22: EVENT LISTENERS (connect buttons to functions)
   ===================================================================== */
$("addBtn").addEventListener("click", () => openAddForm());
$("closeModal").addEventListener("click", closeModals);
$("closeSave").addEventListener("click", closeModals);
$("closeLive").addEventListener("click", closeModals);
$("confirmSave").addEventListener("click", confirmSavings);
$("destPhoto").addEventListener("input", updatePhotoPreview);
$("themeBtn").addEventListener("click", toggleTheme);
destForm.addEventListener("submit", handleFormSubmit);

searchInput.addEventListener("input", renderCards);
sortSelect.addEventListener("change", renderCards);
statusSelect.addEventListener("change", renderCards);

document.querySelectorAll("#continentFilters .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#continentFilters .chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentContinent = chip.dataset.continent;
    renderCards();
  });
});

document.querySelectorAll(".quick-amounts button").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = $("saveAmount");
    input.value = (parseFloat(input.value) || 0) + Number(btn.dataset.amt);
  });
});
$("saveAmount").addEventListener("keydown", e => { if (e.key === "Enter") confirmSavings(); });

[formModal, saveModal, liveModal].forEach(modal => {
  modal.addEventListener("click", e => { if (e.target === modal) closeModals(); });
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModals(); $("aiChat").classList.remove("open"); }
});

$("menuBtn").addEventListener("click", () => $("navLinks").classList.toggle("open"));
document.querySelectorAll(".nav-drop").forEach(btn => btn.addEventListener("click", e => {
  e.stopPropagation();
  const group = btn.parentElement;
  document.querySelectorAll(".nav-group").forEach(g => { if (g !== group) g.classList.remove("open"); });
  group.classList.toggle("open");
}));
document.addEventListener("click", () => document.querySelectorAll(".nav-group").forEach(g => g.classList.remove("open")));
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    $("navLinks").classList.remove("open");
    document.querySelectorAll(".nav-group").forEach(g => g.classList.remove("open"));
  });
});

// Search boxes
$("heroSearchForm").addEventListener("submit", e => { e.preventDefault(); runSearch($("heroSearch").value, $("heroResults")); });
$("exploreSearchForm").addEventListener("submit", e => { e.preventDefault(); runSearch($("exploreSearch").value, $("exploreResults")); });

// Globe controls
$("homeSelect").addEventListener("change", () => {
  settings.home = $("homeSelect").value;
  saveSettings();
  refreshGlobeData();
  if (currentPlace) openGuide(currentPlace);
});
$("gpsBtn").addEventListener("click", startGPS);
document.querySelectorAll("#globeLayers button[data-layer]").forEach(b => b.addEventListener("click", () => setGlobeLayer(b.dataset.layer)));
$("worldBtn").addEventListener("click", () => { if (globe) globe.pointOfView({ lat: 22, lng: 78, altitude: 2.3 }, 1800); });

// Planner
$("plannerForm").addEventListener("submit", calculatePlan);
document.querySelectorAll("#planStyle button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#planStyle button").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  planStyle = b.dataset.style;
}));

// Balance bucket
$("balanceForm").addEventListener("submit", renderBalance);
$("balMore").addEventListener("click", () => { balShowAll = !balShowAll; renderBalance(); });

// Tools
["fxAmount", "fxFrom", "fxTo"].forEach(id => $(id).addEventListener("input", convertCurrency));
$("packBtn").addEventListener("click", makePackingList);

// AI assistant
$("aiFab").addEventListener("click", () => $("aiChat").classList.contains("open") ? $("aiChat").classList.remove("open") : openAI());
$("navAiBtn").addEventListener("click", () => { $("navLinks").classList.remove("open"); openAI(); });
$("aiClose").addEventListener("click", () => $("aiChat").classList.remove("open"));
$("aiForm").addEventListener("submit", e => { e.preventDefault(); askAI($("aiText").value); });

$("resetBtn").addEventListener("click", () => {
  if (!confirm("This will delete your changes and restore sample data. Continue?")) return;
  try { localStorage.removeItem(dataKey()); } catch (e) { /* ignore */ }
  loadData();
  renderAll();
  showToast("↺ Sample data restored.");
});


/* =====================================================================
   PART 22B: SIGN UP / LOG IN / PROFILE
   No server is allowed in this project, so accounts live in this browser:
     - users list  -> localStorage "dreamtrail_users"
     - password    -> SHA-256 hash with a random salt (never stored as plain text)
     - each user's bucket list/settings -> their own localStorage keys
     - Backup / Restore -> download / upload a .json file of your data
   ===================================================================== */
const USERS_KEY = "dreamtrail_users";
const SESSION_KEY = "dreamtrail_session";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; }
}

// Turn "password + salt" into a SHA-256 hash (hex text) using the browser's Web Crypto API
async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(salt + ":" + password);
  if (window.crypto && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // fallback (very old browsers): simple non-crypto hash
  let h = 0;
  for (const b of bytes) h = (h * 31 + b) >>> 0;
  return "x" + h.toString(16);
}

function openAuth() {
  $("navLinks").classList.remove("open");
  $("authModal").classList.add("open");
  $("errAuth").textContent = "";
  if (currentUser) renderProfile();
  $("authForms").style.display = currentUser ? "none" : "block";
  $("authProfile").style.display = currentUser ? "block" : "none";
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll("#authTabs button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  $("rowName").style.display = mode === "signup" ? "block" : "none";
  $("authSubmit").textContent = mode === "signup" ? "Create account" : "Log in";
  $("authPass").autocomplete = mode === "signup" ? "new-password" : "current-password";
  $("errAuth").textContent = "";
}

async function handleAuth(event) {
  event.preventDefault();
  const name = $("authName").value.trim();
  const email = $("authEmail").value.trim().toLowerCase();
  const pass = $("authPass").value;
  const err = $("errAuth");
  if (authMode === "signup" && name.length < 2) return (err.textContent = "Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return (err.textContent = "Please enter a valid email address.");
  if (pass.length < 6) return (err.textContent = "Password must be at least 6 characters.");

  const users = getUsers();
  if (authMode === "signup") {
    if (users[email]) return (err.textContent = "This email already has an account. Please log in.");
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    users[email] = { name, email, salt, hash: await hashPassword(pass, salt), created: todayISO() };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    // first sign-up: keep the guest's current bucket list under the new account
    localStorage.setItem(STORAGE_KEY + ":" + email, JSON.stringify(destinations));
    localStorage.setItem(SETTINGS_KEY + ":" + email, JSON.stringify(settings));
    showToast("🎉 Account created. Welcome, " + name + "!");
  } else {
    const u = users[email];
    if (!u || (await hashPassword(pass, u.salt)) !== u.hash) return (err.textContent = "Wrong email or password.");
    showToast("👋 Welcome back, " + u.name + "!");
  }
  localStorage.setItem(SESSION_KEY, email);
  $("authForm").reset();
  startSession(email);
  closeModals();
}

// Load the signed-in user's own data
function startSession(email) {
  const u = getUsers()[email];
  currentUser = u ? { name: u.name, email: u.email, created: u.created } : null;
  $("authBtn").textContent = currentUser ? "👤 " + currentUser.name.split(" ")[0] : "👤 Sign in";
  loadData();
  loadTheme();
  renderHomeSelect();
  renderDocList();
  renderAll();
  renderBalance();
  renderMemories();
  renderReviews();
  updateNavAvatar();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  closeModals();
  startSession(null);
  showToast("🚪 Logged out. You are browsing as a guest.");
}

function renderProfile() {
  const u = getUsers()[currentUser.email] || {};
  setAvatar($("profAvatar"), u.photo, currentUser.name);
  $("profBioText").textContent = u.bio || "";
  $("profNameIn").value = currentUser.name;
  $("profBio").value = u.bio || "";
  $("profPhone").value = u.phone || "";
  $("profHome").innerHTML = HOME_CITIES.map(h => `<option value="${h.id}">${h.name}</option>`).join("");
  $("profHome").value = settings.home;
  $("profName").textContent = currentUser.name;
  $("profEmail").textContent = currentUser.email + " · member since " + niceDate(currentUser.created);
  const saved = destinations.reduce((s, d) => s + Math.min(d.saved, d.budget), 0);
  $("profStats").innerHTML = `
    <div class="info-box"><span>Dream destinations</span><b>${destinations.length}</b></div>
    <div class="info-box"><span>Visited</span><b>${destinations.filter(d => d.visited).length}</b></div>
    <div class="info-box"><span>Money saved</span><b>${formatMoney(saved)}</b></div>
    <div class="info-box"><span>Upcoming trips</span><b>${destinations.filter(d => !d.visited && d.travelDate >= todayISO()).length}</b></div>`;
}

// Download all my data as a .json file
function backupData() {
  const file = { app: "DreamTrail", version: 2, user: currentUser ? currentUser.email : "guest",
                 exported: new Date().toISOString(), destinations, settings };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dreamtrail-backup-" + todayISO() + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("⬇️ Backup downloaded.");
}

// Load data back from a backup file
function restoreData(event) {
  const f = event.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.app !== "DreamTrail" || !Array.isArray(data.destinations)) throw new Error("bad file");
      destinations = data.destinations;
      settings = Object.assign(settings, data.settings || {});
      saveData();
      saveSettings();
      renderAll();
      renderDocList();
      if (currentUser) renderProfile();
      showToast("⬆️ Backup restored: " + destinations.length + " destinations.");
    } catch (e) {
      showToast("❌ That is not a DreamTrail backup file.");
    }
    event.target.value = "";
  };
  reader.readAsText(f);
}

/* =====================================================================
   PART 22C: PROFILE EDIT, TRAVEL MEMORIES, REVIEWS, COUNTDOWN TOOL
   ===================================================================== */
// Shrink a photo in the browser (canvas) so it fits in localStorage: max size px, JPEG quality
function resizeImage(file, max, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function setAvatar(el, photo, name) {
  el.style.backgroundImage = photo ? `url("${photo}")` : "";
  el.style.backgroundSize = "cover";
  el.textContent = photo ? "" : (name || "?").charAt(0).toUpperCase();
}

function updateNavAvatar() {
  const u = currentUser && getUsers()[currentUser.email];
  $("authBtn").innerHTML = currentUser
    ? (u && u.photo ? `<img class="nav-avatar" src="${u.photo}" alt="">` : "👤 ") + escapeHTML(currentUser.name.split(" ")[0])
    : "👤 Sign in";
}

// Save profile changes (name, bio, phone, home city, photo)
async function saveProfile(e) {
  e.preventDefault();
  const users = getUsers();
  const u = users[currentUser.email];
  const name = $("profNameIn").value.trim();
  if (name.length < 2) { showToast("Please enter your name."); return; }
  u.name = name;
  u.bio = $("profBio").value.trim().slice(0, 200);
  u.phone = $("profPhone").value.trim().slice(0, 20);
  const file = $("profPhoto").files[0];
  if (file) u.photo = await resizeImage(file, 240, 0.8);
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    showToast("❌ Storage is full. Try a smaller photo.");
    return;
  }
  currentUser.name = name;
  settings.home = $("profHome").value;
  saveSettings();
  renderHomeSelect();
  renderProfile();
  updateNavAvatar();
  refreshGlobeData();
  $("profPhoto").value = "";
  showToast("✅ Profile saved.");
}

// ----- Travel memories (photos + story), saved per user -----
let memories = [];
let memRating = 5, revRating = 5;
const memKey = () => "dreamtrail_memories" + (currentUser ? ":" + currentUser.email : "");
const revKey = () => "dreamtrail_reviews" + (currentUser ? ":" + currentUser.email : "");

function starInput(box, value, onChange) {
  box.innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" data-n="${n}" class="${n <= value ? "on" : ""}">★</button>`).join("");
  box.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    onChange(+b.dataset.n);
    starInput(box, +b.dataset.n, onChange);
  }));
}

async function previewMemPhotos() {
  const files = [...$("memPhotos").files].slice(0, 4);
  $("memPreview").innerHTML = files.map(f => `<img src="${URL.createObjectURL(f)}" alt="">`).join("");
}

async function saveMemory(e) {
  e.preventDefault();
  const place = $("memPlace").value.trim();
  const files = [...$("memPhotos").files].slice(0, 4);
  if (place.length < 2) { $("errMem").textContent = "Please write the place name."; return; }
  if (!files.length && !$("memText").value.trim()) { $("errMem").textContent = "Add at least one photo or a story."; return; }
  $("errMem").textContent = "";
  const photos = [];
  for (const f of files) photos.push(await resizeImage(f, 900));
  const memory = { id: Date.now(), place, date: $("memDate").value || todayISO(), rating: memRating,
                   text: $("memText").value.trim().slice(0, 600), photos };
  memories.unshift(memory);
  try {
    localStorage.setItem(memKey(), JSON.stringify(memories));
  } catch (err) {
    memories.shift();
    $("errMem").textContent = "Storage is full. Delete an old memory or use fewer photos.";
    return;
  }
  $("memForm").reset();
  $("memPreview").innerHTML = "";
  renderMemories();
  showToast("📸 Memory saved!");
  launchConfetti();
}

function renderMemories() {
  try { memories = JSON.parse(localStorage.getItem(memKey())) || []; } catch (e) { memories = []; }
  $("memWall").innerHTML = memories.length ? memories.map(m => `
    <div class="mem-card">
      ${m.photos.length ? `<div class="mem-photos n${Math.min(m.photos.length, 4)}">${m.photos.map((p, i) =>
        `<img src="${p}" alt="${escapeHTML(m.place)} photo ${i + 1}" onclick="openMemoryPhoto(${m.id}, ${i})">`).join("")}</div>` : ""}
      <div class="mem-body">
        <h4>📍 ${escapeHTML(m.place)}</h4>
        <div class="meta"><span class="stars">${starText(m.rating)}</span><span class="pill">📅 ${niceDate(m.date)}</span></div>
        ${m.text ? `<p>${escapeHTML(m.text)}</p>` : ""}
        <button class="link-btn" onclick="deleteMemory(${m.id})">🗑️ Delete</button>
      </div>
    </div>`).join("")
    : `<div class="panel tl-empty center">📷 No memories yet. Add your first trip photo!</div>`;
}

function openMemoryPhoto(id, i) {
  const m = memories.find(x => x.id === id);
  liveModal.classList.add("open");
  $("liveContent").innerHTML = `<h2>📸 ${escapeHTML(m.place)}</h2><img class="photo-big" src="${m.photos[i]}" alt="">
    <p class="mt">${escapeHTML(m.text)}</p><p class="note">${niceDate(m.date)} · ${starText(m.rating)}</p>`;
}

function deleteMemory(id) {
  if (!confirm("Delete this memory?")) return;
  memories = memories.filter(m => m.id !== id);
  localStorage.setItem(memKey(), JSON.stringify(memories));
  renderMemories();
}

// ----- Reviews: compare our ESTIMATE with the REAL money spent -----
function saveReview(e) {
  e.preventDefault();
  const place = placeFromSelect($("revDest").value);
  const days = Math.max(1, parseInt($("revDays").value) || 1);
  const people = Math.max(1, parseInt($("revPeople").value) || 1);
  const style = $("revStyle").value;
  const actual = parseFloat($("revActual").value);
  if (!place) { $("errRev").textContent = "Choose a destination."; return; }
  if (!actual || actual <= 0) { $("errRev").textContent = "Enter the real amount you spent."; return; }
  $("errRev").textContent = "";
  const estimate = tripCost(place, days, people, style).total;
  const reviews = loadReviews();
  reviews.unshift({ id: Date.now(), place: place.name, cc: place.cc, days, people, style, actual, estimate,
                    rating: revRating, text: $("revText").value.trim().slice(0, 400), by: currentUser ? currentUser.name : "Guest", date: todayISO() });
  localStorage.setItem(revKey(), JSON.stringify(reviews));
  $("revForm").reset();
  renderReviews();
  showToast("⭐ Thanks for your review!");
}

function loadReviews() {
  try { return JSON.parse(localStorage.getItem(revKey())) || []; } catch (e) { return []; }
}

function renderReviews() {
  const reviews = loadReviews();
  const acc = r => Math.max(0, 100 - Math.abs((r.actual - r.estimate) / r.estimate) * 100);
  if (!reviews.length) {
    $("revSummary").innerHTML = `<div class="panel center"><h3>📊 No reviews yet</h3><p class="muted">After your trip, add the real cost to see how close our estimate was.</p></div>`;
    $("revList").innerHTML = "";
    return;
  }
  const avgAcc = reviews.reduce((s, r) => s + acc(r), 0) / reviews.length;
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  $("revSummary").innerHTML = `<div class="stats-grid three">
      <div class="stat-card"><span class="stat-icon">🎯</span><h3>${Math.round(avgAcc)}%</h3><p>Avg. estimate accuracy</p></div>
      <div class="stat-card"><span class="stat-icon">⭐</span><h3>${avgRating.toFixed(1)}</h3><p>Avg. user rating</p></div>
      <div class="stat-card"><span class="stat-icon">📝</span><h3>${reviews.length}</h3><p>Reviews</p></div>
    </div>`;
  $("revList").innerHTML = reviews.map(r => {
    const diff = ((r.actual - r.estimate) / r.estimate) * 100;
    return `<div class="panel review-card">
      <div class="review-top"><h4>${flagImg(r.cc, 20)} ${escapeHTML(r.place)}</h4><span class="stars">${starText(r.rating)}</span></div>
      <p class="muted">${r.days} days · ${r.people} traveller${r.people > 1 ? "s" : ""} · ${STYLE_NAME[r.style]} · by ${escapeHTML(r.by)} · ${niceDate(r.date)}</p>
      <div class="compare">
        <div><span>Our estimate</span><b>${formatMoney(r.estimate)}</b></div>
        <div><span>Real cost</span><b>${formatMoney(r.actual)}</b></div>
        <div><span>Accuracy</span><b class="${Math.abs(diff) <= 15 ? "good" : "off"}">${Math.round(acc(r))}%</b></div>
      </div>
      <p class="note">${diff > 0 ? "Real trip cost " + Math.round(diff) + "% more than estimated" : "Real trip cost " + Math.round(-diff) + "% less than estimated"}</p>
      ${r.text ? `<p>💬 ${escapeHTML(r.text)}</p>` : ""}
    </div>`;
  }).join("");
}

// ----- Selects that list my trips (countdown, reviews, memories) -----
function updateExtraSelects() {
  const upcoming = destinations.filter(d => !d.visited);
  const cd = $("cdDest");
  const old = cd.value;
  cd.innerHTML = upcoming.map(d => `<option value="${d.id}">${escapeHTML(d.name)}</option>`).join("") || `<option value="">No upcoming trips</option>`;
  if ([...cd.options].some(o => o.value === old)) cd.value = old;
  renderCountdown();

  // review: same choices as the planner (famous places + my bucket list)
  const rev = $("revDest");
  const oldRev = rev.value;
  rev.innerHTML = $("planDest").innerHTML;
  if ([...rev.options].some(o => o.value === oldRev)) rev.value = oldRev;

  $("memPlaceList").innerHTML = [...destinations.map(d => d.name), ...CITIES.map(c => c.name)]
    .map(n => `<option value="${escapeHTML(n)}">`).join("");
}

function renderCountdown() {
  const d = destinations.find(x => String(x.id) === $("cdDest").value);
  if (!d) { $("cdBox").innerHTML = ""; return; }
  $("cdDate").value = d.travelDate || "";
  $("cdBox").innerHTML = d.travelDate && d.travelDate >= todayISO()
    ? `<p><b>${escapeHTML(d.name)}</b> · ${niceDate(d.travelDate)}</p><div class="timer" data-date="${d.travelDate}"></div>`
    : `<p class="muted">Pick a date and press <b>Start countdown</b>.</p>`;
}

function startCountdown() {
  const d = destinations.find(x => String(x.id) === $("cdDest").value);
  const date = $("cdDate").value;
  if (!d) return;
  if (!date || date < todayISO()) { showToast("📅 Choose a future date."); return; }
  d.travelDate = date;
  d.year = parseInt(date.slice(0, 4));
  if (d.status === "dream") d.status = "planning";
  saveData();
  renderAll();
  showToast("⏳ Countdown started for " + d.name + "!");
}

$("profForm").addEventListener("submit", saveProfile);
$("memForm").addEventListener("submit", saveMemory);
$("memPhotos").addEventListener("change", previewMemPhotos);
$("revForm").addEventListener("submit", saveReview);
$("cdDest").addEventListener("change", renderCountdown);
$("cdBtn").addEventListener("click", startCountdown);
$("aiMicBtn").addEventListener("click", listen);
$("aiCallBtn").addEventListener("click", toggleCall);
starInput($("memStars"), 5, n => (memRating = n));
starInput($("revStars"), 5, n => (revRating = n));

$("authBtn").addEventListener("click", openAuth);
$("closeAuth").addEventListener("click", closeModals);
$("authModal").addEventListener("click", e => { if (e.target === $("authModal")) closeModals(); });
document.querySelectorAll("#authTabs button").forEach(b => b.addEventListener("click", () => setAuthMode(b.dataset.mode)));
$("authForm").addEventListener("submit", handleAuth);
$("logoutBtn").addEventListener("click", logout);
$("backupBtn").addEventListener("click", backupData);
$("restoreFile").addEventListener("change", restoreData);


/* =====================================================================
   PART 23: START THE APP
   ===================================================================== */
// Was someone already signed in on this browser?
try {
  const sessionEmail = localStorage.getItem(SESSION_KEY);
  const u = sessionEmail && getUsers()[sessionEmail];
  if (u) {
    currentUser = { name: u.name, email: u.email, created: u.created };
    $("authBtn").textContent = "👤 " + u.name.split(" ")[0];
  }
} catch (e) { /* storage blocked: guest mode */ }
loadData();
loadTheme();
$("planMonth").innerHTML = MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join("");
$("planMonth").value = new Date().getMonth() + 1;
renderHomeSelect();
renderQuickCities();
renderDocList();
renderAll();
renderBalance();
renderMemories();
renderReviews();
updateNavAvatar();
$("planDest").value = "city:goa";
calculatePlan();          // show a ready example plan instead of an empty box
initGlobe();
initCurrency();
initMotion();
setInterval(rotateQuote, 6000);    // new quote every 6 seconds
setInterval(tickClocks, 1000);     // live clocks + countdown timers every second
