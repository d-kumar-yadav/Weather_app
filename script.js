const userweather= document.querySelector('.location-tab');
const searchinput= document.querySelector('.search-tab');
 const  weathercontainer= document.querySelector('.weather-container');
 const weatheris= document.querySelector('.weather-is');
 const grantlocation= document.querySelector('.grant-location');
 const searchForm= document.querySelector('[data-search-form]');
 const loadingsection= document.querySelector('.loading-section');

 let currentab=userweather;
const apikey="d1845658f92b31c64bd94f06f7188c9c";
 currentab.classList.add("current-tab"); // add css class 

 getfromsessionstorage();

 userweather.addEventListener("click",()=>{
    // pass input as a clickedtab
    switchtab(userweather);
 });

 searchinput.addEventListener("click",()=>{
    switchtab(searchinput);
 });

 function switchtab(clickedtab) {
    if (clickedtab != currentab) {
        currentab.classList.remove("current-tab");
        currentab = clickedtab;
        currentab.classList.add("current-tab");

        // NEW, CLEANER LOGIC:
        // Check which tab is now the active one

        if (currentab === searchinput) {
            // If we are on the "Search" tab:
            // Hide "Your Weather" and "Grant Location"
            weatheris.classList.remove("active");
            grantlocation.classList.remove("active");
            // Show the search form
            searchForm.classList.add("active");
        } 
        else {
            // If we are on the "Your Weather" tab:
            // Hide search form
            searchForm.classList.remove("active");
            // This will show either the "Grant" screen or your weather
            getfromsessionstorage(); 
        }
    }
}
   
 function getfromsessionstorage() {
   const cordinates= sessionStorage.getItem("usercordinates");
   if(!cordinates){
  grantlocation.classList.add("active");


   }
   else{
      const localcordinates= JSON.parse(cordinates);  // JSON string, is being converted into a JavaScript object
      fetchweatherrinfo(localcordinates);
   }

   }
 async  function  fetchweatherrinfo(cordinates){
    const{lat,lon}= cordinates;
  
      loadingsection.classList.add("active");
      grantlocation.classList.remove("active");
      weatheris.classList.remove("active");
         

    try {

        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`);
       
        if (!response.ok) {
            // The API key you are using appears to be invalid, which causes a 401 Unauthorized error.
            // Please get a valid key from openweathermap.org
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data=await response.json();
        loadingsection.classList.remove("active");
        weatheris.classList.add("active");
  toaddtoui(data);

    } catch(e) {
        console.log("Unable to fetch weather data.", e);
    }
}


   

    function toaddtoui(data){
      const cityname=document.querySelector(".city-location");
      const countryicon=document.querySelector(".country-code");
      const weathercondition=document.querySelector(".weather-condition");
      const icon= document.querySelector(".weather-icon");
      const temprature=document.querySelector(".degree");
      const windis= document.querySelector(".wind-is");
      const humidityis=document.querySelector(".humidity-level");
      const cloudinessis=document.querySelector(".cloudiness-level");
      cityname.innerText= data?.name;
      countryicon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
      weathercondition.innerText=data?.weather?.[0]?.description;
    icon.src= `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
   temprature.innerText= `${data?.main?.temp} °C`;
   windis.innerText=`${data?.wind?.speed} m/s`;
   humidityis.innerText=`${data?.main?.humidity}%`;
   cloudinessis.innerText=`${data?.clouds?.all}%`;
   
    }

    const grantbutton=document.querySelector(".grant");
    grantbutton.addEventListener("click",getlocation);
    function getlocation(){
     
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("system does not support location");
  }
}

function success(position) {
 const userlocationcordinates={
    lat:position.coords.latitude,
    lon:position.coords.longitude,
 
 }
  sessionStorage.setItem("usercordinates",JSON.stringify(userlocationcordinates)); // storing as a string
  fetchweatherrinfo(userlocationcordinates);
  
}

function error() {
  alert("Sorry, no position available.");
}
    
const searchinput2= document.querySelector(".search-input");
  searchForm.addEventListener("submit" ,e=>{
    e.preventDefault();
   if(searchinput2.value==="")return;
   else{
      fetchsearchcityapi(searchinput2.value);
   }
  });
 async function fetchsearchcityapi(city) {
    
   
    weatheris.classList.remove("active");
    grantlocation.classList.remove("active"); 
    
   
    searchForm.classList.remove("active"); 


    loadingsection.classList.add("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`);
        
        if (!response.ok) {
            // If city not found (404) or bad key (401)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        loadingsection.classList.remove("active"); // Hide loading
        weatheris.classList.add("active"); // Show weather
        toaddtoui(data);

    } catch (e) {
        // If the search fails, you MUST hide the loading spinner.
        loadingsection.classList.remove("active");

        // --- THIS IS THE FIX (PART 2) ---
        // If the search fails, show the search form again so the user can retry.
        searchForm.classList.add("active");
        // --- END OF FIX ---

        console.log("Unable to fetch weather data.", e);
        
        // You could also add an error message to the UI here
        alert("Could not find weather for that city. Please try again.");
    }
}