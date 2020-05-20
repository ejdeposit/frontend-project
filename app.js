//const url = 'https://swapi.dev/api/people/';
//let baseUrl = 'https://swapi.dev/api/people/?page='; 
//let outputlist = document.querySelector("ul#results");
function get_state_dailies(st){
    let state= st
    let requesturl= `https://covidtracking.com/api/v1/states/${state}/daily.json`

    let next = null
    fetch(`${requesturl}`)
    .then(response => {
        console.log(response)
        //check response status code
        return response.json()
    })
    .then(data => {
        console.log(data)

    });
}

get_state_dailies('CA')
