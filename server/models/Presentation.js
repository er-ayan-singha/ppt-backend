const mongoose = require('mongoose');

const presentationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  slides: [{ type: String }], // array of image URLs (one per slide)
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Presentation', presentationSchema);
