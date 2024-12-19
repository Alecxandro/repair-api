/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 751:
/***/ ((module) => {

module.exports = require("@babel/runtime/helpers/interopRequireDefault");

/***/ }),

/***/ 729:
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ 898:
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),

/***/ 577:
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ 818:
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ 252:
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ 975:
/***/ ((module) => {

module.exports = require("express-validator");

/***/ }),

/***/ 525:
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),

/***/ 829:
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ 37:
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ 124:
/***/ ((module) => {

module.exports = require("winston");

/***/ }),

/***/ 586:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(__webpack_require__(37));
var _dotenv = _interopRequireDefault(__webpack_require__(818));
_dotenv.default.config();
const connectDB = async () => {
  try {
    await _mongoose.default.connect(process.env.MONGO_URI);
    console.log(`db connection established`);
  } catch (error) {
    console.error(`connection failed: ${error.message}`);
    process.exit(1);
  }
};
var _default = exports["default"] = connectDB;

/***/ }),

/***/ 938:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.registerUser = exports.logoutUser = exports.loginUser = exports.getUserProfile = void 0;
var _User = _interopRequireDefault(__webpack_require__(696));
var _jsonwebtoken = _interopRequireDefault(__webpack_require__(829));
var _expressValidator = __webpack_require__(975);
const createToken = id => {
  return _jsonwebtoken.default.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};
const registerUser = async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: errors.array()
    });
  }
  try {
    const {
      username,
      email,
      password
    } = req.body;
    const existingUser = await _User.default.findOne({
      email
    });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already registered'
      });
    }
    const user = new _User.default({
      username,
      email,
      password
    });
    await user.save();
    const token = createToken(user._id);
    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      message: 'An error occurred while registering the user.'
    });
  }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: errors.array()
    });
  }
  try {
    const {
      email,
      password
    } = req.body;
    const user = await _User.default.findOne({
      email
    }).select('+password');
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    const token = createToken(user._id);
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: "production" === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email
      //  token,
    });
  } catch (error) {
    console.error('Error logging user:', error);
    return res.status(500).json({
      message: 'An error occurred while logging in.'
    });
  }
};
exports.loginUser = loginUser;
const logoutUser = (req, res) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: "production" === 'production',
      sameSite: 'strict'
    });
    return res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).json({
      message: 'An error occurred while logging out.'
    });
  }
};
exports.logoutUser = logoutUser;
const getUserProfile = async (req, res) => {
  try {
    const user = await _User.default.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching user profile.'
    });
  }
};
exports.getUserProfile = getUserProfile;

/***/ }),

/***/ 200:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.updateCustomer = exports.getLatestCustomers = exports.getCustomerRepairs = exports.getCustomerById = exports.getAllCustomers = exports.deleteCustomer = exports.createCustomer = void 0;
var _Customer = _interopRequireDefault(__webpack_require__(95));
var _Repair = _interopRequireDefault(__webpack_require__(446));
var _expressValidator = __webpack_require__(975);
const createCustomer = async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: errors.array()
    });
  }
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      address
    } = req.body;
    const existingCustomer = await _Customer.default.findOne({
      email
    });
    if (existingCustomer) {
      return res.status(409).json({
        message: 'Customer already registered'
      });
    }
    const customer = await _Customer.default.create({
      user: userId,
      name,
      email,
      phone,
      address
    });
    return res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({
      message: 'An error occurred while creating the customer.'
    });
  }
};
exports.createCustomer = createCustomer;
const getAllCustomers = async (req, res) => {
  try {
    const customers = await _Customer.default.find({
      user: req.user.id
    }).populate('user', ['name', 'email']);
    return res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching customers.'
    });
  }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (req, res) => {
  try {
    const customer = await _Customer.default.findById(req.params.id).populate('user', ['name', 'email']);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching the customer.'
    });
  }
};
exports.getCustomerById = getCustomerById;
const updateCustomer = async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: errors.array()
    });
  }
  try {
    const customer = await _Customer.default.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', ['name', 'email']);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({
      message: 'An error occurred while updating the customer.'
    });
  }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
  try {
    const customer = await _Customer.default.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }
    return res.status(200).json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      message: 'An error occurred while deleting the customer.'
    });
  }
};
exports.deleteCustomer = deleteCustomer;
const getLatestCustomers = async (req, res) => {
  try {
    const latestCustomers = await _Customer.default.find({
      user: req.user.id
    }).sort({
      createdAt: -1
    }).limit(5).populate('user', ['name', 'email']);
    if (!latestCustomers.length) {
      return res.status(404).json({
        message: 'No customers found'
      });
    }
    return res.status(200).json(latestCustomers);
  } catch (error) {
    console.error('Error fetching latest customers:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching the latest customers.'
    });
  }
};
exports.getLatestCustomers = getLatestCustomers;
const getCustomerRepairs = async (req, res) => {
  try {
    const repairs = await _Repair.default.find({
      customer: req.params.id
    });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching customer repairs'
    });
  }
};
exports.getCustomerRepairs = getCustomerRepairs;

