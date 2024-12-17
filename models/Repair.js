import mongoose from 'mongoose'

const repairSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ['smartphone', 'laptop', 'tablet', 'desktop', 'smartwatch', 'other'],
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    problemDescription: { type: String, required: true },
    estimatedCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    repairNotes: String,
    completionDate: Date,
  },
  { timestamps: true }
)

export default mongoose.model('Repair', repairSchema)
