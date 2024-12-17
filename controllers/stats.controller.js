import Customer from '../models/Customer.js'
import Repair from '../models/Repair.js'
import mongoose from 'mongoose'

export const getStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({ user: req.user.id })

    const totalRepairs = await Repair.countDocuments({
      customer: {
        $in: await Customer.find({ user: req.user.id }).distinct('_id'),
      },
    })

    const totalIncome = await Repair.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: '$customerDetails',
      },
      {
        $match: {
          'customerDetails.user': new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$estimatedCost' },
        },
      },
    ])

    const repairStatusBreakdown = await Repair.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: '$customerDetails',
      },
      {
        $match: {
          'customerDetails.user': new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    const repairDeviceTypeBreakdown = await Repair.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: '$customerDetails',
      },
      {
        $match: {
          'customerDetails.user': new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 },
        },
      },
    ])

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCustomers = await Customer.countDocuments({
      user: req.user.id,
      createdAt: { $gte: thirtyDaysAgo },
    })

    const recentRepairs = await Repair.countDocuments({
      customer: {
        $in: await Customer.find({ user: req.user.id }).distinct('_id'),
      },
      createdAt: { $gte: thirtyDaysAgo },
    })

    return res.status(200).json({
      totalCustomers,
      totalRepairs,
      totalIncome: totalIncome[0]?.totalRevenue || 0,
      repairStatusBreakdown: repairStatusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      repairDeviceTypeBreakdown: repairDeviceTypeBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      recentActivity: {
        newCustomers: recentCustomers,
        newRepairs: recentRepairs,
      },
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return res.status(500).json({ message: 'An error occurred while fetching statistics.' })
  }
}
