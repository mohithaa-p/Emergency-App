const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/emergency', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  phoneNumber: String,
  email: String,
  password: String,
  city: String,
  state: String,
  medicalHistory: String,
  isPrivateCommunity: Boolean,
  isPublicCommunity: Boolean
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).send('User already exists');
  }

  const user = new User(req.body);
  await user.save();
  res.send('User signed up');
});

app.post('/saveMedicalDetails', async (req, res) => {
  const { email, city, state, medicalHistory, isPrivateCommunity, isPublicCommunity } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send('User not found');
  }

  user.city = city;
  user.state = state;
  user.medicalHistory = medicalHistory;
  user.isPrivateCommunity = isPrivateCommunity;
  user.isPublicCommunity = isPublicCommunity;
  
  await user.save();
  res.send('Medical details saved');
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(400).send('Invalid credentials');
  }

  res.send('User signed in');
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
