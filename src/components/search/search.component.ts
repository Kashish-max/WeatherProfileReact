import { Component, OnInit } from '@angular/core';
import { Country, State, City } from 'country-state-city';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchService } from "../../services/search/search.service";
import * as zipcodes from "zipcodes";

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  lat;
  lon;
  coords;
  weather;
  currentWeather;
  currentTemp;
  locationDenied: boolean = true;
  locationDeniedEnableCity = false;

  firstLoad: boolean = true;

  keyword = 'name';
  countries = Country.getAllCountries();
  states = State.getAllStates();
  cities = City.getAllCities();
  allPlaces = [...this.countries, ...this.states, ...this.cities];

  loadingFormOne :boolean = false;
  loadingFormtwo :boolean = false;

  chartData = {
    humidity: [0, 0, 0, 0, 0, 0, 0, 0],
    temperature: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  todayNumber: number = Date.now();
  todayDate: Date = new Date();

  hills = zipcodes.lookupByName('Bathinda', 'IN');;

  constructor(private weatherService: SearchService) {
    console.log(this.hills)
  }

  searchForm: FormGroup;
  llForm: FormGroup;

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      search: new FormControl(),
    })
    this.llForm = new FormGroup({
      longitude: new FormControl(),
      latitude: new FormControl(),
    })
    this.getLocation();
  }
  
  Filter(Name, Arr) {
      Name = Name[0].toUpperCase() + Name.slice(1);
      for (let i=0; i < Arr.length; i++) {
          if (Arr[i].name === Name) {
              return Arr[i];
          }
      }
  }

  changeChartData(el) {
    for (let count = 0; count < 8; count++) {
      this.chartData.humidity[count] = el.hourly[count].humidity;
      this.chartData.temperature[count] = el.hourly[count].temp - 273.15;
    }    
  }

  getLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (success) => {
          this.lat = success.coords.latitude;
          this.lon = success.coords.longitude;

          this.weatherService
            .getWeatherDataByCoords(this.lat, this.lon)
            .subscribe((data) => {
              if (this.firstLoad) {
                this.weather = data;
                console.log(this.weather);
                this.currentWeather = this.weather.other.current;
                this.currentTemp = (this.currentWeather.temp - 273).toFixed(2);
                this.changeChartData(this.weather.other)
                this.weatherService.getChart(this.chartData);
                this.firstLoad = false;
              }
            });
        },
        (error) => {
          if (error.code == error.PERMISSION_DENIED) {
            this.locationDenied = false;
            this.locationDeniedEnableCity = true;
          }
        }
      );
    }
  }
  getCoords(event) {
    this.lat = event.lat;
    this.lon = event.lon;

    this.weatherService
      .getWeatherDataByCoords(this.lat, this.lon)
      .subscribe((data) => {
        this.loadingFormOne = false;
        this.loadingFormtwo = false;
        this.weather = data;
        console.log(data);
        this.changeChartData(this.weather.other)
        this.weatherService.getChart(this.chartData);
      });
  }
  onTextSubmit() {
    this.coords = {
      lat: this.searchForm.value.search.latitude,
      lon: this.searchForm.value.search.longitude,
    }
    if (this.coords.lat && this.coords.lon) {
      this.loadingFormOne = true;
      this.getCoords(this.coords);
    }
    else {
      let temp = this.Filter(this.searchForm.value.search, this.states);
      if (!temp) {
        temp = this.Filter(this.searchForm.value.search, this.cities)
      }
      this.coords = {
        lat: temp.latitude,
        lon: temp.longitude,
      }
      if (temp) {
        this.loadingFormOne = true;
        this.getCoords(this.coords);
      }
    }
  }
  onCoordsSubmit() {
    this.coords = {
      lat: this.llForm.value.latitude,
      lon: this.llForm.value.longitude,
    }
    if (this.coords.lat && this.coords.lon) {
      this.loadingFormtwo = true;
      this.getCoords(this.coords);
    }
  }
  selectEvent(item) {}
  onChangeSearch(search: string) {}
}
