require('dotenv').config();
const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI;

const db = mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = db;
