// Dictionary progress routes
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get user's dictionary progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('dictionary_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Convert to object map for easier frontend use
    const progressMap = {};
    data.forEach(entry => {
      progressMap[entry.entry_id] = {
        seen: entry.seen,
        mastered: entry.mastered,
        firstSeenAt: entry.first_seen_at,
        masteredAt: entry.mastered_at,
      };
    });

    res.json({ success: true, progress: progressMap });
  } catch (error) {
    console.error('Error fetching dictionary progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark an entry as seen
router.post('/mark-seen', async (req, res) => {
  try {
    const { userId, entryId } = req.body;

    if (!userId || !entryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and entryId are required' 
      });
    }

    // Upsert: if exists, update; if not, insert
    const { data, error } = await supabase
      .from('dictionary_progress')
      .upsert({
        user_id: userId,
        entry_id: entryId,
        seen: true,
      }, {
        onConflict: 'user_id,entry_id'
      })
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error marking entry as seen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark an entry as mastered
router.post('/mark-mastered', async (req, res) => {
  try {
    const { userId, entryId } = req.body;

    if (!userId || !entryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and entryId are required' 
      });
    }

    const { data, error } = await supabase
      .from('dictionary_progress')
      .upsert({
        user_id: userId,
        entry_id: entryId,
        seen: true,
        mastered: true,
      }, {
        onConflict: 'user_id,entry_id'
      })
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error marking entry as mastered:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get aggregated topic progress
router.get('/topic-progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('dictionary_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, entries: data });
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
