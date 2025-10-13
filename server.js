require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/logbook', require('./routes/logbook'));

app.get('/', (req, res) => res.send('<h1>InkedInLIFT API is running!</h1>'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
