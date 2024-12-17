import Repair from '../models/Repair.js'
import Customer from '../models/Customer.js'
import mongoose from 'mongoose'

export const createRepair = async (req, res) => {
  try {
    const { deviceType, brand, model, problemDescription, estimatedCost, repairNotes, completionDate, customerId } = req.body

    const customer = await Customer.findOne({
      _id: customerId,
      user: req.user.id,
    })
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found or does not belong to the current user',
      })
    }

    const newRepair = await Repair.create({
      customer: customer._id,
      deviceType,
      brand,
      model,
      problemDescription,
      estimatedCost,
      repairNotes,
      completionDate,
    })

    res.status(201).json(newRepair)
  } catch (error) {
    console.error('Error creating repair:', error)
    res.status(500).json({
      message: 'Failed to create repair',
      details: error.message,
    })
  }
}

export const getRepairs = async (req, res) => {
  try {
    const customers = await Customer.find({
      user: req.user.id,
    }).select('_id')
    const customerIds = customers.map((customer) => customer._id)

    const repairs = await Repair.find({
      customer: {
        $in: customerIds,
      },
    }).populate('customer', 'name email')

    if (repairs.length === 0) {
      return res.status(404).json({
        message: 'No repairs found for the user',
      })
    }

    return res.status(200).json(repairs)
  } catch (error) {
    console.error('Error fetching repairs:', error)
    return res.status(500).json({
      message: 'Failed to retrieve repairs',
      details: error.message,
    })
  }
}

export const getRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id).populate('customer', 'name email')
    if (!repair) {
      return res.status(404).json({
        message: 'Repair not found',
      })
    }
    return res.status(200).json(repair)
  } catch (error) {
    console.error('Error fetching repair:', error)
    return res.status(500).json({
      message: 'Failed to retrieve repair',
    })
  }
}

export const updateRepair = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid repair ID' })
    }

    const updateFields = {
      deviceType: req.body.deviceType,
      brand: req.body.brand,
      model: req.body.model,
      problemDescription: req.body.problemDescription,
      estimatedCost: req.body.estimatedCost,
      status: req.body.status,
      repairNotes: req.body.repairNotes,
      completionDate: req.body.completionDate,
    }

    Object.keys(updateFields).forEach((key) => updateFields[key] === undefined && delete updateFields[key])

    const updatedRepair = await Repair.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })

    if (!updatedRepair) {
      return res.status(404).json({ message: 'Repair record not found' })
    }

    res.status(200).json({
      message: 'Repair record updated successfully',
      repair: updatedRepair,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid update data',
        errors: Object.values(error.errors).map((err) => err.message),
      })
    }

    res.status(500).json({
      message: 'Error updating repair record',
      error: error.message,
    })
  }
}

export const getLatestRepairs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5

    const latestRepairs = await Repair.find().sort({ createdAt: -1 }).limit(limit).populate({
      path: 'customer',
      select: 'name email phone',
    })

    if (!latestRepairs.length) {
      return res.status(404).json({ message: 'No repairs found' })
    }

    return res.status(200).json(latestRepairs)
  } catch (error) {
    console.error('Error fetching latest repairs:', error)
    return res.status(500).json({ message: 'An error occurred while fetching the latest repairs.' })
  }
}

export const deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findByIdAndDelete(req.params.id)

    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' })
    }

    res.status(200).json({ message: 'Repair deleted successfully' })
  } catch (error) {
    console.error('Error deleting repair:', error)
    res.status(500).json({ message: 'An error occurred while deleting the repair.' })
  }
}
