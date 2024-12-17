import { connectDB } from '../config/database.js';
import {
  createRepair,
  getRepairs,
  updateRepair,
  getLatestRepairs,
  getRepair,
  deleteRepair,
} from '../controllers/repair.controller.js';
import { protect } from '../middleware/auth.middleware.js';

export const handler = async (event, context) => {
  await connectDB();

  const path = event.path.replace('/.netlify/functions/repair', '');
  const method = event.httpMethod;

  try {
    // Verify authentication first
    const user = await protect(event);
    let result;

    switch (true) {
      case method === 'POST' && path === '/create-repair':
        result = await createRepair(JSON.parse(event.body), user);
        break;
      case method === 'GET' && path === '/get-repairs':
        result = await getRepairs();
        break;
      case method === 'GET' && path.match(/\/get-repair\/.+/):
        const id = path.split('/').pop();
        result = await getRepair(id);
        break;
      case method === 'PUT' && path.match(/\/update-repair\/.+/):
        const updateId = path.split('/').pop();
        result = await updateRepair(updateId, JSON.parse(event.body));
        break;
      case method === 'DELETE' && path.match(/\/delete-repair\/.+/):
        const deleteId = path.split('/').pop();
        result = await deleteRepair(deleteId);
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
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
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