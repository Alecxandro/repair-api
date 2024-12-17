import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/*export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required. Please provide a valid Bearer token',
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      })
    }

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    console.error('Auth Middleware Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    })
  }
}
*/

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.authToken
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      })
    }

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    console.error('Auth Middleware Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    })
  }
}
