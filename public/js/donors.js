const slide = document.getElementById('carousel')
const forward_btn = document.getElementById('right')

let counter = 1;

forward_btn.addEventListener('click', () => {
    if(counter >= 3) {
        counter = 1
        slide.style.marginLeft = `0%`
    } else {
        slide.style.marginLeft = `-${counter * 100}%`
        slide.style.transition = 'margin 700ms'
        counter++
    }
})