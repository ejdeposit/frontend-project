const express = require('express')
const app = express()
const port = 3000
const fetch = require("node-fetch");
app.use(express.static('.'))

var bodyParser  = require('body-parser')
//app.use(bodyParser())
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  //res.send('Hello World!')
  res.render('./index.html')
})

app.post('/proxy', async (req, res) => {
  let state= req.body.state

  console.log(req)

  state = state.toLowerCase()
  let requesturl= `https://covidtracking.com/api/v1/states/${state}/daily.json`
  let response = await fetch(requesturl)
  let data = await response.json()
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})