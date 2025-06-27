const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/booknest")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String
}));

const bcrypt = require("bcrypt");

app.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).send("User already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, username, email, password: hashedPassword });
  await newUser.save();
  res.status(201).send("User registered successfully.");
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).send("Invalid credentials.");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send("Invalid credentials.");

  res.json({
    name: user.name,
    username: user.username,
    email: user.email
  });
});


//book review system
const reviewSchema = new mongoose.Schema({
  bookTitle: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Save a new review
app.post('/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ message: 'Review saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch reviews for a book
app.get('/reviews/:bookTitle', async (req, res) => {
  try {
    const reviews = await Review.find({ bookTitle: req.params.bookTitle });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//books request
// Book request schema and route
const bookRequestSchema = new mongoose.Schema({
  title: String,
  author: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const BookRequest = mongoose.model("BookRequest", bookRequestSchema);

app.post("/api/request-book", async (req, res) => {
  try {
    const newRequest = new BookRequest(req.body);
    await newRequest.save();
    res.status(201).json({ message: "Request saved" });
  } catch (err) {
    console.error("❌ Error saving book request:", err);
    res.status(500).json({ error: err.message });
  }
});
 
//user dashboard
// Route: Get all book requests
app.get("/api/all-requests", async (req, res) => {
  try {
    const requests = await BookRequest.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: Get all book reviews
app.get("/api/all-reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//contact

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const ContactMessage = mongoose.model("ContactMessage", contactSchema);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).send("All fields are required.");
    }

    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: "Message received" });
  } catch (err) {
    console.error("❌ Contact message error:", err);
    res.status(500).json({ error: err.message });
  }
});
