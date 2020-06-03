const express = require('express');
const router = express.Router();
const User = require('./users/model/User.js')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post('/login', async(req, res, next) =>{
  try {
    let foundUser = await User.findOne({
      email: req.body.email,
    }).select("-__v -userCreated");

    if (foundUser === null) {
      throw Error("User not found, please sign up.");
    }

    let comparedPassword = await bcrypt.compare(req.body.password, foundUser.password);

    if (comparedPassword) {
      foundUser = foundUser.toObject();
      delete foundUser.password;

      let jwtToken = jwt.sign(foundUser, process.env.JWT_USER_SECRET_KEY, {
        expiresIn: "15m",
      });
      
      let jwtRefreshToken = jwt.sign({_id: foundUser._id}, process.env.JWT_USER_REFRESH_SECRET_KEY, {
        expiresIn: "7d",
      });

      res.cookie("jwt-cookie-expense", jwtToken, {
        expires: new Date(Date.now() + 60000 * 15),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production" ? true : false,
      });

      res.cookie("jwt-cookie-refresh", jwtRefreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production" ? true : false,
      });

      res.json({ user: foundUser });
    } else {
      throw Error("Check your email and password.");
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: e,
    });
  }
});

router.post('/register', async (req, res) => {
    try {
      let createdUser = await new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
      });

      let genSalt = await bcrypt.genSalt(12);
      let hashedPassword = await bcrypt.hash(createdUser.password, genSalt);

      createdUser.password = hashedPassword;

      const user = await createdUser.save();

      res.json({
        message: 'User created'
      });
    } catch (e) {
      console.log(e)
      res.status(500).json({
        message: e,
      });
    }
});

module.exports = router;
