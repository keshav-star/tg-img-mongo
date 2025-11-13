const { Readable } = require("stream");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_ID, { polling: true });
const { v2: cloudinary } = require("cloudinary");

/************************************************************
 * Cloudinary Setup & Schema
 ************************************************************/
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// send images to telegram
async function sendImagesToTelegram(channel, caption, files) {
  const photoIds = [];

  for (const file of files) {
    try {
      const sentPhoto = await bot.sendPhoto(channel, file.buffer, { caption });
      const fileId = sentPhoto.photo[sentPhoto.photo.length - 1].file_id;
      photoIds.push(fileId);
    } catch (error) {
      console.error("❌ Error sending photo to Telegram:", error.message);
    }
  }

  return photoIds;
}

//  * Utility: Upload Images to Cloudinary (in folder: anime/category)
async function uploadImagesToCloudinary(files, category) {
  const urls = [];
  const folderPath = `anime/${category}`;

  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: folderPath },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from(file.buffer).pipe(stream);
    });

    urls.push(result.secure_url);
  }

  return urls;
}

async function uploadUrlsToDb(urls, category, tags, Model) {
  // 4️⃣ Save/Update in MongoDB
  // Convert tags to array if it's a string
  const tagsArray = Array.isArray(tags)
    ? tags
    : (tags || "").split(",").map((tag) => tag.trim()).filter((tag) => tag);

  const existingDoc = await Model.findOne({ name: category });
  if (existingDoc) {
    const uniqueTags = new Set([...existingDoc.tags, ...tagsArray]);
    existingDoc.tags = [...uniqueTags];
    existingDoc.urls.push(...urls);
    await existingDoc.save();
  } else {
    const newDoc = new Model({ name: category, tags: tagsArray, urls });
    await newDoc.save();
  }
  console.log("✅ Uploaded URLs to", Model.modelName);
}

function getTelegramChannel(channelName) {
  switch (channelName) {
    case "waifus":
      return process.env.WAIFUS;
    default:
      return process.env.CHANNEL_ID;
  }
}

module.exports = {
  sendImagesToTelegram,
  uploadImagesToCloudinary,
  uploadUrlsToDb,
  getTelegramChannel,
};
