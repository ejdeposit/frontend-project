
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


async function make_date_graphs(states){
    datas = await make_calls(states) 
    //console.log(datas)

    //parse data from call.  pull out dates, and check numbers return list of 
    let dataSubsets = get_data_subsets2(datas, ['date', 'deathIncrease'])
    console.log('datasubsets from get_data_subsets')
    console.log(dataSubsets)

    
    //make list of data set objects
    let datasets = make_datasets(dataSubsets, 'date', 'deathIncrease')
    //console.log('datasets from make_datasets')
    //console.log(datasets)

    //make graph
    var ctx = document.getElementById('myChart');
    
    var options = {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
        scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'day'
            }
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

function make_datasets(datas, x, y){
    /*
    datas: state: array of data
    x,y: x and y coordinate to make points from
    */
    datasets=[];
    states= Object.keys(datas);
        states.forEach(state =>{
            let randomColor = randColor()

            points = datas[state].map(date =>{
                let dateStr= date[x].toString()
                let year = dateStr.slice(0,4) 
                let month = dateStr.slice(4,6)
                let day = dateStr.slice(6,8)
                let point={
                    x: new Date(year, month, day),
                    y: date[y]
                }
                return point
            })
            console.log(points)

            let dataSet = {
                label: state,
                data: points,
                borderColor: randomColor, // Add custom color border            
                backgroundColor: randomColor, // Add custom color background (Points and Fill)
            }
            datasets.push(dataSet)
        }); 
    return datasets
}

function data_to_date_points(){
    points = datas[state].map(point => {
        xStr= point.x.toString()
        let year = xStr.slice(0,4) 
        let month = xStr.slice(4,6)
        let day = xStr.slice(6,8)
        point.x =  new Date(year, month, day)
        //console.log(point.x)
    })
}

function get_data_subsets2(datas, members){
    /*
    takes in object with state:data pairs
    outputs subset of data
    */
    let states = Object.keys(datas);
    // key state: value list of point objects
    let subset = {}

    states.forEach(state => {
        let points = []
        datas[state].forEach( day => {
            let newPoint = {}
            members.forEach(member => {
                newPoint[member]=day[member]
            })
            points.push(newPoint)
        })
        subset[state]= points
    })

    return subset
}
// ------------------------------------
// Same on both branches from here down 
// ------------------------------------

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



console.log('hello world!')

//let points = get_state_dailies('CA')
make_date_graphs(['CA', 'WA'])

