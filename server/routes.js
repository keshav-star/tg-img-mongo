// routes
const express = require("express");
const {
  getAllFolders,
  getAllCategories,
  uploadImages,
  mongoFetch,
} = require("./botScript");
const multer = require("multer");

const router = express.Router();

// Multer memory storage for in-memory file buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🟢 Root Route
router.get("/", async (req, res) => {
  res.send({ success: true, message: "Welcome Admin" });
});

router.get("/all-folders", getAllFolders);
router.get("/all-documents/:schemaName", getAllCategories);
router.get("/mongo-fetch", mongoFetch);
router.post("/upload-image", upload.array("image", 40), uploadImages);

module.exports = router;
