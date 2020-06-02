var express = require('express');
var router = express.Router();

router.post('/login', (req, res, next) =>{
  console.log(req.body)
});

router.post('/register', (req, res, next) =>{
  console.log(req.body)
});

module.exports = router;
