const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    file_id: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
        type: String,
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("admins", userSchema);
