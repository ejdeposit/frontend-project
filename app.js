
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
        //console.log(points);
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
            //console.log(points);
            return points;
        })
    })
}
//  ------------------------------------------------
//                  make multi line graph 
//                  without dates                   
//  ------------------------------------------------

async function make_graphs_numbers(states){
    datas = await make_calls(states) 

    //parse data from call.  pull out dates, and check numbers return list of 
    let dataSubsets = get_data_subsets_numbers(datas, 'date', 'deathIncrease')

    //make list of data set objects
    let datasets = make_datasets(dataSubsets)

    //make graph
    var ctx = document.getElementById('myChart');

    var options = {responsive: true, // Instruct chart js to respond nicely.
    maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
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

//  ------------------------------------------------
//                  make multi line graph 
//                  fom series of async calls 
//                  graph by date
//  ------------------------------------------------

// TODO
// add y variable from api call as variable
async function state_daily_graph(pastCalls, statesInput, outPutId, yVariable){
    /*
    input: pass API calls, divID, list of states

    */
    
    //figure out which calls where already made
    let statesNeeded = statesInput.filter(state => !Object.keys(pastCalls).includes(state))

    //make calls to rest
    datas = await make_calls(statesNeeded) 

    //add new calls to saved api calls
    statesNeeded.forEach(state => {
        //maybe add some error checkign
        if(Object.keys(datas).includes(state)){
            pastCalls[state] = datas[state]
        }
    })

    statesInput.forEach(state => {
        //add stuff from past calls to data from new api call
        if(!Object.keys(datas).includes(state)){
            datas[state]= pastCalls[state]
        }
    })

    //parse data from call.  pull out dates, and check numbers return list of 
    let dataSubsets = get_data_subsets(datas, ['date', yVariable])
    
    //make list of data set objects
    let datasets = make_datasets(dataSubsets, 'date', yVariable)

    return date_graph(datasets)
}

function date_graph(datasets){
    /*
    input
    */

    // ctx is vanvase
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
    //console.log(myChart)
    return myChart
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
            //console.log(points)

            let dataSet = {
                label: state,
                data: points,
                borderColor: randomColor, // Add custom color border            
                backgroundColor: randomColor, // Add custom color background (Points and Fill)
                showLine: true,
                fill: false
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

function get_data_subsets(datas, members){
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
    //console.log(subset)
    return subset
}

// same function for both date graphs and number graphs

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




//  ------------------------------------------------
//             get check box input from user            
//  ------------------------------------------------

function get_checked_states(){
    // returns list of states from checked checkboxes
    checkedStates = []
    //console.log('get checked states')

    let checkboxes = Object.values(document.getElementsByClassName('state'))
    
    // filter out non-checked checkboxes
    checkboxes = checkboxes.filter(checkbox => checkbox.checked)

    // get value of each checkbox
    
    checkboxes.forEach(checkbox =>{
        //console.log(checkbox.defaultValue)
        checkedStates.push(checkbox.defaultValue)
    })
    return checkedStates
}

//  ------------------------------------------------
//             main            
//  ------------------------------------------------

//console.log('hello world!')

statesDaily = {}
myChart = {};
myChart['chart'] = null;

// get all checkboxes and add event listener
let checkboxes = Object.values(document.getElementsByClassName('state'))
let radios = Object.values(document.getElementsByClassName('graph-type'))

radios.forEach(radio => {
    radio.addEventListener('click', event => {
        console.log(`${radio.value} click`)
        //get list of states that are currently checked
        let checkedStates = get_checked_states()
        //get graph-type that is selected
        let metric = document.querySelector('input[name = "metric"]:checked').value
        //console.log(metric)

        // destroy old chart if it exists
        if(myChart['chart'] !== null){
            //myChart['chart'].destroy()
            myChart.chart.then(result=>result.destroy())
        }
        myChart['chart'] = state_daily_graph(statesDaily, checkedStates, 'myChart', metric)
    })
});

// add event listener to each checkbox
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', event =>{
        //get list of states that are currently checked
        let checkedStates = get_checked_states()
        //get graph-type that is selected
        let metric = document.querySelector('input[name = "metric"]:checked').value
        //console.log(metric)

        // destroy old chart if it exists
        if(myChart['chart'] !== null){
            //myChart['chart'].destroy()
            myChart.chart.then(result=>result.destroy())
        }
        myChart['chart'] = state_daily_graph(statesDaily, checkedStates, 'myChart', metric)
    })
})

        //let checkedStates = get_checked_states()
        //let metric = document.querySelector('input[name = "metric"]:checked').value
        myChart['chart'] = state_daily_graph(statesDaily, ['WA'], 'myChart', 'deathIncrease')

