// Stripe Payment Integration Script
// Add this to frontend for handling Stripe payments

class StripePaymentHandler {
    constructor(stripePublicKey) {
        this.stripe = Stripe(stripePublicKey);
        this.elements = this.stripe.elements();
        this.cardElement = this.elements.create('card');
    }

    /**
     * Mount card element to DOM
     */
    mountCardElement(elementId) {
        const cardContainer = document.getElementById(elementId);
        if (cardContainer) {
            this.cardElement.mount(`#${elementId}`);
            this.setupCardValidation();
        }
    }

    /**
     * Setup real-time card validation
     */
    setupCardValidation() {
        const displayError = document.getElementById('card-errors');

        this.cardElement.on('change', (event) => {
            if (event.error) {
                displayError.textContent = event.error.message;
                displayError.classList.add('visible');
            } else {
                displayError.textContent = '';
                displayError.classList.remove('visible');
            }
        });
    }

    /**
     * Process payment
     */
    async processPayment(paymentIntentSecret, cardholderName) {
        try {
            const { paymentIntent, error } = await this.stripe.confirmCardPayment(
                paymentIntentSecret,
                {
                    payment_method: {
                        card: this.cardElement,
                        billing_details: { name: cardholderName }
                    }
                }
            );

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, paymentIntent };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle 3D Secure authentication
     */
    async handle3DSecure(paymentIntentSecret) {
        const { paymentIntent, error } = await this.stripe.handleCardAction(
            paymentIntentSecret
        );

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, paymentIntent };
    }

    /**
     * Create payment element (newer API)
     */
    async createPaymentElement(clientSecret) {
        const paymentElement = this.stripe.elements({
            clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#2c3e50',
                    colorBackground: '#ffffff',
                    colorText: '#333333',
                    borderRadius: '8px'
                }
            }
        });

        return paymentElement;
    }
}

/**
 * Checkout Flow Handler
 */
class CheckoutFlow {
    constructor(apiUrl, stripePublicKey) {
        this.apiUrl = apiUrl;
        this.kherm = new KineticHermetics();
        this.paymentHandler = new StripePaymentHandler(stripePublicKey);
    }

    /**
     * Start checkout for course
     */
    async startCheckout(courseId) {
        try {
            // Get course details
            const course = await this.kherm.getCourse(courseId);
            if (!course) {
                throw new Error('Course not found');
            }

            // Create payment intent
            const intentResult = await this.kherm.createPaymentIntent(
                courseId,
                course.price
            );

            if (!intentResult.success) {
                throw new Error(intentResult.error);
            }

            // Store for use in checkout
            this.currentPaymentIntent = intentResult.data;
            this.currentCourse = course;

            return { success: true, course, paymentIntent: intentResult.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Complete checkout
     */
    async completeCheckout(cardholderName) {
        try {
            if (!this.currentPaymentIntent) {
                throw new Error('No payment intent found');
            }

            // Process payment
            const paymentResult = await this.paymentHandler.processPayment(
                this.currentPaymentIntent.clientSecret,
                cardholderName
            );

            if (!paymentResult.success) {
                throw new Error(paymentResult.error);
            }

            // Confirm payment with backend
            const confirmResult = await this.kherm.confirmPayment(
                this.currentPaymentIntent.paymentIntentId,
                this.currentCourse._id,
                this.currentCourse.price
            );

            if (!confirmResult.success) {
                throw new Error(confirmResult.error);
            }

            return { success: true, payment: confirmResult.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle subscription (recurring payments)
     */
    async setupSubscription(planId, paymentMethodId) {
        try {
            const response = await fetch(`${this.apiUrl}/payments/subscribe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.kherm.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planId,
                    paymentMethodId
                })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId) {
        try {
            const response = await fetch(
                `${this.apiUrl}/payments/subscribe/${subscriptionId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.kherm.token}`
                    }
                }
            );

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

/**
 * Checkout UI Component
 */
class CheckoutUI {
    constructor(containerId, checkoutFlow) {
        this.container = document.getElementById(containerId);
        this.flow = checkoutFlow;
    }

    /**
     * Render checkout form
     */
    renderCheckoutForm(courseId) {
        const form = `
            <div class="checkout-form">
                <div class="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" id="cardholderName" placeholder="John Doe" required>
                </div>

                <div class="form-group">
                    <label>Card Details</label>
                    <div id="card-element" class="card-element"></div>
                    <div id="card-errors" role="alert" class="error-message"></div>
                </div>

                <div class="form-group">
                    <label>Billing Address</label>
                    <input type="text" id="billingAddress" placeholder="123 Main St" required>
                </div>

                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="billingCity" placeholder="New York" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>State</label>
                        <input type="text" id="billingState" placeholder="NY" required>
                    </div>
                    <div class="form-group">
                        <label>ZIP Code</label>
                        <input type="text" id="billingZip" placeholder="10001" required>
                    </div>
                </div>

                <button id="submitBtn" class="btn-primary" type="submit">
                    Complete Purchase
                </button>

                <div id="payment-message" class="message"></div>
            </div>
        `;

        this.container.innerHTML = form;
        this.setupEventListeners(courseId);
        this.flow.paymentHandler.mountCardElement('card-element');
    }

    /**
     * Setup form event listeners
     */
    setupEventListeners(courseId) {
        const submitBtn = document.getElementById('submitBtn');
        const form = this.container.querySelector('.checkout-form');

        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleSubmit(courseId);
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit(courseId) {
        const submitBtn = document.getElementById('submitBtn');
        const messageDiv = document.getElementById('payment-message');
        const cardholderName = document.getElementById('cardholderName').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            const result = await this.flow.completeCheckout(cardholderName);

            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '✓ Payment successful! Redirecting to dashboard...';
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = '✗ Payment failed: ' + result.error;
                submitBtn.disabled = false;
                submitBtn.textContent = 'Complete Purchase';
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '✗ Error: ' + error.message;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Purchase';
        }
    }

    /**
     * Show payment confirmation
     */
    showConfirmation(paymentData) {
        const confirmation = `
            <div class="payment-confirmation">
                <div class="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <p>Your order has been confirmed.</p>
                
                <div class="confirmation-details">
                    <p><strong>Order ID:</strong> ${paymentData.id}</p>
                    <p><strong>Amount:</strong> $${(paymentData.amount / 100).toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <p>A confirmation email has been sent to your email address.</p>
                
                <a href="/dashboard" class="btn-primary">Go to Dashboard</a>
            </div>
        `;

        this.container.innerHTML = confirmation;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StripePaymentHandler,
        CheckoutFlow,
        CheckoutUI
    };
}
