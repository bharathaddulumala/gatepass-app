const mongoose = require('mongoose');

const GatePassSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  reason: { type: String, required: true },
  mentorStatus: { type: String, default: 'PENDING' }, // PENDING, APPROVED, REJECTED
  deanStatus: { type: String, default: 'PENDING' },
  overallStatus: { type: String, default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('GatePass', GatePassSchema);