/***/ }),

/***/ 999:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.updateRepair = exports.getRepairs = exports.getRepair = exports.getLatestRepairs = exports.deleteRepair = exports.createRepair = void 0;
var _Repair = _interopRequireDefault(__webpack_require__(446));
var _Customer = _interopRequireDefault(__webpack_require__(95));
var _mongoose = _interopRequireDefault(__webpack_require__(37));
const createRepair = async (req, res) => {
  try {
    const {
      deviceType,
      brand,
      model,
      problemDescription,
      estimatedCost,
      repairNotes,
      completionDate,
      customerId
    } = req.body;
    const customer = await _Customer.default.findOne({
      _id: customerId,
      user: req.user.id
    });
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found or does not belong to the current user'
      });
    }
    const newRepair = await _Repair.default.create({
      customer: customer._id,
      deviceType,
      brand,
      model,
      problemDescription,
      estimatedCost,
      repairNotes,
      completionDate
    });
    res.status(201).json(newRepair);
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({
      message: 'Failed to create repair',
      details: error.message
    });
  }
};
exports.createRepair = createRepair;
const getRepairs = async (req, res) => {
  try {
    const customers = await _Customer.default.find({
      user: req.user.id
    }).select('_id');
    const customerIds = customers.map(customer => customer._id);
    const repairs = await _Repair.default.find({
      customer: {
        $in: customerIds
      }
    }).populate('customer', 'name email');
    if (repairs.length === 0) {
      return res.status(404).json({
        message: 'No repairs found for the user'
      });
    }
    return res.status(200).json(repairs);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    return res.status(500).json({
      message: 'Failed to retrieve repairs',
      details: error.message
    });
  }
};
exports.getRepairs = getRepairs;
const getRepair = async (req, res) => {
  try {
    const repair = await _Repair.default.findById(req.params.id).populate('customer', 'name email');
    if (!repair) {
      return res.status(404).json({
        message: 'Repair not found'
      });
    }
    return res.status(200).json(repair);
  } catch (error) {
    console.error('Error fetching repair:', error);
    return res.status(500).json({
      message: 'Failed to retrieve repair'
    });
  }
};
exports.getRepair = getRepair;
const updateRepair = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    if (!_mongoose.default.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid repair ID'
      });
    }
    const updateFields = {
      deviceType: req.body.deviceType,
      brand: req.body.brand,
      model: req.body.model,
      problemDescription: req.body.problemDescription,
      estimatedCost: req.body.estimatedCost,
      status: req.body.status,
      repairNotes: req.body.repairNotes,
      completionDate: req.body.completionDate
    };
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
    const updatedRepair = await _Repair.default.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    });
    if (!updatedRepair) {
      return res.status(404).json({
        message: 'Repair record not found'
      });
    }
    res.status(200).json({
      message: 'Repair record updated successfully',
      repair: updatedRepair
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid update data',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      message: 'Error updating repair record',
      error: error.message
    });
  }
};
exports.updateRepair = updateRepair;
const getLatestRepairs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const latestRepairs = await _Repair.default.find().sort({
      createdAt: -1
    }).limit(limit).populate({
      path: 'customer',
      select: 'name email phone'
    });
    if (!latestRepairs.length) {
      return res.status(404).json({
        message: 'No repairs found'
      });
    }
    return res.status(200).json(latestRepairs);
  } catch (error) {
    console.error('Error fetching latest repairs:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching the latest repairs.'
    });
  }
};
exports.getLatestRepairs = getLatestRepairs;
const deleteRepair = async (req, res) => {
  try {
    const repair = await _Repair.default.findByIdAndDelete(req.params.id);
    if (!repair) {
      return res.status(404).json({
        message: 'Repair not found'
      });
    }
    res.status(200).json({
      message: 'Repair deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({
      message: 'An error occurred while deleting the repair.'
    });
  }
};
exports.deleteRepair = deleteRepair;

