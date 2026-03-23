# Advanced Setup Guide - Ride Sharing App

## Complete Step-by-Step Installation Guide

This guide will walk you through setting up the entire ride-sharing application from scratch.

## Prerequisites Installation

### 1. Install Node.js
- Download from: https://nodejs.org/
- Recommended: v20 LTS or v18 LTS
- Verify installation:
```bash
node --version
npm --version
```

### 2. Install Database (PostgreSQL)
- **Windows**: https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

After installation, verify:
```bash
psql --version
```

### 3. Install Expo CLI
```bash
npm install -g expo-cli
```

### 4. Install Git
- Download from: https://git-scm.com/
- Verify: `git --version`

---

## Backend Setup (Complete Guide)

### Step 1: Navigate to Backend
```bash
cd ride-sharing/Backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- Express.js
- TypeScript & related tools
- Sequelize ORM
- PostgreSQL drivers
- Validation libraries (Joi)
- Security packages (bcryptjs, helmet, cors)
- JWT for authentication
- And more...

### Step 3: Create Database

#### Option A: Using psql (Command Line)
```bash
# Start PostgreSQL
psql -U postgres

# In the PostgreSQL prompt:
CREATE DATABASE yatri_db;
CREATE USER yatri_user WITH PASSWORD 'secure_password';
ALTER ROLE yatri_user SET client_encoding TO 'utf8';
ALTER ROLE yatri_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE yatri_user SET default_transaction_deferrable TO on;
ALTER ROLE yatri_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE yatri_db TO yatri_user;
\q
```

#### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click "Servers" → "Create" → "Server"
3. In "General" tab, enter name: "Local"
4. In "Connection" tab:
   - Hostname: localhost
   - Port: 5432
   - Username: postgres
5. Right-click "Databases" → "Create" → "Database"
6. Name: yatri_db

### Step 4: Environment Configuration

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Edit `.env` with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=yatri_db

# Server Configuration
APP_PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Step 5: Build TypeScript
```bash
npm run build
```

This compiles TypeScript from `src/` to `dist/` directory.

### Step 6: Run Database Migrations
```bash
# First, create sequelize config
sequelize-cli init

# Generate migrations (if needed)
sequelize-cli migration:generate --name init-schema

# Run migrations
npm run migrate
```

### Step 7: Seed Initial Data (Optional)
```bash
npm run seed
```

### Step 8: Start Development Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully on development environment
🚀 Server is running on port 3000
```

### Step 9: Test Backend

Open Postman or Thunder Client and test:

**Health Check:**
```
GET http://localhost:3000/health
```

**Signup:**
```
POST http://localhost:3000/api/v1/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "userType": "1"
}
```

---

## Frontend Setup (Complete Guide)

### Step 1: Navigate to Frontend
```bash
cd ride-sharing/Frontend
```

### Step 2: Install Dependencies
This may take 5-10 minutes:
```bash
npm install
```

Or with yarn (faster):
```bash
yarn install
```

### Step 3: Environment Configuration

1. Create `.env.local` file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_APP_ENV=development
```

### Step 4: Get Google Maps API Key

1. Go to: https://console.cloud.google.com/
2. Create new project
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create API key
5. Add it to `.env.local`

### Step 5: Choose Your Platform

#### For Android Development
```bash
# Install Android Studio and Android SDK
# Then run:
npm run android

