const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  contestId: Number,
  contestName: String,
  rank: Number,
  oldRating: Number,
  newRating: Number,
  ratingChange: Number,
  date: Date,
});

const submissionSchema = new mongoose.Schema({
  problemName: String,
  contestId: Number,
  index: String,
  rating: Number,
  verdict: String,
  language: String,
  tags: [String],
  time: Date,
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: {
    type: String,
    required: true,
  },
  cfHandle: { type: String, required: true, unique: true },

  // Codeforces Info
  rating: Number,
  maxRating: Number,
  rank: String,
  titlePhoto: String, 
  lastOnline :Date, 
  organization: String, 
  registeredAt: Date,
  friendOfCount: Number,

  // Contest and Submissions
  contests: [contestSchema],
  submissions: [submissionSchema],

  // Sync Metadata
  lastSyncedAt: Date,
  dataSyncFrequency: { type: String, default: 'daily' },
  emailRemindersDisabled: { type: Boolean, default: false },
  reminderCount: { type: Number, default: 0 },
  lastReminderSent: Date,
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Student', studentSchema);


