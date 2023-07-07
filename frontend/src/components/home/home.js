import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import { Line } from 'react-chartjs-2'
import { chartLine } from '../chart-line/chartLine';
import { formatTime, getSearchSuggestions, fetchWeatherDataByCoords } from '../helper';
import styles from './home.module.scss'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const Home = () => {
  const [searchParams, setSearchParams] = useState({
    lat: "",
    lon: "",
    place: "",
  });

  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingFormOne, setLoadingFormOne] = useState(false);
  const [loadingFormTwo, setLoadingFormTwo] = useState(false);
  const [searchDataset, setSearchDataset] = useState({
    countries: Country.getAllCountries().sort(),
    states: State.getAllStates().sort(),
    cities: City.getAllCities().sort(),
  });
  const [allPlaces, setAllPlaces] = useState([...new Set([
    ...searchDataset.countries, 
    ...searchDataset.states, 
    ...searchDataset.cities
  ].map(item => item.name.toLowerCase()).sort())]);

  const [locationDenied, setLocationDenied] = useState(true);
  const [locationDeniedEnableCity, setLocationDeniedEnableCity] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const [formattedDate, setFormattedDate] = useState();
  const [formattedTime, setFormattedTime] = useState();

  const [chartData, setChartData] = useState({
    labels: [],
    humidity: [65, 59, 80, 81, 56, 55, 40],
    temperature: [40, 55, 56, 81, 80, 59, 65],
  })
  const [forceUpdate, setForceUpdate] = useState(false);

  const [weather, setWeather] = useState();
  const [currentTemp, setCurrentTemp] = useState();

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    setFormattedDate(currentDate.toLocaleDateString(undefined, options));
    setFormattedTime(currentDate.toLocaleTimeString([], { timeStyle: 'short' }));
    // getLocation();
  }, [])

  useEffect (() => {
    const currentDate = new Date();
    for(let hour = 0; hour < 8; hour++) {
      chartLine.data.labels[hour] = currentDate.getHours() + hour + ':' + currentDate.getMinutes();
    }
    chartLine.data.datasets[0].data = chartData.humidity;
    chartLine.data.datasets[1].data = chartData.temperature;

  }, [chartData])

  function closeLoading() {
    setLoadingFormOne(false);
    setLoadingFormTwo(false);
    setLoadingChart(false);
  }

  function getPlaceCoords(Name, Places) {
    Name = Name[0].toUpperCase() + Name.toLowerCase().slice(1);
    for (let i=0; i < Places.length; i++) {
      if (Places[i].name === Name) {
        return Places[i];
      }
    }
    return null;
  }

  function updateChartData(el) {
    const currentDate = new Date();

    let newLabels = [];
    let newHumidityData = [];
    let newTemperatureData = [];
    for (let count = 0; count < 8; count++) {
      newHumidityData[count] = el.hourly[count].humidity;
      newTemperatureData[count] = el.hourly[count].temp - 273.15;
      newLabels[count] = currentDate.getHours() + count + ':' + currentDate.getMinutes()
    }
    setChartData({
      labels: newLabels,
      humidity: newHumidityData,
      temperature: newTemperatureData,
    });

    setForceUpdate(prevValue => !prevValue);
  }

  function getLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (success) => {
          setSearchParams({ ...searchParams, lat: success.coords.latitude, lon: success.coords.longitude })
          setLoadingChart(true)
          fetchWeatherDataByCoords(success.coords.latitude, success.coords.longitude).then((data) => {            
            if (firstLoad) {
              setWeather(data);
              setCurrentTemp((data.temp - 273).toFixed(2));
              updateChartData(data.other)
              closeLoading();
            } else {
              closeLoading();
            }
          })
        },
        (error) => {
          if (error.code == error.PERMISSION_DENIED) {
            setLocationDenied(false);
            setLocationDeniedEnableCity(true);
          }
        }
      );
    }
  }
  
  function getWeatherDataByCoords(coords) {
    setLoadingChart(true);
    fetchWeatherDataByCoords(coords.lat, coords.lon).then((data) => {
      if(!data || !data.other) {
        alert('Place not found')
        closeLoading();
        return;
      }
      console.log(data);
      setWeather(data);
      setCurrentTemp((data.other.current.temp - 273).toFixed(2));
      updateChartData(data.other)
      closeLoading();
    })
  }

  function handleChange(e) {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  }

  let timeoutId = null;
  const handleSearchSuugetions = event => {
    if(!event.target.value) setSuggestions([]);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      performSearch(event.target.value.toLowerCase());
    }, 2000);
  };

  const performSearch = searchTerm => {
    setSuggestions(getSearchSuggestions(allPlaces, searchTerm, 5));
  };

  function handlePlaceSelect(e) {
    setSearchParams({ ...searchParams, place: e.target.innerText });
    setSuggestions([]);
    onTextSubmit({place: e.target.innerText});
  }

  function onTextSubmit(e) {
    try { e.preventDefault() } catch (error) {}
    setSuggestions([]);

    if(!searchParams.place && !e.place) return;
    let coords;
    let place = e.place || searchParams.place;
    coords = getPlaceCoords(place, searchDataset.countries);
    if(!coords) coords = getPlaceCoords(place, searchDataset.states);
    if (!coords) coords = getPlaceCoords(place, searchDataset.cities);

    if(!coords) {
      alert('Place not found')
      closeLoading();
      return;
    }
    coords = {
      lat: coords.latitude,
      lon: coords.longitude,
    }
    if (coords?.lat && coords?.lon) {
      setLoadingFormOne(true);
      getWeatherDataByCoords(coords);
    }
  }

  function onCoordsSubmit(e) {
    e.preventDefault();
    if (searchParams.lat && searchParams.lon) {
      setLoadingFormTwo(true);
      getWeatherDataByCoords(searchParams);
    }
  }

  function selectEvent(item) {}
  function onChangeSearch(search) {}


  return (
    <section className={styles.startup}>
        <div className={styles.s__fix}>
            <div className={styles.s__intro}>
                <h1>Weather Profile.<br /><span>Weather forecast web application.</span></h1>
                <p>Detailed forecasts available by city name, state, <br />geographic coordinates or postal/ZIP code.</p>
            </div>
            <div className={styles.s__search}>
                <div className={styles.s__search_title}>
                    <h2>Access current weather data for any location on Earth.</h2>
                </div>
                <div className={styles.s__search_container}>
                    <div className={styles.search_wrapper}>
                      <form className={styles.searchForm} onSubmit={onTextSubmit}>
                        <div className={styles.input_container}>
                          <input
                            type="text"
                            placeholder="Country, State, City, Zip Code"
                            value={searchParams.place}
                            onChange={handleChange}
                            onKeyUp={handleSearchSuugetions}
                            name="place"
                            required
                          />
                          {suggestions.length > 0 &&
                          <div id="dropdown" className="absolute mt-1 z-10 bg-white divide-y divide-gray-100 rounded-md shadow w-full dark:bg-gray-700">
                            <ul className="relative py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                              {suggestions.map((suggestion, index) => {
                                return (
                                  <li key={index}>
                                    <a onClick={handlePlaceSelect} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{suggestion}</a>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                          }
                        </div>
                        <button className={styles.search__btn} type="submit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 172 172">
                            <g fill="#000000">
                              <path d="M64.5,14.33333c-27.6214,0 -50.16667,22.54527 -50.16667,50.16667c0,27.6214 22.54527,50.16667 50.16667,50.16667c12.52732,0 23.97256,-4.67249 32.7819,-12.31771l3.05143,3.05143v9.26628l40.03256,40.03256c3.95599,3.95599 10.37733,3.956 14.33333,0c3.956,-3.956 3.956,-10.37733 0,-14.33333l-40.03256,-40.03256h-9.26628l-3.05143,-3.05143c7.64521,-8.80934 12.31771,-20.25458 12.31771,-32.7819c0,-27.6214 -22.54527,-50.16667 -50.16667,-50.16667zM64.5,28.66667c19.87509,0 35.83333,15.95824 35.83333,35.83333c0,19.87509 -15.95825,35.83333 -35.83333,35.83333c-19.87509,0 -35.83333,-15.95825 -35.83333,-35.83333c0,-19.87509 15.95824,-35.83333 35.83333,-35.83333z"></path>
                            </g>
                          </svg>
                        </button>

                        {loadingFormOne && <span>Searching...</span>}
                      </form>
  
                      <form onSubmit={onCoordsSubmit}>
                        <h2>Search by latitude, longitude (India&apos;s geo coordinates: 20, 77)</h2>
                        <div className={styles.coords__control}>
                          <input
                            type="text"
                            name="lat"
                            placeholder="Latitude"
                            value={searchParams.lat}
                            onChange={handleChange}
                            required
                          />
                          <input
                            type="text"
                            name="lon"
                            placeholder="Longitude"
                            value={searchParams.lon}
                            onChange={handleChange}
                            required
                          />
                          <button type="submit" className="text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/55">Search</button>
                        </div>
                        {loadingFormTwo && <span>Searching...</span>}
                      </form>

                    </div>
                </div>
            </div>
        </div>
        <div className={styles.s__variable}>
          {loadingChart ?
            <div className="absolute z-50 flex justify-center w-full h-full">
              <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_poqmycwy.json" background="transparent" speed="1.5"  style={{"width": "300px", "height": "300px"}} loop autoplay></lottie-player>
            </div>
            :
            weather?.name ?
            <>
              <div className={styles.s__info}>
                  <h1>{weather?.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}</h1>
                  <div className={styles.sub__info}>
                    <span className={styles.span}>{formattedDate}</span>
                    <span className={styles.span}>{formattedTime} <span>{currentTemp && (currentTemp + "°C") }</span> </span>
                  </div>
              </div>
              <div className={styles.s__details}>
                  <ul>
                      <li><p>Humidity</p> <a>{weather?.other.current.humidity}%</a></li>
                      <li><p>Pressure</p> <a>{weather?.other.current.pressure} hpa</a></li>
                      <li><p>Sunrise</p> <a>{weather && formatTime(weather.other.current.sunrise)}</a></li>
                      <li><p>Sunset</p> <a>{weather && formatTime(weather.other.current.sunset)}</a></li>
                  </ul>
              </div> 
              <div className={styles.s__chart}>
                <div className={styles.chartLineDiv}>
                  <Line
                      key={forceUpdate ? 'forceUpdate' : 'normal'}
                      data={chartLine.data}
                      options={chartLine.options}
                  />
                </div>
              </div>
            </>
            :
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="text-2xl">Weather data will be displayed here.</div>
              <div className="font-extralight text-lg text-slate-400">(Search to see weather at your location)</div>
            </div>
          }
        </div>
    </section>

  )
}

export default Home