/***/ }),

/***/ 699:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.getStats = void 0;
var _Customer = _interopRequireDefault(__webpack_require__(95));
var _Repair = _interopRequireDefault(__webpack_require__(446));
var _mongoose = _interopRequireDefault(__webpack_require__(37));
const getStats = async (req, res) => {
  try {
    const totalCustomers = await _Customer.default.countDocuments({
      user: req.user.id
    });
    const totalRepairs = await _Repair.default.countDocuments({
      customer: {
        $in: await _Customer.default.find({
          user: req.user.id
        }).distinct('_id')
      }
    });
    const totalIncome = await _Repair.default.aggregate([{
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerDetails'
      }
    }, {
      $unwind: '$customerDetails'
    }, {
      $match: {
        'customerDetails.user': new _mongoose.default.Types.ObjectId(req.user.id)
      }
    }, {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: '$estimatedCost'
        }
      }
    }]);
    const repairStatusBreakdown = await _Repair.default.aggregate([{
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerDetails'
      }
    }, {
      $unwind: '$customerDetails'
    }, {
      $match: {
        'customerDetails.user': new _mongoose.default.Types.ObjectId(req.user.id)
      }
    }, {
      $group: {
        _id: '$status',
        count: {
          $sum: 1
        }
      }
    }]);
    const repairDeviceTypeBreakdown = await _Repair.default.aggregate([{
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerDetails'
      }
    }, {
      $unwind: '$customerDetails'
    }, {
      $match: {
        'customerDetails.user': new _mongoose.default.Types.ObjectId(req.user.id)
      }
    }, {
      $group: {
        _id: '$deviceType',
        count: {
          $sum: 1
        }
      }
    }]);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCustomers = await _Customer.default.countDocuments({
      user: req.user.id,
      createdAt: {
        $gte: thirtyDaysAgo
      }
    });
    const recentRepairs = await _Repair.default.countDocuments({
      customer: {
        $in: await _Customer.default.find({
          user: req.user.id
        }).distinct('_id')
      },
      createdAt: {
        $gte: thirtyDaysAgo
      }
    });
    return res.status(200).json({
      totalCustomers,
      totalRepairs,
      totalIncome: totalIncome[0]?.totalRevenue || 0,
      repairStatusBreakdown: repairStatusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      repairDeviceTypeBreakdown: repairDeviceTypeBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity: {
        newCustomers: recentCustomers,
        newRepairs: recentRepairs
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({
      message: 'An error occurred while fetching statistics.'
    });
  }
};
exports.getStats = getStats;

/***/ }),

/***/ 402:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.apiStatus = void 0;
var _mongoose = _interopRequireDefault(__webpack_require__(37));
const apiStatus = async (req, res) => {
  try {
    let databaseStatus = 'disconnected';
    try {
      await _mongoose.default.connection.db.admin().ping();
      databaseStatus = 'connected';
    } catch (dbError) {
      databaseStatus = 'connection error';
    }
    const status = {
      service: 'Repair Management API',
      version: '1.0.0',
      status: 'healthy',
      currentTime: new Date().toISOString(),
      uptime: process.uptime(),
      environment: "production" || 0,
      endpoints: ['/api/repairs', '/api/customers', '/api/auth'],
      systemInfo: {
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        }
      },
      dependencies: {
        nodejs: process.version,
        npm: process.env.npm_package_version || 'N/A'
      },
      database: {
        status: databaseStatus,
        connectionTime: new Date().toISOString()
      }
    };
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      service: 'Repair Management API',
      status: 'error',
      message: 'Unable to retrieve system status'
    });
  }
};
exports.apiStatus = apiStatus;

