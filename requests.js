const fetch = require('node-fetch')

const body =  {
    e: "welcome"
}

fetch('http://localhost:3000/donor', {
    method: "POST",
    body: JSON.stringify(body),
})
.then(result => result.json())
.then(json => console.log(json))