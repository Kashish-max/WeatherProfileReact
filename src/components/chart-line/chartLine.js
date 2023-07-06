export const chartLine = {
    data: {
        labels: ["Label1", "Label2", "Label3", "Label4", "Label5", "Label6", "Label7"],
        datasets: [
          {
              label: 'Humidity(%)',
              data: [65, 59, 80, 81, 56, 55, 40],
              fill: true,
              backgroundColor: ['rgba(75, 192, 192, 0.2)'],
              borderColor: [
              'rgb(75, 192, 192)',
              ],
              tension: 0.1,
              borderWidth: 1,
          },
          {
              label: 'Temperature(°C)',
              data: [40, 55, 56, 81, 80, 59, 65],
              fill: true,
              backgroundColor: [
              'rgba(253, 184, 19, 0.1)',
              ],
              borderColor: [
              'rgb(253, 184, 19)',
              ],
              tension: 0.1,
              borderWidth: 1,
          },
        ],
    },
    options: {          
        legend: {
            align: 'end',
            labels: {
              fontColor: "#5f6368",
            },
        },
        
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "#5f6368",
            },
            gridLines: {
              color: "#fff",
              zeroLineColor: "#5f6368",
                
            },
            scaleLabel: {                
              display: true,
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: "#5f6368",
              lineHeight: 4,
            },
            gridLines: {
              color: "#fff",
              zeroLineColor: "#5f6368",
            },
            scaleLabel: {
              display: true
            }
          }]
        }
    },
}