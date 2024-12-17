import express from 'express'
import {
  createRepair,
  getRepairs,
  updateRepair,
  getLatestRepairs,
  getRepair,
  deleteRepair,
} from '../controllers/repair.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/create-repair', protect, createRepair)
router.get('/get-repairs', protect, getRepairs)
router.get('/get-repair/:id', protect, getRepair)
router.put('/update-repair/:id', protect, updateRepair)
router.delete('/delete-repair/:id', protect, deleteRepair)

export default router
