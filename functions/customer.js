import mongoose from 'mongoose';
import {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  getCustomerById,
  deleteCustomer,
  getCustomerRepairs
} from '../controllers/customer.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();

  const path = event.path.replace('/.netlify/functions/customer', '');
  const method = event.httpMethod;

  try {
    // Verify authentication first
    const user = await protect(event);
    let result;

    switch (true) {
      case method === 'POST' && path === '/create-customer':
        result = await createCustomer(JSON.parse(event.body), user);
        break;
      case method === 'GET' && path === '/get-customers':
        result = await getAllCustomers();
        break;
      case method === 'GET' && path.match(/\/get-customer\/.+/):
        const id = path.split('/').pop();
        result = await getCustomerById(id);
        break;
      // Add other routes similarly
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Not Found' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
        'Access-Control-Allow-Credentials': true
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