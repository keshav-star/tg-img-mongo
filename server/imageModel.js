const mongoose = require("mongoose");

// User/Admin schema
const userSchema = new mongoose.Schema(
  {
    file_id: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AnimeSchema = new mongoose.Schema({
  name: String,
  tags: [String],
  urls: [String],
});

// Cloudinary schema
const cloudinarySchema = new mongoose.Schema({
  name: String,
  tags: [String],
  urls: [String],
});

// Models
const ImageModel = mongoose.model("admins", userSchema);
const CloudinaryModel = mongoose.model("Cloudinary", cloudinarySchema);
const AnimeModel = mongoose.model("Animes", AnimeSchema);

module.exports = {
  ImageModel,
  CloudinaryModel,
  AnimeModel,
};
