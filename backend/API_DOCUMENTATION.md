# API Documentation - Kinetic Hermetics

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "(555) 123-4567"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### Get Current User
**GET** `/auth/me`

**Headers:** Requires Authorization token

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "createdAt": "2026-06-23T00:00:00.000Z"
}
```

---

## 📹 Webinar Endpoints

### Get All Webinars
**GET** `/webinars`

**Query Parameters:**
- `status` (optional): 'upcoming', 'live', 'completed'
- `limit` (optional): default 10
- `offset` (optional): default 0

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Herbal Remedies for Modern Life",
    "description": "Learn practical herbal solutions...",
    "date": "2026-07-15T19:00:00.000Z",
    "duration": 90,
    "instructor": "Dr. Sarah Jones",
    "price": 0,
    "status": "upcoming",
    "maxParticipants": 500
  }
]
```

### Get Single Webinar
**GET** `/webinars/:id`

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Herbal Remedies for Modern Life",
  "description": "Learn practical herbal solutions...",
  "date": "2026-07-15T19:00:00.000Z",
  "duration": 90,
  "instructor": "Dr. Sarah Jones",
  "instructorBio": "20+ years of experience...",
  "instructorImage": "https://...",
  "videoUrl": "https://...",
  "replayUrl": "https://...",
  "price": 0,
  "status": "upcoming",
  "maxParticipants": 500
}
```

### Create Webinar (Admin)
**POST** `/webinars`

**Headers:** Requires Authorization token

**Request Body:**
```json
{
  "title": "New Webinar",
  "description": "Description here",
  "date": "2026-07-15T19:00:00.000Z",
  "duration": 90,
  "instructor": "Instructor Name",
  "price": 0,
  "maxParticipants": 500
}
```

### Register for Webinar
**POST** `/webinars/:id/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "(555) 123-4567"
}
```

**Response:**
```json
{
  "message": "Successfully registered for webinar",
  "registration": {
    "_id": "507f1f77bcf86cd799439013",
    "webinarId": "507f1f77bcf86cd799439012",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "registeredAt": "2026-06-23T00:00:00.000Z"
  }
}
```

### Get Webinar Registrations
**GET** `/webinars/:id/registrations`

**Headers:** Requires Authorization token

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "registeredAt": "2026-06-23T00:00:00.000Z",
    "attended": false
  }
]
```

---

## 📚 Course Endpoints

### Get All Courses
**GET** `/courses`

**Query Parameters:**
- `level` (optional): 'beginner', 'intermediate', 'advanced'
- `limit` (optional): default 10

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Herbal Medicine Fundamentals",
    "description": "Complete guide to...",
    "price": 297,
    "image": "https://...",
    "modules": 12,
    "lessons": 48,
    "instructor": "Dr. Sarah Jones",
    "level": "beginner"
  }
]
```

### Get Single Course
**GET** `/courses/:id`

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Herbal Medicine Fundamentals",
  "description": "Complete guide to...",
  "price": 297,
  "image": "https://...",
  "modules": ["Module 1", "Module 2", ...],
  "lessons": 48,
  "instructor": "Dr. Sarah Jones",
  "duration": "8 weeks",
  "level": "beginner"
}
```

### Create Course (Admin)
**POST** `/courses`

**Headers:** Requires Authorization token

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Description here",
  "price": 297,
  "modules": ["Module 1", "Module 2"],
  "instructor": "Instructor Name",
  "level": "beginner"
}
```

---

## 💳 Payment Endpoints

### Create Payment Intent
**POST** `/payments/create-intent`

**Headers:** Requires Authorization token

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439014",
  "amount": 297
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234_secret_5678",
  "paymentIntentId": "pi_1234"
}
```

### Confirm Payment
**POST** `/payments/confirm`

**Headers:** Requires Authorization token

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234",
  "courseId": "507f1f77bcf86cd799439014",
  "amount": 297
}
```

**Response:**
```json
{
  "message": "Payment successful",
  "payment": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "courseId": "507f1f77bcf86cd799439014",
    "amount": 297,
    "status": "completed",
    "paymentDate": "2026-06-23T00:00:00.000Z"
  }
}
```

### Get Payment History
**GET** `/payments/history`

**Headers:** Requires Authorization token

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "courseId": "507f1f77bcf86cd799439014",
    "amount": 297,
    "status": "completed",
    "paymentDate": "2026-06-23T00:00:00.000Z"
  }
]
```

---

## 📧 Email Marketing Endpoints

### Subscribe to Email List
**POST** `/email/subscribe`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "source": "webinar"
}
```

**Response:**
```json
{
  "message": "Successfully subscribed",
  "emailEntry": {
    "_id": "507f1f77bcf86cd799439016",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "subscribedAt": "2026-06-23T00:00:00.000Z"
  }
}
```

### Unsubscribe
**POST** `/email/unsubscribe`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Successfully unsubscribed"
}
```

### Get Email List (Admin)
**GET** `/email/list`

**Headers:** Requires Authorization token

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "subscribedAt": "2026-06-23T00:00:00.000Z",
    "tags": ["webinar-registered", "vip"]
  }
]
```

---

## 👤 Dashboard & Profile Endpoints

### Get Dashboard Data
**GET** `/dashboard`

**Headers:** Requires Authorization token

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "webinarRegistrations": [...],
  "purchases": [...],
  "totalSpent": 297
}
```

### Update User Profile
**PUT** `/dashboard/profile`

**Headers:** Requires Authorization token

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "(555) 123-4567"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "User already exists"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Webinar not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting
- No rate limiting configured by default
- Recommended for production: 100 requests per minute per IP

## Webhook Events
Future implementation for payment confirmations and email events.
