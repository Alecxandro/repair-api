import express from 'express'
import {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  getCustomerById,
  deleteCustomer,
  getCustomerRepairs,
} from '../controllers/customer.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/create-customer', protect, createCustomer)
router.put('/update-customer/:id', protect, updateCustomer)
router.delete('/delete-customer/:id', protect, deleteCustomer)
router.get('/get-customer/:id', protect, getCustomerById)
router.get('/get-customers', protect, getAllCustomers)
router.get('/get-customers-repairs/:id', protect, getCustomerRepairs)

export default router
