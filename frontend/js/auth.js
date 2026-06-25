// Frontend Authentication & Integration Script
// This file handles all authentication and API integration on the frontend

class KineticHermetics {
    constructor() {
        this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
    }

    // ==================== AUTHENTICATION ====================

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                this.token = data.token;
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                this.token = data.token;
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('authToken');
        this.token = null;
        return true;
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    // ==================== WEBINAR FUNCTIONS ====================

    /**
     * Get all webinars
     */
    async getWebinars(filter = {}) {
        try {
            let url = `${this.apiUrl}/webinars`;
            const params = new URLSearchParams(filter);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching webinars:', error);
            return [];
        }
    }

    /**
     * Get single webinar
     */
    async getWebinar(id) {
        try {
            const response = await fetch(`${this.apiUrl}/webinars/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching webinar:', error);
            return null;
        }
    }

    /**
     * Register for webinar
     */
    async registerWebinar(webinarId, userData) {
        try {
            const response = await fetch(`${this.apiUrl}/webinars/${webinarId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== COURSE FUNCTIONS ====================

    /**
     * Get all courses
     */
    async getCourses(filter = {}) {
        try {
            let url = `${this.apiUrl}/courses`;
            const params = new URLSearchParams(filter);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    }

    /**
     * Get single course
     */
    async getCourse(id) {
        try {
            const response = await fetch(`${this.apiUrl}/courses/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching course:', error);
            return null;
        }
    }

    // ==================== PAYMENT FUNCTIONS ====================

    /**
     * Create payment intent (for Stripe)
     */
    async createPaymentIntent(courseId, amount) {
        try {
            const response = await fetch(`${this.apiUrl}/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ courseId, amount })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Confirm payment
     */
    async confirmPayment(paymentIntentId, courseId, amount) {
        try {
            const response = await fetch(`${this.apiUrl}/payments/confirm`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paymentIntentId, courseId, amount })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get payment history
     */
    async getPaymentHistory() {
        try {
            const response = await fetch(`${this.apiUrl}/payments/history`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }
    }

    // ==================== DASHBOARD FUNCTIONS ====================

    /**
     * Get dashboard data
     */
    async getDashboardData() {
        try {
            const response = await fetch(`${this.apiUrl}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.apiUrl}/dashboard/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== EMAIL FUNCTIONS ====================

    /**
     * Subscribe to email list
     */
    async subscribeToEmails(email, firstName, lastName, source = 'website') {
        try {
            const response = await fetch(`${this.apiUrl}/email/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    source
                })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Unsubscribe from emails
     */
    async unsubscribeFromEmails(email) {
        try {
            const response = await fetch(`${this.apiUrl}/email/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Format price for display
     */
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    /**
     * Format date for display
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
}

// Export for use in applications
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KineticHermetics;
}

// Global variable for browser use
window.KineticHermetics = KineticHermetics;
