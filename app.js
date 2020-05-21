//const url = 'https://swapi.dev/api/people/';
//let baseUrl = 'https://swapi.dev/api/people/?page='; 
//let outputlist = document.querySelector("ul#results");

function make_graph(chart, points){
    var ctx = document.getElementById('myChart');

    var options = {responsive: true, // Instruct chart js to respond nicely.
    maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
    };

    // End Defining data
    var myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Population', // Name the series
            data: points, // Specify the data values array
        borderColor: '#2196f3', // Add custom color border            
        backgroundColor: '#2196f3', // Add custom color background (Points and Fill)
        }]
    },
    options: options
    });
}

function get_state_dailies(st){
    let state= st
    let requesturl= `https://covidtracking.com/api/v1/states/${state}/daily.json`

    let next = null
    fetch(`${requesturl}`)
    .then(response => {
        //console.log('RESPONSE')
        //console.log(response)
        //check response status code
        return response.json()
    })
    .then(data => {
        //console.log('DATA')
        //console.log(data)
        
        //create array of point obnjects
        let points=[]
        let i = 1
        data.forEach(obj => {
            let newPoint = {}
            //newPoint.x=obj.date
            newPoint.x=i
            i++;
            newPoint.y=obj.deathIncrease
            points.push(newPoint)
        });

        // filter out anything that isn't plottable number 
        points = points.filter(point => typeof point.y === 'number')
        console.log(points);
        make_graph('myChart', points);
    })
}

console.log('hello world!')

let points = get_state_dailies('CA')
//console.log(points)

