const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://prateek:prateek123@cluster0.zytdjxc.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true ,useUnifiedTopology: true });

mongoose.set('strictQuery', false);


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected')
});

// Models
require('./posts');
require('./user');