# Or start server and choose Android in terminal menu
npm start
# Press 'a' for Android
```

#### For iOS Development (macOS only)
```bash
npm run ios
# Or press 'i' when using npm start
```

#### For Web Development
```bash
npm run web
# Or press 'w' when using npm start
```

### Step 6: Test Frontend

Once running:
1. App should load with map showing your current location
2. If rider: should show "Where to?" search
3. If driver: should show "Create a Ride" button
4. Can navigate through tabs (Home, Booking, Messages, Profile)

---

## Connecting Frontend to Backend

### Automatic Connection

The frontend is already configured to connect to backend via:
- API Client: `src/services/apiClient.ts`
- Redux Actions: `src/redux/slices/authSlice.ts` and `ridesSlice.ts`

### Manual Testing Connection

1. **Login Test**:
   - Make sure backend is running (`npm run dev` in Backend folder)
   - Open frontend
   - Navigate to profile and logout (if logged in)
   - You should see login prompt

2. **Ride Browsing**:
   - Login as rider
   - Go to "Booking" tab
   - Should see API calls in Redux DevTools

3. **Console Errors**:
   - If you see CORS errors: Check `FRONTEND_URL` in backend `.env`
   - If you see connection errors: Check `EXPO_PUBLIC_API_URL` in frontend `.env`

---

## Database Backup & Restore

### Backup Database
```bash
pg_dump -U postgres yatri_db > backup.sql
```

### Restore Database
```bash
psql -U postgres yatri_db < backup.sql
```

---

## Troubleshooting

### Backend Issues

**Error: Cannot find module 'src/app'**
```bash
npm run build
```

**Error: connect ECONNREFUSED (database)**
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists: `createdb yatri_db`

**Port 3000 already in use**
```bash
# Change port in .env or kill process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

**JWT Secret Warning**
- Generate strong secret: 
```bash
openssl rand -base64 32
```

### Frontend Issues

**Error: GetBoundingClientRect not defined**
- Normal on initial load, ignore

**Maps not showing**
1. Ensure location permissions are granted
2. Check Google Maps API key in `.env`
3. Test on physical device (emulator may have issues)

**Redux DevTools not showing**
- Install Redux DevTools browser extension
- Already configured in store

**Expo server issues**
```bash
# Clear cache and restart
npm start --clear
```

---

## Development Workflow

### Daily Development

**Terminal 1 - Backend**:
```bash
cd ride-sharing/Backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd ride-sharing/Frontend
npm start
```

**Terminal 3 - Database** (if needed):
```bash
psql -U postgres yatri_db
```

### Code Changes

**Backend**:
- Edit files in `src/`
- Will auto-recompile with `npm run dev`
- Might need to refresh API calls in frontend

**Frontend**:
- Edit files in `app/` or `src/`
- Hot reload happens automatically
- Redux state will be preserved

---

## Adding a New Feature

### Example: Adding a "Support Tickets" feature

**Backend**:
1. Create model: `src/models/SupportTicket.ts`
2. Create migration: `sequelize-cli migration:generate --name create-support-tickets`
3. Create controller: `src/controllers/supportController.ts`
4. Create route: `src/routes/supportRoute.ts`
5. Add to `src/app.ts`
6. Test with Postman

**Frontend**:
1. Add Redux slice: `src/redux/slices/supportSlice.ts`
2. Update store: `src/redux/store.ts`
3. Create screen: `app/(tab)/support.tsx`
4. Add to navigation: `app/(tab)/_layout.tsx`
5. Test on mobile/web

---

## Performance Tips

### Backend
- Enable SQL query caching
- Use database indexes on frequently queried fields
- Enable gzip compression: `app.use(compression())`

### Frontend
- Use React.memo for list items
- Implement pagination for ride lists
- Cache API responses in Redux

---

## Security Checklist

Before deploying to production:

- [ ] Change all `.env` variables
- [ ] Update JWT_SECRET to strong random value
- [ ] Enable HTTPS everywhere
- [ ] Set appropriate CORS origins
- [ ] Enable database SSL connections
- [ ] Remove debug logging
- [ ] Update NODE_ENV to 'production'
- [ ] Add rate limiting to all endpoints
- [ ] Implement input validation on all endpoints
- [ ] Use strong, hashed passwords
- [ ] Set secure cookie flags

---

## Monitoring & Logging

### Backend Logs
- Check console output from `npm run dev`
- Logs are also written with timestamps

### Frontend Logs
- React Native console (press `i` or `a` while running)
- Redux DevTools browser extension
- Expo CLI output

### Database Logs
```bash
psql -U postgres yatri_db -c "SELECT * FROM pg_stat_statements;"
```

---

## Next Steps

1. ✅ **Complete Setup**: Follow this guide completely
2. 📚 **Read API Docs**: Check README.md for API endpoints
3. 🧪 **Test Thoroughly**: Use Postman for backend, Expo for frontend
4. 🔧 **Customize**: Modify colors, add features, rebrand
5. 🚀 **Deploy**: Follow deployment guides for your platform

---

**Version**: 2.0.0
**Last Updated**: March 22, 2026
