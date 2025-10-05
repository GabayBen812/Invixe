const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/register', require('./routes/register'));
app.use('/api/login', require('./routes/login'));
app.use('/api/user', require('./routes/user'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/exportLesson', require('./routes/exportLesson'));
app.use('/api/lessons', require('./routes/lessons'));

// Health check routes
app.use('/api/health', require('./routes/health'));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 