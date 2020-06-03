const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
   username: {
      type: String,
      trim: true,
      required: "Username is required",
      unique: "Username already exists",
   },
   email: {
      type: String,
      trim: true,
      required: "Email is required",
      unique: "Email already exists",
      match: [/.+\@..+/, "Please fill a valid email address"],
   },
   password: {
      type: String,
      required: "Password is required",
   },
   walletUSD:{
      type: Number,
      default: 10000,
   },
   crypto:[{
      type: mongoose.Schema.ObjectId,
      ref: 'Crypto'
   }]
});

module.exports = mongoose.model("User", UserSchema);
