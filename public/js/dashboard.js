paypal.Buttons({
    style: {
        shape: 'rect',
        color: 'silver',
        layout: 'vertical',
        label: 'paypal',
    },
    createSubscription: function(data, actions) {
        return actions.subscription.create({
        'plan_id': 'P-93335022SE671992TL7MXUSQ'
        });
    },
    onApprove: function(data, actions) {
        fetch('/newdonor', {
            credentials: 'same-origin',
            method: "POST",
            body: JSON.stringify({ alertId: data.subscriptionID })
        })
    }
}).render('#paypal-button-container');

const editForm = document.getElementById('edit-acc')

editForm.addEventListener('input', () => {
    const formSubmit = document.getElementById('form-submit')
    formSubmit.disabled = false
    formSubmit.style.backgroundColor = 'rgb(96, 47, 233)'
})

const lol = document.getElementById('breh')
const profileButton = document.getElementById("profile")
const reportTextarea = document.getElementById('reason')
const reportsButton = document.getElementById('reports')
const toggleNav = document.getElementById('hamburger')
const delNav = document.getElementById('close-nav')

lol.addEventListener('click', () => {
    document.getElementsByClassName('subscriptions-info')[0].scrollIntoView({ behavior: 'smooth'})
})

profileButton.addEventListener('click', () => {
    document.getElementsByClassName('profile-info')[0].scrollIntoView({ behavior: 'smooth' })
})

reportsButton.addEventListener('click', () => {
    document.getElementsByClassName('reports-info')[0].scrollIntoView({ behavior: 'smooth' })
})

reportTextarea.addEventListener('input', (e) => {
    const target = e.currentTarget
    const maxLength = target.getAttribute('maxlength')
    const currentLen = target.value.length

    if(currentLen >= maxLength) {
        return counterSpan.innerText = "You have reached the maximum amount of characters."
    }

    document.getElementById('text-counter').innerText = `${currentLen}/${maxLength}`
})

toggleNav.addEventListener('click', () => {
    const navbar = document.getElementsByClassName('navbr')[0]
    navbar.style.transform = 'translateX(0%)'
    navbar.style.transition = '1s ease'
})

delNav.addEventListener('click', () => {
    const navbar = document.getElementsByClassName('navbr')[0]
    navbar.style.transform = 'translateX(-150%)'
    navbar.style.transition = '1s ease'
})