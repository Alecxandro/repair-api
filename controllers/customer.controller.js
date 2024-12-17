import Customer from '../models/Customer.js'
import Repair from '../models/Repair.js'
import { validationResult } from 'express-validator'

export const createCustomer = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() })
  }

  try {
    const userId = req.user.id
    const { name, email, phone, address } = req.body

    const existingCustomer = await Customer.findOne({ email })
    if (existingCustomer) {
      return res.status(409).json({ message: 'Customer already registered' })
    }

    const customer = await Customer.create({
      user: userId,
      name,
      email,
      phone,
      address,
    })

    return res.status(201).json(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
    return res.status(500).json({ message: 'An error occurred while creating the customer.' })
  }
}

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.id }).populate('user', ['name', 'email'])
    return res.status(200).json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return res.status(500).json({ message: 'An error occurred while fetching customers.' })
  }
}

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('user', ['name', 'email'])
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    return res.status(200).json(customer)
  } catch (error) {
    console.error('Error fetching customer by ID:', error)
    return res.status(500).json({ message: 'An error occurred while fetching the customer.' })
  }
}

export const updateCustomer = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() })
  }

  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      'user',
      ['name', 'email']
    )

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    return res.status(200).json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return res.status(500).json({ message: 'An error occurred while updating the customer.' })
  }
}

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    return res.status(200).json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return res.status(500).json({ message: 'An error occurred while deleting the customer.' })
  }
}

export const getLatestCustomers = async (req, res) => {
  try {
    const latestCustomers = await Customer.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', ['name', 'email'])

    if (!latestCustomers.length) {
      return res.status(404).json({ message: 'No customers found' })
    }

    return res.status(200).json(latestCustomers)
  } catch (error) {
    console.error('Error fetching latest customers:', error)
    return res.status(500).json({ message: 'An error occurred while fetching the latest customers.' })
  }
}

export const getCustomerRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find({ customer: req.params.id })
    res.json(repairs)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer repairs' })
  }
}
