const search = document.getElementById('submit-search')
const token = document.querySelector("meta[name='csrf-token']").content
const donate_button = document.getElementById('redirect-button')

search.addEventListener('click', () => {
    const query = document.getElementById('profile-search').value

    const body = {
        query: query
    }

    fetch('/getuser', {
        credentials: 'same-origin',
        method: "POST",
        headers: { "Content-Type": "application/json", "CSRF-Token": token },
        body: JSON.stringify(body)
    })
    .then(result => result.json())
    .then(res => {
        displayResults(res)
    })
})

function displayResults(result) {
    const parentContainer = document.querySelector('.profiles-result')
    const currentRes = document.querySelectorAll('.each-person')
    const nullPhara = document.getElementsByClassName('search-rsp')[1]

    currentRes.forEach(i => i.remove())

    if(result.body.length === 0) {
        return nullPhara.innerText = 'No results found.'
    } else {
        if(nullPhara) {
            nullPhara.innerText = ''
        }
        result.body.forEach(i => {
            const html = `<div class="each-person">
                            <div class="time-name">
                                <a href="http://localhost:3000/profile/${i['user_id']}"> ${i['display_name']} </a>
                                <p> Created At ${new Date(parseInt(i['account_creation'])).toLocaleString()} UTC</p>
                            </div>
                            <p>${i['description']}</p>
                            <p>Click to see more.</p>
                        </div>`
    
            const myDiv = document.createElement('div')
            myDiv.innerHTML = html
    
            parentContainer.appendChild(myDiv)
        })
    }
}