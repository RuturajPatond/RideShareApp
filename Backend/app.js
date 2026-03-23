const express = require('express');
const dotenv = require('dotenv');
const AppError = require('./utils/appError.js');
const catchAsync = require('./utils/catchAsync.js');
const globalErrorHandler = require('./controller/errorController.js');

const authRouter = require('./route/authRoute.js');
const rideRouter = require('./route/rideRoute.js');
const userRouter = require('./route/userRoute.js');

// Load environment variables
dotenv.config({ path: `${process.cwd()}/.env` });

const app = express();
app.use(express.json());
// console.log(rideRouter);

// ✅ 1. Mount all API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/rides', rideRouter);
app.use('/api/v1/users', userRouter);

// ✅ 2. Default route (for testing)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: '🚀 Backend is running fine!' });
  console.log("Server is Running");
});

// ✅ 3. Handle undefined routes
app.use(catchAsync(async (req, res, next) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
}));

// ✅ 4. Global error handler
app.use(globalErrorHandler);

// ✅ 5. Start server
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
