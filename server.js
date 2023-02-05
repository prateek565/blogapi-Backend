const express = require('express');
const bodyParser = require('body-parser');
var bcrypt = require("bcryptjs");
require('./server/models/database');

const Post = require('./server/models/posts') ;
const User = require('./server/models/user') ;
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());



app.post('/api/register', (req, res) => {
  
  User.findOne({ username: req.body.username }, (err, user) => {
    if (user) {
      return res.status(401).send({ message: 'username already exists' });
    }})
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    token: bcrypt.hashSync(req.body.token, 8)
  });

  user.save(function(err,result){
    if (err){
        console.log(err);
    }
    else{
        console.log(result);res.send("successs");
    }
})
});

// Route for user login
app.post('/api/login', (req, res) => {
User.findOne({
    username: req.body.username
})
  .then(user => {
      console.log(user);
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.token, user.token);


    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    var token = jwt.sign({ username: user.username }, "mysecret", {
      expiresIn: 86400
    });

    // Put token in cookie
    res.cookie('token', token, {expire: new Date() + 9999});
      

  res.status(200).send({
        username: user.username,
        email: user.email,
        accessToken: token,
        message: "Login Successful!"
      });
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
});
// Middleware function to verify JWT
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  // console.log( bearerHeader);

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "mysecret", (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Token verification failed1' });
      }

      req.user = decoded.user;
      next();
    });
  } else {
    return res.status(401).send({ message: 'Token not provided' });
  }
};

// route for getting all  post of a user
app.get('/api/post', verifyToken, (req, res) => {

  const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, "mysecret", (err, authData) => {
      if (err) {
        return res.status(403).send({ message: 'Forbidden' });
      }
    
    Post.find({ createdBy: authData.username },function (err, docs) {
      if (err){
          console.log(err);
      }
      else{
          console.log("Result : ", docs);
          return res.status(200).send(docs);
      }
    });
    });
  
  });
// / Route for creating a new blog post
app.post('/api/createpost', verifyToken, (req, res) => {

  const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, "mysecret", (err, authData) => {
      if (err) {
        return res.status(403).send({ message: 'Forbidden' });
      }
  
      const post = new Post({
        title: req.body.title,
        description: req.body.description,
        createdBy:authData.username,
        cratedOn:new Date()
      });
  
       post.save((error) => {
        if (error) {
          return res.status(400).send({ message: 'Error saving post' });
        }
        
      });
     Post.findOne( {title: req.body.title,description: req.body.description, createdBy:authData.username},(error, post) => {
     let postid=post._id;
     
      res.status(200).send({ message: 'Post created successfully', postid });
    });
      
    });
  });
  
  // Route for updating an existing blog post
app.put('/api/post/:id', verifyToken, (req, res) => {
 const id=req.params['id'];
 console.log(id);
  const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, "mysecret", (err, authData) => {
      if (err) {
        return res.status(403).send({ message: 'Forbidden' });
      }
  // if(req.user.username === req.body.createdBy){
    Post.findByIdAndUpdate(id, { title:req.body.title ,description:req.body.description }, { new: true }, (error, post) => {
      if (error) {
        return res.status(400).send({ message: 'Error updating post' });
      }

      res.status(200).send({ message: 'Post updated successfully', authData });
    });
  // }
  // else {
  //   return res.status(400).send({ message: 'Not Autheticated' }); 
  // }

    });
  
  });

//   Route for deleting an existing blog post
app.delete('/api/post/:id', verifyToken, (req, res) => {
  const id2=req.params['id'];
  const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, "mysecret", (err, authData) => {
      if (err) {
        return res.status(403).send({ message: 'Forbidden' });
      }
      // if(req.user.username === req.body.createdBy){
        Post.findByIdAndDelete(id2, (error, post) => {
          if (error) {
            return res.status(400).send({ message: 'Error deleting post' });
          }
    
          res.status(200).send({ message: 'Post deleted successfully', authData });
        });
      // }
      // else{
      //   return res.status(400).send({ message: 'Not Autheticated' }); 
      // }
     
    });
  });

  module.exports= app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
