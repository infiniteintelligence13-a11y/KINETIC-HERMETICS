// Backend API Server Setup - Express.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe');

// Load environment variables
dotenv.config();

const app = express();

// Stripe webhook needs raw body — mount before express.json()
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
            req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        console.log('Payment succeeded:', pi.id, '$' + (pi.amount / 100));
        // TODO: fulfill order — grant course access, trigger email, update DB
    }
    res.json({ received: true });
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// ==================== DATABASE SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Webinar Registration Schema
const webinarRegistrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    webinarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webinar', required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    registeredAt: { type: Date, default: Date.now },
    attended: { type: Boolean, default: false },
    watchedReplay: { type: Boolean, default: false }
});

// Webinar Schema
const webinarSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    duration: Number, // in minutes
    instructor: String,
    instructorBio: String,
    instructorImage: String,
    videoUrl: String,
    replayUrl: String,
    maxParticipants: Number,
    price: { type: Number, default: 0 }, // 0 for free
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    createdAt: { type: Date, default: Date.now }
});

// Course/Service Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    modules: [String],
    lessons: Number,
    instructor: String,
    duration: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    createdAt: { type: Date, default: Date.now }
});

// Customer Payment Schema
const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    stripePaymentId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentDate: { type: Date, default: Date.now }
});

// Email List Schema (for marketing automation)
const emailListSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    source: String, // webinar, course, direct signup
    status: { type: String, enum: ['active', 'unsubscribed', 'bounced'], default: 'active' },
    subscribedAt: { type: Date, default: Date.now },
    tags: [String]
});

// Models
const User = mongoose.model('User', userSchema);
const WebinarRegistration = mongoose.model('WebinarRegistration', webinarRegistrationSchema);
const Webinar = mongoose.model('Webinar', webinarSchema);
const Course = mongoose.model('Course', courseSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const EmailList = mongoose.model('EmailList', emailListSchema);

// ==================== AUTHENTICATION MIDDLEWARE ====================

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// ==================== PRODUCT & EMAIL ROUTES ====================
const { router: productsRouter } = require('./routes/products');
const { router: emailRouter }    = require('./routes/email');
app.use('/api/products', productsRouter);
app.use('/api/email',    emailRouter);   // merges with existing email routes below

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// ==================== AUTH ROUTES ====================

// User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });
        
        await newUser.save();
        
        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '30d'
        });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '30d'
        });
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Current User
app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== WEBINAR ROUTES ====================

// Get All Webinars
app.get('/api/webinars', async (req, res) => {
    try {
        const webinars = await Webinar.find().sort({ date: 1 });
        res.json(webinars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Single Webinar
app.get('/api/webinars/:id', async (req, res) => {
    try {
        const webinar = await Webinar.findById(req.params.id);
        if (!webinar) {
            return res.status(404).json({ message: 'Webinar not found' });
        }
        res.json(webinar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Webinar (Admin Only)
app.post('/api/webinars', verifyToken, async (req, res) => {
    try {
        const webinar = new Webinar(req.body);
        await webinar.save();
        res.status(201).json(webinar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register for Webinar
app.post('/api/webinars/:id/register', async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;
        const webinarId = req.params.id;
        
        // Check if webinar exists
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            return res.status(404).json({ message: 'Webinar not found' });
        }
        
        // Add to email list
        await EmailList.findOneAndUpdate(
            { email },
            {
                email,
                firstName,
                lastName,
                source: 'webinar',
                tags: ['webinar-registered'],
                subscribedAt: new Date()
            },
            { upsert: true, new: true }
        );
        
        // Check if already registered
        const existingRegistration = await WebinarRegistration.findOne({
            email,
            webinarId
        });
        
        if (existingRegistration) {
            return res.status(400).json({ message: 'Already registered for this webinar' });
        }
        
        // Create registration
        const registration = new WebinarRegistration({
            webinarId,
            email,
            firstName,
            lastName,
            phone,
            userId: null // Will be linked if user logs in
        });
        
        await registration.save();
        
        // TODO: Send confirmation email via SendGrid
        
        res.status(201).json({
            message: 'Successfully registered for webinar',
            registration
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Webinar Registrations
app.get('/api/webinars/:id/registrations', verifyToken, async (req, res) => {
    try {
        const registrations = await WebinarRegistration.find({
            webinarId: req.params.id
        });
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== COURSE/SERVICE ROUTES ====================

// Get All Courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Single Course
app.get('/api/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Course (Admin Only)
app.post('/api/courses', verifyToken, async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== PAYMENT ROUTES ====================

// Create Payment Intent
app.post('/api/payments/create-intent', verifyToken, async (req, res) => {
    try {
        const { courseId, amount } = req.body;
        
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                userId: req.userId,
                courseId: courseId
            }
        });
        
        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Confirm Payment
app.post('/api/payments/confirm', verifyToken, async (req, res) => {
    try {
        const { paymentIntentId, courseId, amount } = req.body;
        
        const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            const payment = new Payment({
                userId: req.userId,
                courseId,
                stripePaymentId: paymentIntentId,
                amount,
                status: 'completed'
            });
            
            await payment.save();
            
            res.json({
                message: 'Payment successful',
                payment
            });
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Payment History
app.get('/api/payments/history', verifyToken, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.userId });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== EMAIL MARKETING ROUTES ====================

// Subscribe to Email List
app.post('/api/email/subscribe', async (req, res) => {
    try {
        const { email, firstName, lastName, source } = req.body;
        
        const emailEntry = await EmailList.findOneAndUpdate(
            { email },
            {
                email,
                firstName,
                lastName,
                source,
                status: 'active',
                subscribedAt: new Date()
            },
            { upsert: true, new: true }
        );
        
        res.json({
            message: 'Successfully subscribed',
            emailEntry
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unsubscribe
app.post('/api/email/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        await EmailList.findOneAndUpdate(
            { email },
            { status: 'unsubscribed' }
        );
        
        res.json({ message: 'Successfully unsubscribed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Email List (Admin Only)
app.get('/api/email/list', verifyToken, async (req, res) => {
    try {
        const emailList = await EmailList.find();
        res.json(emailList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== USER DASHBOARD ROUTES ====================

// Get User Dashboard Data
app.get('/api/dashboard', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        const webinarRegistrations = await WebinarRegistration.find({
            email: user.email
        }).populate('webinarId');
        const purchases = await Payment.find({
            userId: req.userId,
            status: 'completed'
        }).populate('courseId');
        
        res.json({
            user,
            webinarRegistrations,
            purchases,
            totalSpent: purchases.reduce((sum, p) => sum + p.amount, 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update User Profile
app.put('/api/dashboard/profile', verifyToken, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                firstName,
                lastName,
                phone,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');
        
        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
