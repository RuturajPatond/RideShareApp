# Ride-Sharing App - Advanced Edition

A modern, full-stack ride-sharing application for college students built with Node.js/Express (Backend) and React Native/Expo (Frontend). This application features real-time ride booking, driver management, and messaging capabilities.

## 🚀 Features

### Core Features
- ✅ User Authentication (Driver & Rider)
- ✅ Ride Creation & Booking System
- ✅ Real-time Location Tracking (Maps Integration)
- ✅ Driver & Rider Profiles
- ✅ Vehicle Management (for Drivers)
- ✅ Rating & Reviews System
- ✅ In-app Messaging
- ✅ Search & Filter Rides
- ✅ Payment Integration Ready (Stripe)

### Advanced Features
- ✅ JWT Token Authentication
- ✅ Role-based Access Control (Driver/Rider)
- ✅ Real-time Notifications
- ✅ Input Validation & Sanitization
- ✅ CORS & Security Headers
- ✅ Rate Limiting
- ✅ Request Logging
- ✅ Error Handling
- ✅ Database Migrations
- ✅ Soft Deletes

## 📦 Tech Stack

### Backend
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **API Format**: RESTful with standardized responses

### Frontend
- **Framework**: React Native 0.79
- **Build Tool**: Expo 54
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Navigation**: Expo Router
- **Maps**: React Native Maps with Google Maps
- **Styling**: NativeWind (Tailwind CSS)
- **Storage**: AsyncStorage

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+ or v20+
- PostgreSQL 12+
- Expo CLI
- Git

### Backend Setup

1. **Clone & Navigate**
```bash
cd ride-sharing/Backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb yatri_db

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

4. **Build & Run**
```bash
# Build TypeScript
npm run build

# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The backend will be running at `http://localhost:3000/api/v1`

### Frontend Setup

1. **Navigate & Install**
```bash
cd ride-sharing/Frontend
npm install
# or
yarn install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
# Edit with your backend URL and API keys
```

3. **Run the App**
```bash
# Start Expo development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Run on web
npm run web
```

## 📚 API Documentation

### Authentication Endpoints

**POST** `/api/v1/auth/signup`
- Create new user account
- Body: `{ firstName, lastName, email, password, confirmPassword, userType }`
- Returns: User object + JWT token

**POST** `/api/v1/auth/login`
- User login
- Body: `{ email, password }`
- Returns: User object + JWT token

**GET** `/api/v1/auth/me` (Protected)
- Get current user profile
- Returns: User object

### Rides Endpoints

**GET** `/api/v1/rides`
- List all available rides with pagination
- Query: `?page=1&limit=10&status=available&fromDate=2024-03-22`
- Returns: Array of rides with pagination info

**GET** `/api/v1/rides/:id`
- Get detailed ride information
- Returns: Ride object with driver/rider info and reviews

**POST** `/api/v1/rides` (Protected - Driver)
- Create new ride
- Body: `{ pickup, pickupLat, pickupLng, dropoff, dropoffLat, dropoffLng, departureDate, departureTime, fare, availableSeats, vehicleInfo, notes }`
- Returns: Created ride object

**PATCH** `/api/v1/rides/:id` (Protected - Driver)
- Update ride details
- Body: Any fields to update

**DELETE** `/api/v1/rides/:id` (Protected - Driver)
- Cancel a ride
- Returns: Updated ride with status 'cancelled'

**POST** `/api/v1/rides/:id/book` (Protected - Rider)
- Book a ride
- Body: `{ seatsToBook }`
- Returns: Updated ride object

### User Endpoints

**GET** `/api/v1/users/profile` (Protected)
- Get user profile with vehicles and reviews
- Returns: User object with related data

**PATCH** `/api/v1/users/profile` (Protected)
- Update user profile
- Body: `{ firstName, lastName, phone, profilePicture }`

**POST** `/api/v1/users/vehicles` (Protected - Driver)
- Add new vehicle
- Body: `{ make, model, year, licensePlate, color, registrationNumber, seatingCapacity }`

**GET** `/api/v1/users/vehicles` (Protected - Driver)
- Get user's vehicles
- Returns: Array of vehicles

**PATCH** `/api/v1/users/vehicles/:vehicleId` (Protected - Driver)
- Update vehicle details

**DELETE** `/api/v1/users/vehicles/:vehicleId` (Protected - Driver)
- Delete vehicle

### Reviews Endpoints

**POST** `/api/v1/users/reviews` (Protected)
- Add review for user
- Body: `{ toUserId, rideId, rating, comment }`

**GET** `/api/v1/users/:userId/reviews`
- Get user's reviews
- Returns: Array of reviews with average rating

## 📁 Project Structure

### Backend
```
Backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── config/
│   │   ├── database.ts        # Database configuration
│   │   └── sequelize.ts       # Sequelize initialization
│   ├── controllers/           # Request handlers
│   │   ├── authController.ts
│   │   ├── rideController.ts
│   │   └── userController.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.ts           # Authentication & authorization
│   │   └── errorHandler.ts   # Global error handling
│   ├── models/               # Sequelize models
│   │   ├── User.ts
│   │   ├── Ride.ts
│   │   ├── Vehicle.ts
│   │   └── Review.ts
│   ├── routes/               # API routes
│   │   ├── authRoute.ts
│   │   ├── rideRoute.ts
│   │   └── userRoute.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── appError.ts
│       ├── catchAsync.ts
│       ├── validators.ts
│       └── logger.ts
├── .env.example
├── .eslintrc.json
├── package.json
└── tsconfig.json
```

