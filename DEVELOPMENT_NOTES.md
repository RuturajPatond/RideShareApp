# Development Notes

Detailed notes for developers working on the ride-sharing application.

## Project Architecture

### Backend Structure
```
Backend/
├── src/
│   ├── app.ts              # Express app initialization and middleware
│   ├── server.ts           # HTTP server startup
│   ├── config/
│   │   ├── database.ts     # Sequelize connection
│   │   └── config.js       # Environment configuration
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces and enums
│   ├── models/
│   │   ├── User.ts         # User model with password hashing
│   │   ├── Ride.ts         # Ride model with location tracking
│   │   ├── Vehicle.ts      # Driver vehicle information
│   │   └── Review.ts       # User ratings and reviews
│   ├── controllers/
│   │   ├── authController.ts     # Auth logic (signup, login, logout)
│   │   ├── rideController.ts     # Ride CRUD and booking
│   │   └── userController.ts     # Profile and vehicle management
│   ├── routes/
│   │   ├── authRoute.ts    # /auth endpoints
│   │   ├── rideRoute.ts    # /rides endpoints
│   │   └── userRoute.ts    # /users endpoints
│   ├── middleware/
│   │   ├── auth.ts         # JWT verification and role checking
│   │   └── errorHandler.ts # Global error handling
│   └── utils/
│       ├── appError.ts     # Custom error class
│       ├── catchAsync.ts   # Async error wrapper
│       └── validators.ts   # Joi validation schemas
├── db/
│   ├── migrations/         # Sequelize migrations
│   ├── models/             # Legacy models (integrated into src/models)
│   └── seeders/            # Database seeders
└── package.json            # Dependencies and scripts
```

### Frontend Structure
```
Frontend/
├── app/
│   ├── _layout.tsx         # Root layout with Redux Provider
│   └── (tab)/
│       ├── _layout.tsx     # Tab navigator setup
│       ├── index.tsx       # Home screen (maps, ride discovery)
│       ├── booking.tsx     # Available rides and booking
│       ├── message.tsx     # Messaging interface
│       └── profile.tsx     # User profile and settings
├── src/
│   ├── services/
│   │   └── apiClient.ts    # Axios HTTP client with interceptors
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── authSlice.ts    # Auth state (user, token)
│   │   │   └── ridesSlice.ts   # Rides state (browsing, booking)
│   │   └── store.ts        # Redux store configuration
│   └── hooks/
│       └── useRedux.ts     # Typed Redux hooks
├── assets/
│   ├── fonts/              # Custom fonts
│   └── images/             # App images
└── package.json
```

---

## Key Implementation Details

### Authentication Flow

1. **Signup/Login**
   - User submits credentials
   - Backend validates against database
   - Backend returns JWT token
   - Frontend stores token in AsyncStorage
   - Token automatically attached to subsequent requests

2. **Token Restoration**
   - App starts → Root layout effect runs
   - `restoreToken` thunk dispatches
   - Reads token from AsyncStorage
   - Verifies token with backend via `GET /auth/me`
   - If valid, sets auth state; if invalid, clears token

3. **Protected Routes**
   - Frontend: Redux checks `auth.isAuthenticated`
   - Backend: `protect` middleware validates JWT

### State Management (Redux)

**Auth Slice** (`authSlice.ts`)
- Manages: user object, JWT token, loading state, errors
- Async Thunks: signup, login, logout, getMe, restoreToken
- Persists token to AsyncStorage on login
- Clears token on logout

**Rides Slice** (`ridesSlice.ts`)
- Manages: available rides array, selected ride, pagination
- Async Thunks: fetchRides, getRideById, createRide, bookRide, cancelRide
- Filters rides by status and date range

### Error Handling

**Backend**
- `appError.ts`: Custom error class with statusCode
- `errorHandler.ts`: Global middleware catches all errors
- Maps Sequelize errors (validation, unique constraints, etc.) to user-friendly messages
- Returns standardized error responses

