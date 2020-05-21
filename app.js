
//  ------------------------------------------------
//                   make lien graph for single state
//                   from single fetch to api 
//  ------------------------------------------------

function make_graph(chartID, points){
    // https://codepen.io/DanEnglishby/pen/dqyyzp
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
    /*
    makes single call to api to get daily totals for one state using fetch api.  makes chart for just one state
    */
    let state= st
    let requesturl= `https://covidtracking.com/api/v1/states/${state}/daily.json`

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

async function make_call(st){
    /* makes call for single state and returns points including new deaths and dates in format provided by api
    */
    let state= st
    let requesturl= `https://covidtracking.com/api/v1/states/${state}/daily.json`
    return new Promise(resolve=>{
        fetch(`${requesturl}`)
        .then(response => {
            return response.json()
        })
        .then(data => {
            //create array of point obnjects
            let points=[]
            data.forEach(obj => {
                let newPoint = {}
                newPoint.x=obj.date
                newPoint.y=obj.deathIncrease
                points.push(newPoint)
            });
            // filter out anything that isn't plottable number 
            points = points.filter(point => typeof point.y === 'number')
            console.log(points);
            return points;
        })
    })
}

//  ------------------------------------------------
//                  make multi line graph 
//                  fom series of async calls 
//  ------------------------------------------------


async function make_graphs(states){
    datas = await make_calls(states) 
    console.log(datas)

    //parse data from call.  pull out dates, and check numbers return list of 
    let dataSubsets = get_data_subsets(datas, 'date', 'deathIncrease')
    console.log(dataSubsets)

    //make list of data set objects
    let datasets = make_datasets(dataSubsets)

    //make graph
    var ctx = document.getElementById('myChart');

    var options = {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
        scales: {
            xAxes: [{
              type: 'time'
            }]
          }
    };

    // End Defining data
    var myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: datasets
    },
    options: options
    });
}

let get_data_async = async (st) => {
    /* 
    makes single async call to api for one state daily numbers
    */
    let state= st
    let requesturl= `https://covidtracking.com/api/v1/states/${state}/daily.json`
    let response = await fetch(requesturl)
    let data = await response.json()
    return data
}

async function make_calls(states){
    /* 
    makes series of async calls for multiple states, awaits on each call
    */
    // list of lists
    pointss=[]
    datas = {}
    //let newPoints = await get_data_async(states[0])
    //pointss.push(newPoints)
    for await(let state of states){
        let newPoints = await get_data_async(state);
        pointss.push(newPoints);
        datas[state] = newPoints;
    }
    //return pointss
    return datas;
}

function get_data_subsets(datas, x, y){
    let states = Object.keys(datas);
    // key state: value list of point objects
    let subsets = {}
    states.forEach(state => {
        let points = []
        datas[state].forEach( day => {
            let newPoint = {}
            newPoint.x=day.date
            newPoint.y=day.deathIncrease
            points.push(newPoint)
        })
        subsets[state]= points
    })
    return subsets
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function randColor(){
    let randColor = ''
    for(let i=0; i<6; i++){
        let randNum = getRandomInt(16)
        hexString = randNum.toString(16);
        randColor = randColor + hexString
    }
    return '#' + randColor
}

function make_datasets(datas){
    datasets=[];
    states= Object.keys(datas);
    states.forEach(state => {
        //filter anything out that isn't number
        let points = datas[state].filter(point => typeof point.y === 'number');

        //convert to date objects
        points = datas[state].map(point => {
            xStr= point.x.toString()
            let year = xStr.slice(0,4) 
            let month = xStr.slice(4,6)
            let day = xStr.slice(6,8)
            let newDate =  new Date(year, month, day)
            point.x = newDate.toLocaleString()
            console.log(point.x)
        })

        let randomColor = randColor()

        let dataSet = {
            label: state,
            data: points,
            borderColor: randomColor, // Add custom color border            
            backgroundColor: randomColor, // Add custom color background (Points and Fill)
        }
        datasets.push(dataSet)
    })
    return datasets
}


console.log('hello world!')

//let points = get_state_dailies('CA')
make_graphs(['CA', 'WA'])

