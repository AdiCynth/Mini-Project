const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "🍽️",
  },
});

module.exports = mongoose.model("Category", CategorySchema);
