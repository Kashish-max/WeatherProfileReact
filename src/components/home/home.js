import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import { Line } from 'react-chartjs-2'
import { chartLine } from '../chart-line/chartLine';
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
    place: "India",
  });
  const [loadingFormOne, setLoadingFormOne] = useState(false);
  const [loadingFormTwo, setLoadingFormTwo] = useState(false);
  const [searchDataset, setSearchDataset] = useState({
    countries: Country.getAllCountries(),
    states: State.getAllStates(),
    cities: City.getAllCities(),
  });
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
  const [chartDataUpdated, setChartDataUpdated] = useState(1);
  const [forceUpdate, setForceUpdate] = useState(false);

  const [weather, setWeather] = useState();
  const [currentWeather, setCurrentWeather] = useState();
  const [currentTemp, setCurrentTemp] = useState();

  useEffect(() => {
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric' }; // Define options to format the date
    setFormattedDate(currentDate.toLocaleDateString(undefined, options)); // Format the date as desired (e.g., "MM/DD/YYYY")
    setFormattedTime(currentDate.toLocaleTimeString([], { timeStyle: 'short' })); // Format the time as desired (e.g., "HH:MM AM/PM")

    onTextSubmit();
    getLocation();
  }, [])

  useEffect (() => {
    const currentDate = new Date();
    for(let hour = 0; hour < 8; hour++) {
      chartLine.data.labels[hour] = currentDate.getHours() + hour + ':' + currentDate.getMinutes();
    }
    
    chartLine.data.datasets[0].data = chartData.humidity;
    chartLine.data.datasets[1].data = chartData.temperature;

  }, [chartData])
  
  const fetchWeatherDataByCoords = async (latitude, longitude) => {
    try {
      const params = {
        lat: latitude,
        lon: longitude,
      };

      const url = new URL('https://weatherapi-beta.vercel.app/weather/latlong');
      url.search = new URLSearchParams(params).toString();

      const response = await fetch(url.toString());
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
    console.log(chartData)
    console.log(forceUpdate)
  }

  function getLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (success) => {
          setSearchParams({ ...searchParams, lat: success.coords.latitude, lon: success.coords.longitude })
          // this.weatherService
          //   .getWeatherDataByCoords(success.coords.latitude, success.coords.longitude)
          //   .subscribe((data) => {
          //     if (firstLoad) {
          //       weather = data;
          //       console.log(weather);
          //       setCurrentWeather(weather.other.current);
          //       setCurrentTemp((currentWeather.temp - 273).toFixed(2));
          //       updateChartData(weather.other)
          //       this.weatherService.getChart(chartData);
          //       setFirstLoad(false);
          //     }
          //   });
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
  
  function getCoords(coords) {
    fetchWeatherDataByCoords(coords.lat, coords.lon).then((data) => {
      setLoadingFormOne(false);
      setLoadingFormTwo(false);
      setWeather(data);
      console.log(data);
      updateChartData(data.other)
    })
  }

  function handleChange(e) {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  }

  function onTextSubmit(e) {
    e?.preventDefault();
    if(!searchParams.place) return;
    let coords = getPlaceCoords(searchParams.place, searchDataset.countries);
    if(!coords) coords = getPlaceCoords(searchParams.place, searchDataset.states);
    if (!coords) coords = getPlaceCoords(searchParams.place, searchDataset.cities);
    
    if(!coords) return alert('Place not found')
    coords = {
      lat: coords.latitude,
      lon: coords.longitude,
    }
    if (coords) {
      setLoadingFormOne(true);
      getCoords(coords);
    }
  }

  function onCoordsSubmit(e) {
    e.preventDefault();
    if (searchParams.lat && searchParams.lon) {
      setLoadingFormTwo(true);
      getCoords(searchParams);
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Asia/Kolkata', // Set the desired timezone
      timeZoneName: 'short',
    };
    return date.toLocaleTimeString('en-US', options);
  };
  
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
                            name="place"
                          />
                        </div>


                        {/* {searchDataset.countries.map((item, index) => (
                          <a key={index} dangerouslySetInnerHTML={{ __html: item.name }}></a>
                        ))}

                        {searchDataset.countries.length === 0 && <div>Not found</div>} */}

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
                        <h2>Search by latitude, longitude (India's geo coordinates: 20, 77)</h2>
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
                          <button type="submit">Search</button>
                        </div>
                        {loadingFormTwo && <span>Searching...</span>}
                      </form>

                    </div>
                </div>
            </div>
        </div>
        <div className={styles.s__variable}>
            <div className={styles.s__info}>
                <h1>{weather?.name}</h1>
                <div className={styles.sub__info}><span className={styles.span}>{formattedDate}</span><span className={styles.span}>{formattedTime} <span>{currentTemp && (currentTemp + "°C") }</span> </span></div>
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
            {/* <div className={styles.s__chart}><div className={styles.charLineDiv}><canvas #mychart id={styles.chartLine}></canvas></div></div>  */}
        </div>
    </section>

  )
}

export default Home