### Frontend
```
Frontend/
├── app/
│   ├── _layout.tsx          # Root layout with Redux
│   └── (tab)/
│       ├── _layout.tsx      # Tab navigation layout
│       ├── index.tsx        # Home screen with maps
│       ├── booking.tsx      # Ride booking screen
│       ├── message.tsx      # Messaging screen
│       └── profile.tsx      # User profile screen
├── src/
│   ├── hooks/
│   │   └── useRedux.ts       # Redux hooks
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── authSlice.ts  # Auth state
│   │   │   └── ridesSlice.ts # Rides state
│   │   └── store.ts          # Redux store configuration
│   └── services/
│       └── apiClient.ts      # API client with interceptors
├── .env.example
├── package.json
├── tsconfig.json
└── app.json
```

## 🔐 Environment Variables

### Backend (.env)
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=yatri_db

# Server
APP_PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Frontend (.env.local)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_APP_ENV=development
```

## 🚦 Running the Application

### Development Mode
```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Frontend
cd Frontend
npm start
```

### Production Mode
```bash
# Backend
cd Backend
npm install
npm run build
npm start

# Frontend (Build APK/IPA)
cd Frontend
npm run build:android  # For Android
npm run build:ios      # For iOS
```

## 🧪 Testing

### Backend Testing
```bash
npm test
```

### Frontend Testing
```bash
npm test
```

## 🔄 Database Migrations

```bash
# Create migration
npm run migrate:create -- --name=migration-name

# Run migrations
npm run migrate

# Undo last migration
npm run migrate:undo
```

## 📊 Database Schema

### Users Table
- id (UUID, Primary Key)
- firstName, lastName (String)
- email (String, Unique)
- password (Hashed)
- phone (String, Optional)
- userType (ENUM: '1' = Driver, '2' = Rider)
- isVerified (Boolean)
- rating (Decimal: 1.0 - 5.0)
- totalRides (Integer)
- createdAt, updatedAt (Timestamps)
- deletedAt (Soft delete)

### Rides Table
- id (UUID, Primary Key)
- driverId (UUID, Foreign Key → Users)
- riderId (UUID, Foreign Key → Users, Optional)
- pickup, dropoff (String)
- pickupLat, pickupLng, dropoffLat, dropoffLng (Decimal)
- departureDate, departureTime (Date/Time)
- fare (Decimal)
- availableSeats, bookedSeats (Integer)
- status (ENUM: available | booked | completed | cancelled)
- vehicleInfo (String)
- notes (String, Optional)
- createdAt, updatedAt (Timestamps)

### Vehicles Table
- id (UUID, Primary Key)
- driverId (UUID, Foreign Key → Users)
- make, model (String)
- year (Integer)
- licensePlate, registrationNumber (String, Unique)
- color (String)
- seatingCapacity (Integer)
- createdAt, updatedAt (Timestamps)

### Reviews Table
- id (UUID, Primary Key)
- fromUserId (UUID, Foreign Key → Users)
- toUserId (UUID, Foreign Key → Users)
- rideId (UUID, Foreign Key → Rides)
- rating (Integer: 1-5)
- comment (Text, Optional)
- createdAt, updatedAt (Timestamps)

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi schema validation
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries via Sequelize
- **Error Standardization**: Prevents info leakage

## 📱 Features Breakdown

### For Riders
1. **Browse Rides**: Search and filter available rides
2. **Book Rides**: Reserve seats on available rides
3. **Track Rides**: Real-time location tracking
4. **Rate Drivers**: Leave ratings and reviews
5. **Messaging**: In-app chat with driver
6. **Payment**: Integrated payment system

### For Drivers
1. **Create Rides**: Post available rides
2. **Manage Vehicles**: Add and manage vehicle details
3. **Accept Bookings**: Review and accept ride requests
4. **Ratings**: View feedback from riders
5. **Earnings**: Track earnings and trips
6. **Analytics**: View trip statistics

## 🐛 Known Issues & Limitations

1. **Payment Integration**: Stripe endpoints are ready but not fully implemented in frontend
2. **Socket.io**: Real-time features configured but not fully implemented
3. **Image Upload**: Profile pictures can be stored as URLs only
4. **Email Notifications**: Email service not yet integrated

## 🚀 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time chat with typing indicators
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Ride history
- [ ] Scheduled rides
- [ ] Referral system
- [ ] Emergency contact SOS
- [ ] Ride sharing analytics
- [ ] Admin dashboard

## 📞 Support

For issues or questions:
1. Check the API documentation above
2. Review component prop types
3. Check Redux state structure
4. Review error messages in logs

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

- Built with ❤️ for college students

---

**Last Updated**: March 22, 2026
**Version**: 2.0.0