/***/ }),

/***/ 189:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.protect = void 0;
var _jsonwebtoken = _interopRequireDefault(__webpack_require__(829));
var _User = _interopRequireDefault(__webpack_require__(696));
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

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required'
      });
    }
    const decoded = _jsonwebtoken.default.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }
    const user = await _User.default.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof _jsonwebtoken.default.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};
exports.protect = protect;

/***/ }),

/***/ 781:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred'
  });
};
var _default = exports["default"] = errorHandlerMiddleware;

/***/ }),

/***/ 95:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.customerSchema = void 0;
var _mongoose = _interopRequireDefault(__webpack_require__(37));
const customerSchema = exports.customerSchema = new _mongoose.default.Schema({
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  lastServiceDate: {
    type: Date,
    default: Date.now
  }
});
var _default = exports["default"] = _mongoose.default.model('Customer', customerSchema);

/***/ }),

/***/ 446:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(__webpack_require__(37));
const repairSchema = new _mongoose.default.Schema({
  customer: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  deviceType: {
    type: String,
    required: true,
    enum: ['smartphone', 'laptop', 'tablet', 'desktop', 'smartwatch', 'other']
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  problemDescription: {
    type: String,
    required: true
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  repairNotes: String,
  completionDate: Date
}, {
  timestamps: true
});
var _default = exports["default"] = _mongoose.default.model('Repair', repairSchema);

/***/ }),

/***/ 696:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _mongoose = _interopRequireDefault(__webpack_require__(37));
var _bcryptjs = _interopRequireDefault(__webpack_require__(729));
const userSchema = new _mongoose.default.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await _bcryptjs.default.genSalt(10);
  this.password = await _bcryptjs.default.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await _bcryptjs.default.compare(enteredPassword, this.password);
};
const User = _mongoose.default.model('User', userSchema);
var _default = exports["default"] = User;

/***/ }),

/***/ 905:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _express = _interopRequireDefault(__webpack_require__(252));
var _authController = __webpack_require__(938);
var _authMiddleware = __webpack_require__(189);
const router = _express.default.Router();
router.post('/register', _authController.registerUser);
router.post('/login', _authController.loginUser);
router.post('/logout', _authController.logoutUser);
router.get('/me', _authMiddleware.protect, _authController.getUserProfile);
var _default = exports["default"] = router;

/***/ }),

/***/ 307:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _express = _interopRequireDefault(__webpack_require__(252));
var _customerController = __webpack_require__(200);
var _authMiddleware = __webpack_require__(189);
const router = _express.default.Router();
router.post('/create-customer', _authMiddleware.protect, _customerController.createCustomer);
router.put('/update-customer/:id', _authMiddleware.protect, _customerController.updateCustomer);
router.delete('/delete-customer/:id', _authMiddleware.protect, _customerController.deleteCustomer);
router.get('/get-customer/:id', _authMiddleware.protect, _customerController.getCustomerById);
router.get('/get-customers', _authMiddleware.protect, _customerController.getAllCustomers);
router.get('/get-customers-repairs/:id', _authMiddleware.protect, _customerController.getCustomerRepairs);
var _default = exports["default"] = router;

/***/ }),

/***/ 356:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _express = _interopRequireDefault(__webpack_require__(252));
var _repairController = __webpack_require__(999);
var _authMiddleware = __webpack_require__(189);
const router = _express.default.Router();
router.post('/create-repair', _authMiddleware.protect, _repairController.createRepair);
router.get('/get-repairs', _authMiddleware.protect, _repairController.getRepairs);
router.get('/get-repair/:id', _authMiddleware.protect, _repairController.getRepair);
router.put('/update-repair/:id', _authMiddleware.protect, _repairController.updateRepair);
router.delete('/delete-repair/:id', _authMiddleware.protect, _repairController.deleteRepair);
var _default = exports["default"] = router;

