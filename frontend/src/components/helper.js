const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/weather-data/`;

export function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short',
    };
    return date.toLocaleTimeString('en-US', options);
}

export function getSearchSuggestions(places, currPref, limit) {
    let l = 0,
    r = places.length - 1;
    while (l <= r) {
      let m = parseInt((l + r) / 2, 10);
      if (places[m] >= currPref) {
        r = m - 1;
      } else {
        l = m + 1;
      }
    }
    let ans = [];
    let lOutOfBounds = l == places.length;

    if (lOutOfBounds) return ans;
    let currNotPref = places[l].length > currPref;
    if (currNotPref) return ans;

    for (
      let i = l;
      limit > 0 && places[i].substring(0, currPref.length) == currPref;
      i++, limit--
    ) {
      ans.push(places[i]);
    }
    return ans;
}

export const fetchWeatherDataByCoords = async (latitude, longitude) => {
    const data = {
      lat: latitude,
      lon: longitude,
    };
  
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await response.json();
      return responseData;
      // Process the response data
    } catch (error) {
      console.error('Error:', error);
    }    
  }

