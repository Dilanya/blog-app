const router = require("express").Router();
const Post = require("../models/blogSchema");
const User = require("../models/userSchema");
const secretKey = process.env.JWT_SECRET_KEY;
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { body, validationResult } = require('express-validator');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey, 
};

passport.use(new JwtStrategy(options, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.userId);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));



// CREATE NEW BLOG
router.post('/', passport.authenticate('jwt', { session: false }),
  [
    body('title')
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 1600 }).withMessage('Title must be between 3 and 1600 characters'),
    body('body')
      .notEmpty().withMessage('Body is required')
      .isLength({ min: 200, max: 5000000 }).withMessage('Body must be between 200 and 5000000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        username: req.user.username, 
      });

      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch (err) {
      res.status(500).json(err);
    }
});


//UPDATE POST
router.put("/:id", passport.authenticate('jwt', { session: false }), 
  
  [
    body('title')
      .custom((value, { req }) => {
        if (req.body.title !== undefined) {
          return (
            typeof req.body.title === 'string' &&
            req.body.title.length >= 3 &&
            req.body.title.length <= 1600
          );
        }
        return true; 
      })
      .withMessage('Title must be between 3 and 1600 characters'),
    
    body('body')
      .custom((value, { req }) => {
        if (req.body.body !== undefined) {
          return (
            typeof req.body.body === 'string' &&
            req.body.body.length >= 200 &&
            req.body.body.length <= 5000000
          );
        }
        return true; 
      })
      .withMessage('Body must be between 200 and 5000000 characters'),
  ],
  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
      try{
          const post = await Post.findById(req.params.id);
          if (!post) {
            return res.status(404).json({ error: 'Post not found' });
          }
          if(post.username === req.user.username){
              try{   
                  const updatedPost = await Post.findByIdAndUpdate(
                      req.params.id,
                      {
                          $set:req.body,
                      },
                      {new: true}
                  );
                  res.status(200).json(updatedPost);
              }catch(err){
                  res.status(500).json(err);
              }
          }else{
              res.status(401).json("You can update only your post!");
          }
      }catch(err){
          res.status(500).json(err);
      }
});

//DELETE POST
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.username === req.user.username) {
      try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can delete only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//SEARCH POSTS

router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;

  try {
    const results = await Post.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: searchTerm,
            path: {
              wildcard: "*"
            }
          }
        }
      }
    ]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'No matches found' });
    }
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while searching' });
  }
});

//GET POST
router.get("/:id", async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
});


//GET ALL POSTS
router.get("/", async (req, res) => {
  const username = req.query.username;
  const sort = req.query.sort; 
  const page = req.query.page ;
  const limit = req.query.limit ;
  try {
    let posts;

    if (username) {
      posts = await Post.find({ username }).sort({ title: sort }).skip(page*limit).limit(limit);
    } else {
      posts = await Post.find().sort({ title: sort }).skip(page*limit).limit(limit);
    }
    
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});







   



module.exports = router;
