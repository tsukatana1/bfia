const btn1 = document.getElementById('left-btn')
const btn2 = document.getElementById('right-btn')
const slide = document.getElementById('person-slider')
const team_but = document.getElementById('team-button')
const ourTeam = document.getElementById('our-team')

let counter = 1;

btn2.addEventListener('click', () => {
    if(counter >= 3) {
        counter = 1
        slide.style.marginLeft = `0%`
    } else {
        slide.style.marginLeft = `-${counter * 100}%`
        slide.style.transition = 'margin 700ms'
        counter++
    }
})

btn1.addEventListener('click', () => {
    if(counter <= 1) {
        counter = 2
        slide.style.marginLeft = `-200%`
    } else {
        console.log(counter * 100)
        slide.style.marginLeft = `-${counter * 100}`
        slide.style.transition = 'margin 700ms'
        counter--
    }
    console.log(counter)
})

team_but.addEventListener('click', () => {
    ourTeam.scrollIntoView({ behavior: 'smooth' })
})