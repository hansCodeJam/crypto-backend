const mongoose = require("mongoose");

const CryptoSchema = new mongoose.Schema({
   name: {
      type: String,
      trim: true,
   },
   amount: {
      type: Number,
   },
});

module.exports = mongoose.model("Crypto", CryptoSchema);
