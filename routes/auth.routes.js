import express from 'express'
import { registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', protect, getUserProfile)

export default router
