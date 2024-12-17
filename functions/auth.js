import mongoose from 'mongoose';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://repair-api2.netlify.app' // Add your Netlify domain
].filter(Boolean);

const connectDB = async () => {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error('Database connection failed');
  }
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await connectDB();

    const path = event.path.replace('/.netlify/functions/auth', '');
    const method = event.httpMethod;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': true
        }
      };
    }

    let result;
    
    switch (true) {
      case method === 'POST' && path === '/register':
        result = await registerUser(JSON.parse(event.body));
        break;
      case method === 'POST' && path === '/login':
        result = await loginUser(JSON.parse(event.body));
        break;
      case method === 'POST' && path === '/logout':
        result = await logoutUser();
        break;
      case method === 'GET' && path === '/me':
        // You'll need to modify protect middleware for serverless
        const user = await protect(event);
        result = await getUserProfile(user);
        break;
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Not Found' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 