// models/Memory.js
const mongoose = require('mongoose');

// Define the schema
const MemorySchema = new mongoose.Schema({
  title: String,
  description: String,
  photo: String, // S3 URL for the photo
  isfavorite: Boolean,
});

// Create the model
const Memory = mongoose.model('Memory', MemorySchema);

module.exports = Memory;