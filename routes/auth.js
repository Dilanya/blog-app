const router = require("express").Router();
const User = require("../models/userSchema");
require('dotenv').config(); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY;
const { body, validationResult } = require('express-validator');


const Post = require("../models/blogSchema");



// USER REGISTER

router.post("/register", 
  [
    body('username')
      .notEmpty().withMessage('Username is required')
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
          return Promise.reject('Username is already in use');
        }
      }),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8, max: 12 }).withMessage('Password must be between 8 and 12 characters'),
  
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      password: hashedPass,
    });

    const user = await newUser.save();

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json(err);
  }
});


//USER LOGIN

router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      !user && res.status(400).json("Invalid Username or Password");
  
      const validated = await bcrypt.compare(req.body.password, user.password);
      !validated && res.status(400).json("Invalid Username or Password");
  
      const token = jwt.sign({ userId: user._id },secretKey);
  
      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, token });
    } catch (err) {
      res.status(500).json(err);
    }
  });



module.exports = router;
