const myButton = document.getElementById('payment-button')
const errorPha = document.getElementById('error-pha')

paypal.Buttons({
    style: {
        size: 'large',
        layout: 'horizontal',
        color: 'blue',
        shape: 'rect',
        label: 'checkout',
    },
    createOrder: function(data, actions) {

    },
    onApprove: function(data, actions) {
        
    }
}).render('.payment-button')