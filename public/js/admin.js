const accButton = document.getElementById('accounts-redirect')
const reportButton = document.getElementById('reports-redirect')
const darkModeBtn = document.getElementById('dark-mode-btn')

const accountBox = document.getElementsByClassName('accounts-page')[0]
const reportsBox = document.getElementsByClassName('reports-div')[0]

accButton.addEventListener('click', () => {
    accountBox.scrollIntoView({ behavior: 'smooth'})
})

reportButton.addEventListener('click', () => {
    reportsBox.scrollIntoView({ behavior: 'smooth'})
})

darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark')
    document.getElementsByClassName('dash')[0].classList.toggle('dark')
})