const mongoose = require("mongoose");

const CryptoSchema = new mongoose.Schema({
   name: {
      type: String,
      trim: true,
   },
   amount: {
      type: Number,
   },
   owner: {
      type: mongoose.Schema.ObjectId, ref: "User"
   }
});

module.exports = mongoose.model("Crypto", CryptoSchema);
