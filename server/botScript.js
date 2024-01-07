const express = require("express");
const multer = require("multer");
const router = express.Router();
const mongoose = require("mongoose");

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_ID, { polling: true });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// // Define the schema and model
// const DynamicSchema = new mongoose.Schema({
//   dynamicFields: {
//     type: Map,
//     of: [String], // Assuming the values are strings, adjust based on your actual data type
//     default: {},
//   },
//   // Your other static fields here
// });

// const DynamicModel = mongoose.model("DynamicModel", DynamicSchema);

const getOrCreateSchema = (dynamicString) => {
  const existingModels = mongoose.modelNames();

  if (existingModels.includes(dynamicString)) {
    return mongoose.model(dynamicString);
  }

  // Create a new schema
  const dynamicSchema = new mongoose.Schema({
    name: String,
    tags: [String],
    urls: [String],
  });

  return mongoose.model(dynamicString, dynamicSchema);
};

router.get("/", async (req, res) => {
  try {
    return res.send({
      success: true,
      message: "Welcome Admin",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
});

router.get("/all-folders", async (req, res) => {
  try {
    const modelNames = mongoose.connection.modelNames();
    res.send(modelNames);
  } catch (error) {
    console.log(error);
  }
});

router.get("/all-documents/:schemaName", async (req, res) => {
  try {
    const schemaName = req.params.schemaName;

    // console.log(schemaName)
    const Model = getOrCreateSchema(schemaName);
    const documents = await Model.find({});
    const waifus = documents.map((document) => document.name);
    res.json({ success: true, waifus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/send-image", upload.single("image"), async (req, res) => {
  try {
    const channel = process.env.CHANNEL_ID;

    const { fieldName, caption } = req.body;
    // Send the photo to the channel
    const sentPhoto = await bot.sendPhoto(channel, req.file.buffer, {
      caption: caption,
    });

    const photoid = sentPhoto.photo[sentPhoto.photo.length - 1].file_id;

    // Find the document with the given fieldName

    const existingDocument = await DynamicModel.findOne({});
    // console.log(existingDocument)

    if (existingDocument.dynamicFields.get(fieldName)) {
      // If the field already exists, push fileId to the array
      existingDocument.dynamicFields.get(fieldName).push(photoid);
    } else {
      // If the field doesn't exist, create a new one
      existingDocument.dynamicFields.set(fieldName, [photoid]);
    }

    // Save the document
    await existingDocument.save();

    // if (existingDocument) {
    //   // If the field already exists, push fileId to the array
    //   existingDocument[fieldName].push(photoid);
    // } else {
    //   // If the field doesn't exist, create a new one
    //   DynamicSchema.add({
    //     [fieldName]: [String], // Create an array with the first photoid
    //   });
    //   const newDocument = new DynamicModel({
    //     [fieldName]: [photoid],
    //   });
    //   await newDocument.save();
    // }
    return res.json({
      success: true,
      message: {
        botToken: process.env.BOT_ID,
        fileId: photoid,
      },
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
});

router.get("/mongo-fetch", async (req, res) => {
  try {
    const modelNames = mongoose.modelNames();
    const allDocuments = {};

    // Loop through each model
    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);

      // Fetch all documents for the current model
      const documents = await Model.find({});

      // Store the documents in the result object
      allDocuments[modelName] = documents;
    }

    res.send(allDocuments);
  } catch (error) {
    console.log(error);
  }
});

router.post("/upload-image", upload.array("image", 40), async (req, res) => {
  try {
    const channel = process.env.CHANNEL_ID;

    const { caption, category, folder, tags } = req.body;
    // Send the photo to the channel
    let photoid = [];
    for (const img of req.files) {
      try {
        const sentPhoto = await bot.sendPhoto(channel, img.buffer, {
          caption: caption,
        });

        photoid.push(sentPhoto.photo[sentPhoto.photo.length - 1].file_id);
      } catch (error) {
        console.error("Error sending photo:", error.message);
      }
    }

    const documentData = {
      name: category,
      tags: tags,
      urls: photoid,
    };


    const Model = getOrCreateSchema(folder);

    // Check if a document with the given name already exists
    const existingDocument = await Model.findOne({ name: documentData.name });

    if (existingDocument) {
      // Document with the given name already exists, update tags and urls
      existingDocument.tags.push(...documentData.tags);
      existingDocument.urls.push(...documentData.urls);
      await existingDocument.save();
      return existingDocument;
    }

    // Document with the given name doesn't exist, create a new one
    const newDocument = new Model(documentData);
    await newDocument.save();

    return res.json({
      success: true,
      message: "Uploaded SuccessFully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Damn You Server",
    });
  }
});

module.exports = router;
