const mongoose = require("mongoose");
const { CloudinaryModel, AnimeModel } = require("./imageModel");
const {
  sendImagesToTelegram,
  uploadImagesToCloudinary,
  getTelegramChannel,
  uploadUrlsToDb,
} = require("./helper");


// 🟢 Get all existing model names (folders)
const getAllFolders = async (req, res) => {
  try {
    const modelNames = mongoose.connection.modelNames();
    res.json(modelNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Get all documents inside a specific schema
const getAllCategories = async (req, res) => {
  try {
    const documents = await AnimeModel.find({});
    const waifus = documents.map((doc) => doc.name);
    res.json({ success: true, waifus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Fetch all MongoDB documents from all models
const mongoFetch = async (req, res) => {
  try {
    const modelNames = mongoose.modelNames();
    const allDocuments = {};

    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      allDocuments[modelName] = await Model.find({});
    }

    res.json(allDocuments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Upload Images
const uploadImages = async (req, res) => {
  try {
    const { caption, category, tags, channelName } = req.body;

    const channel = getTelegramChannel(channelName);

    // 1️⃣ Send to Telegram
    const photoIds = await sendImagesToTelegram(channel, caption, req.files);

    // 3️⃣ Upload to Cloudinary (under anime/<category>)
    const urls = await uploadImagesToCloudinary(req.files, category);

    console.log("uploading to anime model");
    await uploadUrlsToDb(photoIds, category, tags, AnimeModel);
    console.log("uploading to cloudinary model");
    await uploadUrlsToDb(urls, category, tags, CloudinaryModel);

    res.json({ success: true, message: "Uploaded Successfully" });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.json({ success: false, message: "Damn You Server" });
  }
};

module.exports = {
  getAllFolders,
  getAllCategories,
  mongoFetch,
  uploadImages,
};