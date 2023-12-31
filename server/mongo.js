const mongoose = require("mongoose");

const connectionDB = async () => {
  try {
    const connectDB = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopoLogy: true,
    });
    console.log(`MongoDB connected ${connectDB.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectionDB;