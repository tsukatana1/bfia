const elementsLength = 100 / document.querySelectorAll('.form-slider-container').length
const counterSpan = document.getElementById("description-word-counter")
const errorPha = document.getElementById('error-pha')

function noAlert(event) {
    event.preventDefault()
    console.log(event) 
    errorPha.innerText = 'Please fill out all fields.'
}

var counter = 0
document.getElementById('for-button').addEventListener('click', ()=> {if(counter >= 3) counter=0; else { counter++ }; var i = document.getElementsByClassName('register-boxes')[0]; if(i.style.transform === 'translateX(-66%)') return; i.style.transform = `translateX(-${elementsLength * counter}%)`;  })
document.getElementById('back-button').addEventListener('click', ()=> { if(counter <= 0) counter=0; else { counter-- }; var i = document.getElementsByClassName('register-boxes')[0]; if(i.style.transform === 'translateX(0%)') return; i.style.transform = `translateX(-${(counter * elementsLength)}%)`; })

document.getElementById("des-textarea").addEventListener('input', (e) => {
    const target = e.currentTarget
    const maxLength = target.getAttribute('maxlength')
    const currentLen = target.value.length
    
    if(currentLen >= maxLength) {
        return counterSpan.innerText = "You have reached the maximum amount of characters."
    } 

    counterSpan.innerText = `${currentLen}/${maxLength}`
})
