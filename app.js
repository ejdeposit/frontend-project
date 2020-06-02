
statePopulations = {
    AL:4903185,
    AK:731545,
    AZ:7278717,
    AR:3017804,
    CA:39512223,
    CO:5758736,
    CT:3565287,
    DE:973764,
    FL:21477737,
    GA:10617423,
    HI:1415872,
    ID:1787065,
    IL:12671821,
    IN:6732219,
    IA:3155070,
    KS:2913314,
    KY:4467673,
    LA:4648794,
    ME:1344212,
    MD:6045680,
    MA:6892503,
    MI:9986857,
    MN:5639632,
    MS:2976149,
    MO:6137428,
    MT:1068778,
    NE:1934408,
    NV:3080156,
    NH:1359711,
    NJ:8882190,
    NM:2096829,
    NY:19453561,
    NC:10488084,
    ND:762062,
    OH:11689100,
    OK:3956971,
    OR:4217737,
    PA:12801989,
    RI:1059361,
    SC:5148714,
    SD:884659,
    TN:6829174,
    TX:28995881,
    UT:3205958,
    VT:623989,
    VA:8535519,
    WA:7614893,
    WV:1792147,
    WI:5822434,
    WY:578759
}

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
        //check response status code
        return response.json()
    })
    .then(data => {
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
async function state_daily_graph(pastCalls, statesInput, outPutId, graphSelection){
    /*
    input: pass API calls, divID, list of states
    */
    let graphTitle = ''
    let sevenDayAvg = false;
    let twoWeekCum = false;
    let yVariable=''
    if(graphSelection === 'positiveIncrease'){
        graphTitle = 'New Daily Cases'
        yVariable = graphSelection
    }
    else if(graphSelection === 'deathIncrease'){
        graphTitle = 'New Daily Deaths'
        yVariable = graphSelection

    }
    else if(graphSelection === 'avgPositiveIncrease'){
        yVariable = 'positiveIncrease';
        sevenDayAvg = true;
        graphTitle = "Seven Day Average in New Cases"
    }
    else if(graphSelection === 'avgDeathIncrease'){
        yVariable = 'deathIncrease';
        sevenDayAvg = true;
        graphTitle = "Seven Day Average in New Deaths";
    }
    else if(graphSelection ==='deathsPerK'){
        yVariable = 'deathIncrease';
        twoWeekCum = true;
        graphTitle = "New Deaths Per 1000 Residents";

    }
    else if(graphSelection ==='casesPerK'){
        yVariable = 'positiveIncrease';
        twoWeekCum = true;
        graphTitle = "New cases Per 1000 Residents";
    }
    
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

    //combine saved data with new data
    statesInput.forEach(state => {
        if(!Object.keys(datas).includes(state)){
            datas[state]= pastCalls[state]
        }
    })
    console.log('combined data')
    console.log(datas)

    //parse data from call.  pull out dates, and check numbers return list of 
    let dataSubsets = get_data_subsets(datas, ['date', yVariable])
    console.log('data subsets')
    console.log(dataSubsets)

    //transform datasubsets for 7 day avg.  should be able to maintain order
    if(sevenDayAvg){
        dataSubsets = seven_day_avg(dataSubsets)
    }
    
    if(twoWeekCum){
        dataSubsets = two_week_cumulutive(dataSubsets)
    } 

    //filter out negative numbers if deats or 
     
    //make list of data set objects 
    let datasets = make_datasets(dataSubsets, 'date', yVariable)

    //add in labels for graphs
    let title=''
    if(yVariable === 'positiveIncrease'){

    }

    return date_graph(datasets, graphTitle)
}

function date_graph(datasets, graphTitle){
    /*
    input
    */

    // ctx is vanvase
    var ctx = document.getElementById('myChart');
        
    var options = {
        title: {
            display: true,
            text: graphTitle,
            fontSize: 20
        },
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
                    x: new Date(year, month-1, day),
                    y: date[y]
                }
                return point
            })

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

function seven_day_avg(datas){
    console.log('Seven_day_avg()')
    console.log('datas')
    console.log(datas)
    let states = Object.keys(datas)

    if(Object.keys(datas).length === 0){
        return {}
    }

    avgDatas = {}
    duration = 7
    duration = (duration -1)/2

    let yVariable = get_y_variable(datas)

    //states data consists of list of objects
    states.forEach(state =>{
        let avgData = [];
        let data=datas[state];
        data.forEach(day =>{
            let index = data.indexOf(day);
            let week = []
            week.push(day[yVariable])
            //avg correct up to here
            
            //get 3 below
            let i = index-1;
            let count = 0;
            while(i >= 0 && count<duration){
                let prevDay = data[i][yVariable]
                week.push(prevDay)
                i = i - 1;
                count = count + 1
            }

            i = index+1;
            count = 0;
            while(i < data.length && count<duration){
                week.push(data[i][yVariable])
                i = i + 1;
                count = count + 1
            }

            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            let avg = week.reduce(reducer)/ week.length
            let avgPoint = {}
            avgPoint['date'] = day['date']
            avgPoint[yVariable] = avg

            avgData.push(avgPoint)
        })
        avgDatas[state] = avgData
    })
    return avgDatas
}

function get_y_variable(datas){
    let states = Object.keys(datas) 
    let sampleData = datas[states[0]][0]
    let keys = Object.keys(sampleData)
    return keys.filter(x => x !== "date" )[0]

}

function two_week_cumulutive(datas){
    let reducedData={}
    let states = Object.keys(datas)
    if(states === 0){
        return {}
    }

    let yVariable = get_y_variable(datas)

    states.forEach(state => {
        //split list into list of 7 day lists
        let weekCums =[]
        let max = datas[state].length

        for(let i=0; i+14 < max; i=i+14){
            let week = []
            week.push(datas[state][i])
            week.push(datas[state][i+1])
            week.push(datas[state][i+2])
            week.push(datas[state][i+4])
            week.push(datas[state][i+5])
            week.push(datas[state][i+6])
            week.push(datas[state][i+7])
            week.push(datas[state][i+8])
            week.push(datas[state][i+9])
            week.push(datas[state][i+10])
            week.push(datas[state][i+11])
            week.push(datas[state][i+12])
            week.push(datas[state][i+13])
            week.push(datas[state][i+14])
            weekCums.push(week)
        }
        console.log(weekCums)
        
        //reduce each lists
        //use date from first item in list
        reducedData[state] = [] 

        weekCums.forEach(week => {
            let dateStr= week[0]['date']
            let accum = 0
            week.forEach(day =>{
                accum = accum + day[yVariable]
            });
            let newWeek = {};
            newWeek[yVariable]=1000 * accum/statePopulations[state];
            newWeek['date']=dateStr;
            reducedData[state].push(newWeek)
            console.log(newWeek)
            console.log(statePopulations[state])
            console.log(week)
        });
    });

    //divide data by pop or separate function
    return reducedData
}


//  ------------------------------------------------
//             get check box input from user            
//  ------------------------------------------------

function get_checked_states(){
    // returns list of states from checked checkboxes
    checkedStates = []

    let checkboxes = Object.values(document.getElementsByClassName('state'))
    
    // filter out non-checked checkboxes
    checkboxes = checkboxes.filter(checkbox => checkbox.checked)

    // get value of each checkbox
    
    checkboxes.forEach(checkbox =>{
        checkedStates.push(checkbox.defaultValue)
    })
    return checkedStates
}

//  ------------------------------------------------
//             main            
//  ------------------------------------------------

statesDaily = {}
myChart = {};
myChart['chart'] = null;

// get all checkboxes and add event listener
let checkboxes = Object.values(document.getElementsByClassName('state'))
let radios = Object.values(document.getElementsByClassName('graph-type'))

//add event listeners for graph selection radio options
radios.forEach(radio => {
    radio.addEventListener('click', event => {
        //get list of states that are currently checked
        let checkedStates = get_checked_states()
        //get graph-type that is selected
        let metric = document.querySelector('input[name = "metric"]:checked').value

        // destroy old chart if it exists
        if(myChart['chart'] !== null){
            //myChart['chart'].destroy()
            myChart.chart.then(result=>result.destroy())
        }
        myChart['chart'] = state_daily_graph(statesDaily, checkedStates, 'myChart', metric)
    })
});

// add event listener to each state checkbox
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', event =>{
        //get list of states that are currently checked
        let checkedStates = get_checked_states()
        //get graph-type that is selected
        let metric = document.querySelector('input[name = "metric"]:checked').value

        // destroy old chart if it exists
        if(myChart['chart'] !== null){
            //myChart['chart'].destroy()
            myChart.chart.then(result=>result.destroy())
        }
        myChart['chart'] = state_daily_graph(statesDaily, checkedStates, 'myChart', metric)
    })
})

// make graph
//let checkedStates = get_checked_states()
//let metric = document.querySelector('input[name = "metric"]:checked').value
myChart['chart'] = state_daily_graph(statesDaily, ['WA'], 'myChart', 'deathIncrease')

