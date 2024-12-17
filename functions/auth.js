import { connectDB } from '../config/database.js';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://repair-api2.netlify.app' // Add your Netlify domain
].filter(Boolean);

export const handler = async (event, context) => {
  // Connect to database
  await connectDB();

  const path = event.path.replace('/.netlify/functions/auth', '');
  const method = event.httpMethod;

  try {
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
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 