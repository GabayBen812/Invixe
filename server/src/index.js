const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase config (optional; routes may import their own client)
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
}
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;
app.set('supabase', supabase);
app.set('SUPABASE_ONLY', process.env.SUPABASE_ONLY === 'true');

// API Routes
app.use('/api/register', require('./routes/register'));
app.use('/api/login', require('./routes/login'));
app.use('/api/user', require('./routes/user'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/v2/lessons', require('./routes/v2.lessons'));

// Health check routes
app.use('/api/health', require('./routes/health'));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 