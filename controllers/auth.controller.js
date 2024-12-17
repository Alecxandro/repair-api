import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() })
  }

  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'User already registered' })
    }

    const user = new User({ username, email, password })
    await user.save()

    const token = createToken(user._id)

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return res.status(500).json({ message: 'An error occurred while registering the user.' })
  }
}

export const loginUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() })
  }

  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = createToken(user._id)

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      //  token,
    })
  } catch (error) {
    console.error('Error logging user:', error)
    return res.status(500).json({ message: 'An error occurred while logging in.' })
  }
}

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error logging out user:', error)
    return res.status(500).json({ message: 'An error occurred while logging out.' })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error('Error getting user profile:', error)
    return res.status(500).json({ message: 'An error occurred while fetching user profile.' })
  }
}
