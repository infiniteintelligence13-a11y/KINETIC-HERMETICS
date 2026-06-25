// Stripe Payment Processing
let stripe;
let elements;
let cardElement;

document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
    displayOrderSummary();
    setupFormListeners();
});

function initializeStripe() {
    // Initialize Stripe (replace with actual publishable key)
    stripe = Stripe('pk_live_YOUR_STRIPE_KEY');
    elements = stripe.elements();
    cardElement = elements.create('card');
    cardElement.mount('#card-element');

    // Handle card errors
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

function setupFormListeners() {
    const sameAsShipping = document.getElementById('same-as-shipping');
    const billingForm = document.getElementById('billing-form');
    
    sameAsShipping.addEventListener('change', function() {
        billingForm.style.display = this.checked ? 'none' : 'block';
    });

    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
}

function displayOrderSummary() {
    const cartData = cart.items;
    const itemsContainer = document.getElementById('order-items');
    
    if (cartData.length === 0) {
        window.location.href = '/pages/products.html';
        return;
    }

    itemsContainer.innerHTML = '';
    
    cartData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <div>
                <p class="item-name">${item.productName}</p>
                <p class="item-qty">Qty: ${item.quantity}</p>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        itemsContainer.appendChild(itemElement);
    });

    updateSummaryTotals();
}

function updateSummaryTotals() {
    const subtotal = cart.getTotal();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    const formData = getFormData();
    
    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(calculateTotal() * 100),
                customerInfo: formData
            })
        });

        const paymentData = await response.json();

        if (!paymentData.clientSecret) {
            throw new Error('Failed to create payment intent');
        }

        const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: formData.fullName,
                    email: formData.email,
                    address: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zip,
                        country: 'US'
                    }
                }
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        } else if (result.paymentIntent.status === 'succeeded') {
            // Payment successful
            const orderId = paymentData.orderId || generateOrderId();
            saveOrder(orderId, formData, paymentData.clientSecret);
            window.location.href = `/pages/order-confirmation.html?order=${orderId}`;
        }
    } catch (error) {
        console.error('Payment error:', error);
        document.getElementById('card-errors').textContent = error.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Purchase';
    }
}

function getFormData() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    return {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        country: formData.get('country'),
        items: cart.items
    };
}

function calculateTotal() {
    const subtotal = cart.getTotal();
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 10;
    return subtotal + tax + shipping;
}

function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function saveOrder(orderId, formData, paymentIntentId) {
    const order = {
        id: orderId,
        timestamp: new Date().toISOString(),
        items: formData.items,
        total: calculateTotal(),
        customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
        },
        paymentIntentId: paymentIntentId,
        status: 'completed'
    };

    // Save to localStorage (in production, would save to backend)
    let orders = JSON.parse(localStorage.getItem('kinetic-orders') || '[]');
    orders.push(order);
    localStorage.setItem('kinetic-orders', JSON.stringify(orders));

    // Clear the cart
    cart.clearCart();

    // Send order confirmation email (would be backend API call)
    sendOrderConfirmation(order);
}

function sendOrderConfirmation(order) {
    // This would be a backend API call
    console.log('Sending order confirmation to:', order.customer.email);
    // fetch('/api/send-order-confirmation', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(order)
    // });
}
