const express = require('express');
const router = express.Router();
const User = require('./users/model/User.js')
const bcrypt = require("bcryptjs");
const expressJwt = require('express-jwt')
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

      res.cookie("jwt-access-token", jwtToken, {
        expires: new Date(Date.now() + 60000 * 15),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production" ? true : false,
      });

      res.cookie("jwt-refresh-token", jwtRefreshToken, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production" ? true : false,
      });

      res.json({ user: foundUser });
    } else {
      throw "Check your email and/or password.";
    }
  } catch (err) {
    res.status(500).json({
      message: err,
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
    } catch (err) {
      console.log(err)
      let message = Object.keys(err.keyValue)[0] === 'username' || Object.keys(err.keyValue)[0] === 'email' 
        ? `${Object.keys(err.keyValue)[0]} already exists` : 'password has to contain: min eight characters, one uppercase, one lowercase letter, one number and one special character'
      res.status(500).json({
        message
      });
    }
});

router.get('/user-info', expressJwt({
  secret: process.env.JWT_USER_SECRET_KEY,
  userProperty: 'auth',
}),async (req,res) => {
  let foundUser = await User.findById(req.auth._id).select("-__v -userCreated -password")
  res.status(200).json(foundUser)
})

router.get('/logout', (req,res) => {
  res.clearCookie('jwt-access-token')
  res.clearCookie('jwt-refresh-token')
  res.status(200).json('success-logout')
})


module.exports = router;