/***/ }),

/***/ 866:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _interopRequireDefault = __webpack_require__(751);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _express = _interopRequireDefault(__webpack_require__(252));
var _statsController = __webpack_require__(699);
var _authMiddleware = __webpack_require__(189);
const router = _express.default.Router();
router.get('/get-stats', _authMiddleware.protect, _statsController.getStats);
var _default = exports["default"] = router;

/***/ }),

/***/ 293:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
/**
 * Graceful shutdown utility for Node.js server
 * @param {http.Server} server - HTTP server instance
 * @param {Object} options - Shutdown options
 */
const gracefulShutdown = (server, options = {}) => {
  const {
    logger = console,
    timeout = 10000,
    database = {},
    callbacks = []
  } = options;
  const shutdown = async signal => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    try {
      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Disconnect from database if method provided
      if (typeof database.disconnect === 'function') {
        await database.disconnect();
        logger.info('Database disconnected');
      }

      // Run any additional cleanup callbacks
      for (const callback of callbacks) {
        await callback();
      }

      // Force close after timeout
      const forceClose = setTimeout(() => {
        logger.warn('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, timeout);

      // Clear timeout if successful
      clearTimeout(forceClose);
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
var _default = exports["default"] = gracefulShutdown;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};


var _interopRequireDefault = __webpack_require__(751);
var _express = _interopRequireDefault(__webpack_require__(252));
var _helmet = _interopRequireDefault(__webpack_require__(525));
var _cors = _interopRequireDefault(__webpack_require__(577));
var _cookieParser = _interopRequireDefault(__webpack_require__(898));
var _dotenv = _interopRequireDefault(__webpack_require__(818));
var _winston = _interopRequireDefault(__webpack_require__(124));
var _authRoutes = _interopRequireDefault(__webpack_require__(905));
var _customerRoutes = _interopRequireDefault(__webpack_require__(307));
var _repairRoutes = _interopRequireDefault(__webpack_require__(356));
var _statsRoutes = _interopRequireDefault(__webpack_require__(866));
var _errorHandlerMiddleware = _interopRequireDefault(__webpack_require__(781));
var _statusController = __webpack_require__(402);
var _database = _interopRequireDefault(__webpack_require__(586));
var _gracefulShutdown = _interopRequireDefault(__webpack_require__(293));
_dotenv.default.config();
const PORT = process.env.PORT || 3000;
const logger = _winston.default.createLogger({
  level: 'info',
  format: _winston.default.format.combine(_winston.default.format.timestamp(), _winston.default.format.errors({
    stack: true
  }), _winston.default.format.splat(), _winston.default.format.json()),
  transports: [new _winston.default.transports.Console({
    format: _winston.default.format.simple()
  }), ...( false ? 0 : [])]
});
const createApp = () => {
  const app = (0, _express.default)();
  app.use((0, _helmet.default)());
  app.disable('x-powered-by');
  const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL, process.env.RENDER_EXTERNAL_URL // Add this line
  ].filter(Boolean);
  app.use((0, _cors.default)({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
  app.use(_express.default.json({
    limit: '10kb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use(_express.default.urlencoded({
    extended: true,
    limit: '10kb'
  }));
  app.use((0, _cookieParser.default)(process.env.COOKIE_SECRET));

  // Routes
  app.get('/', _statusController.apiStatus);
  app.use('/api/repair/auth', _authRoutes.default);
  app.use('/api/repair/customer', _customerRoutes.default);
  app.use('/api/repair/repair', _repairRoutes.default);
  app.use('/api/repair/stats', _statsRoutes.default);
  app.use(_errorHandlerMiddleware.default);
  return app;
};
const startServer = async () => {
  try {
    await (0, _database.default)();
    logger.info('Database connected successfully');
    const app = createApp();
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    (0, _gracefulShutdown.default)(server, {
      logger,
      database: {
        disconnect: _database.default.disconnect
      }
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error
    });
    process.exit(1);
  }
};
startServer();
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception', {
    error
  });
  process.exit(1);
});
/******/ })()
;