**Frontend**
- API interceptors catch errors and dispatch to Redux
- Components check Redux error state and display error messages
- 401 errors trigger logout and redirect to auth screen

### Validation

**Backend** (Joi schemas in `validators.ts`)
- Reusable schemas for all endpoints
- Validates: email format, password strength, required fields, ranges
- Returns detailed error messages

**Frontend**
- React Native TextInput constraints (maxLength, keyboardType)
- Redux thunk validation before API call
- Display error messages on failed validation

---

## Database Schema

### User Table
```typescript
{
  id: UUID (PK),
  firstName: STRING,
  lastName: STRING,
  email: STRING (UNIQUE),
  password: STRING,
  userType: ENUM ('1'=driver, '2'=rider),
  phone: STRING,
  rating: DECIMAL (1-5),
  totalRides: INTEGER,
  isVerified: BOOLEAN,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  deletedAt: TIMESTAMP (soft delete)
}
```

### Ride Table
```typescript
{
  id: UUID (PK),
  driverId: UUID (FK → User),
  riderId: UUID (FK → User, nullable),
  pickup: STRING,
  pickupLat: DECIMAL,
  pickupLng: DECIMAL,
  dropoff: STRING,
  dropoffLat: DECIMAL,
  dropoffLng: DECIMAL,
  departureDate: DATE,
  departureTime: TIME,
  fare: DECIMAL (positive),
  availableSeats: INTEGER (1-7),
  bookedSeats: INTEGER,
  status: ENUM ('available','booked','completed','cancelled'),
  vehicleInfo: STRING,
  notes: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Vehicle Table
```typescript
{
  id: UUID (PK),
  userId: UUID (FK → User),
  make: STRING,
  model: STRING,
  year: INTEGER (1900-2099),
  color: STRING,
  licensePlate: STRING (UNIQUE),
  registrationNumber: STRING (UNIQUE),
  seatingCapacity: INTEGER (1-7),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Review Table
```typescript
{
  id: UUID (PK),
  fromUserId: UUID (FK → User),
  toUserId: UUID (FK → User),
  rideId: UUID (FK → Ride),
  rating: INTEGER (1-5),
  comment: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Backend**
   ```typescript
   // 1. Create validator schema in src/utils/validators.ts
   export const newSchema = Joi.object({
     field: Joi.string().required()
   });

   // 2. Create controller method in src/controllers/*.ts
   export const newMethod = catchAsync(async (req, res, next) => {
     // logic here
     res.status(200).json({ status: 'success', data: result });
   });

   // 3. Add route in src/routes/*.ts
   router.post('/endpoint', protect, restrictTo('1'), newMethod);
   ```

2. **Frontend**
   - Add method in `src/services/apiClient.ts`
   - Create async thunk in appropriate Redux slice
   - Dispatch from component
   - Show loading/error states

### Adding a New Screen

1. Create file in `app/(tab)/newScreen.tsx`
2. Add to tab navigator in `app/(tab)/_layout.tsx`
3. Create Redux state if needed
4. Connect components via Redux hooks
5. Add styling with NativeWind (Tailwind CSS)

### Running Database Migrations

```bash
# Backend directory
npm run migrate                 # Run pending migrations
npm run migrate:undo          # Undo last migration
npm run migrate:undo:all      # Undo all migrations
npm run seed:all              # Run all seeders
```

### Debugging Tips

**Backend**
- Enable logging: Check `Morgan` configuration in `app.ts`
- Database queries: Check `logging: true` in Sequelize config
- Breakpoints: Use `node --inspect` and Chrome DevTools
- Error details: Check `.env` NODE_ENV (development shows stack)

**Frontend**
- React DevTools: Inspect component tree and props
- Redux DevTools: Track state changes and time travel
- Network tab: Inspect API requests and responses
- Console: Check for JS errors

### Environment Variables

**Backend** (`.env`)
```
NODE_ENV=development|production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/ridedb
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000,http://mobile.local
API_URL=http://localhost:3000/api/v1
```

**Frontend** (`.env` or `.env.local`)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
```

---

## Testing

### Backend Tests (Not yet implemented)

```bash
npm test                       # Run all tests
npm test -- --coverage        # With coverage report
npm test -- --watch          # Watch mode
```

Test file structure: `src/__tests__/` parallel to source files

### Frontend Tests (Not yet implemented)

```bash
npm test -- --coverage        # Run tests with coverage
```

Test file structure: `**.test.tsx` or `**.spec.tsx`

---

## Performance Optimization

### Backend
- Pagination on list endpoints (default 10 items/page)
- Database indexing on frequently queried columns (email, status)
- Connection pooling (configured in Sequelize)
- Request compression (gzip via helmet)

### Frontend
- FlatList with keyExtractor for efficient rendering
- Lazy loading of images
- Redux selectors for memoized state
- Code splitting with Expo Router

---

## Security Considerations

### Backend
- Helmet: Secure HTTP headers
- CORS: Limited to frontend origin
- Rate Limiting: 100 req/15min per IP
- Password: Hashed with bcryptjs (10 salt rounds)
- JWT: Signed with SECRET_KEY
- SQL Injection: Protected by Sequelize ORM
- Input Validation: All inputs validated with Joi

### Frontend
- Tokens: Stored in AsyncStorage (encrypted at OS level)
- HTTPS: Required in production
- API URL: Loaded from environment variables
- Sensitive Data: Never logged or exposed in UI

---

## Troubleshooting

### Backend Won't Start

**Problem**: Port 3000 already in use
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

**Problem**: Database connection failed
- Check PostgreSQL service is running
- Verify DATABASE_URL in .env
- Check network connectivity

### API Calls Failing

**401 Unauthorized**
- Token expired: User needs to login again
- Invalid token: Check JWT_SECRET matches frontend

**404 Not Found**
- Check endpoint path spelling
- Verify route is mounted in app.ts
- Check request method (GET vs POST)

**500 Server Error**
- Check backend logs: `NODE_ENV=development npm start`
- Verify database models are synced
- Check error details in response

### Frontend Not Connecting to Backend

**Problem**: API calls timeout
- Check backend is running on correct port
- Check EXPO_PUBLIC_API_URL in .env
- Verify network connectivity
- Check CORS_ORIGIN in backend .env

**Problem**: Token not persisting
- AsyncStorage may not be available in simulator
- Clear app cache and reinstall
- Check browser DevTools Storage tab

---

## Version History

- **v2.0.0** (Current)
  - TypeScript throughout
  - Redux state management
  - Complete API client
  - All 4 main screens
  - Maps integration

- **v1.0.0** (Initial)
  - Basic Express backend
  - Basic React Native frontend
  - Incomplete controllers

---

## Useful Commands

```bash
# Backend
cd Backend
npm install                              # Install dependencies
npm start                               # Start development server
npm run build                           # Compile TypeScript
npm run dev                             # Dev server with hot reload
npm test                                # Run tests
npm run lint                            # Lint code
npm run format                          # Format code (Prettier)

# Frontend
cd Frontend
npm install
npm start                               # Start Expo
npm run ios                             # Run on iOS simulator
npm run android                         # Run on Android emulator
npm run web                             # Run in browser
npm test                                # Run tests
npm run lint                            # Lint code

# Database
npm run migrate                         # Create tables
npm run migrate:undo                    # Drop tables
npm run seed:all                        # Populate seed data
```

---

## Contact & Support

For architecture questions or technical discussions, refer to:
- **API Issues**: See API_REFERENCE.md
- **Setup Issues**: See SETUP_GUIDE.md
- **Code Issues**: Check error logs and stack traces

---

**Last Updated**: March 22, 2026
**Maintained By**: Development Team
