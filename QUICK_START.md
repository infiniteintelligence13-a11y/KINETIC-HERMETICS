# Quick Start Guide - Kinetic Hermetics Platform

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js (v14+) installed
- MongoDB account (free tier at mongodb.com)
- Stripe account (free at stripe.com)
- SendGrid account (free 12,500 emails/month)

### Step 1: Clone Repository
```bash
git clone https://github.com/infiniteintelligence13-a11y/KINETIC-HERMETICS.git
cd KINETIC-HERMETICS
```

### Step 2: Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Install dependencies
npm install

# Start server
npm run dev
```

Server will run on `http://localhost:5000`

### Step 3: Frontend Setup
```bash
cd ../frontend

# For development, you can open index.html in a browser or use a simple server
python -m http.server 8000

# For production builds with React/Vue, install dependencies
npm install
npm start
```

Frontend will run on `http://localhost:8000` or `http://localhost:3000`

---

## 📋 Essential Configuration

### MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Click "Connect"
5. Copy connection string
6. Add to `.env`: `MONGODB_URI=mongodb+srv://...`

### Stripe Setup
1. Sign up at https://stripe.com
2. Go to Dashboard → API Keys
3. Copy "Secret Key" and "Publishable Key"
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   ```

### SendGrid Setup
1. Sign up at https://sendgrid.com
2. Go to Settings → API Keys
3. Create new API key
4. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.your_key
   SENDGRID_FROM_EMAIL=hello@kinetichemetics.com
   ```

---

## 🧪 Testing Endpoints

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test@123",
    "phone": "(555) 123-4567"
  }'
```

### Get Webinars
```bash
curl http://localhost:5000/api/webinars
```

### Register for Webinar
```bash
curl -X POST http://localhost:5000/api/webinars/[WEBINAR_ID]/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "(555) 123-4567"
  }'
```

---

## 📁 Project Structure

```
KINETIC-HERMETICS/
├── backend/
│   ├── server.js              # Main Express server
│   ├── emailService.js        # Email automation
│   ├── emailScheduler.js      # Email scheduling with node-cron
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── SETUP_GUIDE.md         # Backend setup instructions
│   └── API_DOCUMENTATION.md   # API endpoint docs
│
├── frontend/
│   ├── index.html             # Main landing page
│   ├── dashboard.html         # User dashboard
│   ├── styles/
│   │   └── main.css           # Styling
│   ├── scripts/
│   │   ├── main.js            # Main logic
│   │   └── auth.js            # Authentication class
│   └── js/
│
├── funnel/
│   ├── webinar-landing.html   # High-converting webinar page
│   └── webinar-funnel.md      # Funnel strategy docs
│
├── content/
│   ├── HERBAL_DATABASE.md     # Herbal medicine info
│   └── HERMETIC_PRINCIPLES.md # Philosophy & teachings
│
├── docs/
│   └── PROJECT_OVERVIEW.md    # Project plan
│
├── README.md                  # Project overview
└── DEPLOYMENT_GUIDE.md        # Deployment instructions
```

---

## 🎯 Key Features

### ✅ Authentication
- User registration & login
- JWT token-based security
- Password hashing with bcrypt

### ✅ Webinar System
- Create and manage webinars
- Registration with auto-confirmation
- Email reminders (24h & 1h before)
- Replay access

### ✅ Courses & Services
- Course catalog
- Enrollment system
- Progress tracking

### ✅ Payment Processing
- Stripe integration
- Payment history
- Invoices

### ✅ Email Automation
- Welcome emails
- Webinar confirmations
- Pre-webinar reminders
- Post-webinar follow-ups
- Marketing sequences

### ✅ User Dashboard
- View registered webinars
- Course progress
- Payment history
- Profile management

---

## 🔄 Typical User Flow

### For Webinar Registration
1. User lands on webinar landing page (`funnel/webinar-landing.html`)
2. Enters email and name in registration form
3. Receives confirmation email immediately
4. Gets reminder 24 hours before webinar
5. Gets reminder 1 hour before webinar
6. Joins webinar link at time
7. Receives replay link and thank you email after
8. Offered special course discount

### For Course Purchase
1. User views course on website
2. Clicks "Buy Now" button
3. Creates account or logs in
4. Redirected to Stripe payment
5. Completes payment
6. Gets confirmation email with access
7. Can view course in dashboard
8. Track progress through lessons

---

## 📧 Email Sequences

### Webinar Sequence (5 emails over 7 days)
- **Day 0**: Confirmation + calendar invite
- **Day 1**: Value preview + testimonial
- **Day before**: Join reminder
- **Day of webinar**: Early access link
- **1 hour before**: Last chance reminder
- **After webinar**: Replay + exclusive offer

### Course Purchase Sequence
- **Immediate**: Welcome to course
- **Day 1**: Getting started guide
- **Day 3**: First module reminder
- **Day 7**: Progress check-in
- **Day 14**: Encouragement + Q&A

---

## 🛠️ Common Tasks

### Add New Webinar
```javascript
const kherm = new KineticHermetics();
const result = await kherm.registerWebinar(webinarId, {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 123-4567'
});
```

### Get User Dashboard
```javascript
const kherm = new KineticHermetics();
const dashboard = await kherm.getDashboardData();
console.log(dashboard.webinarRegistrations);
console.log(dashboard.purchases);
```

### Process Payment
```javascript
const kherm = new KineticHermetics();
const intent = await kherm.createPaymentIntent(courseId, 297);
// Use Stripe.js to confirm payment
const confirmed = await kherm.confirmPayment(
    intent.data.paymentIntentId,
    courseId,
    297
);
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Check `.env` has correct `MONGODB_URI`
- Verify IP is whitelisted in MongoDB Atlas
- Try running locally first with `mongodb://localhost:27017/kinetic-hermetics`

### Email Not Sending
- Check `SENDGRID_API_KEY` is correct
- Verify sender email is confirmed in SendGrid
- Check SendGrid activity logs

### Payment Not Processing
- Use Stripe test card: `4242 4242 4242 4242`
- Verify Stripe keys in `.env`
- Check Stripe dashboard for errors

### CORS Errors
- Update `FRONTEND_URL` in `.env`
- Add frontend domain to CORS whitelist in `server.js`

---

## 📚 Documentation

- **API Docs**: `backend/API_DOCUMENTATION.md`
- **Backend Setup**: `backend/SETUP_GUIDE.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Project Plan**: `docs/PROJECT_OVERVIEW.md`
- **Webinar Strategy**: `funnel/webinar-funnel.md`

---

## 🚀 Next Steps

1. **Test Locally**
   - Set up all services
   - Register a test account
   - Register for a test webinar
   - Complete a test payment

2. **Customize Content**
   - Update webinar titles & descriptions
   - Add course content
   - Customize email templates
   - Add your branding

3. **Deploy to Production**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Choose hosting (Heroku, AWS, DigitalOcean)
   - Set up SSL certificates
   - Configure custom domain

4. **Launch Marketing**
   - Create landing pages
   - Build email lists
   - Run ad campaigns
   - Track conversions

---

## 🤝 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check docs/ folder
- **API Docs**: See `backend/API_DOCUMENTATION.md`

---

## 📝 License

All rights reserved. Commercial use requires permission.

---

## 🎉 You're Ready!

Your Kinetic Hermetics platform is now set up and ready to go!

Next: Customize it with your content and launch! 🚀

