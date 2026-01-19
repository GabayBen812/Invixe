# Dictionary Unlock System

## Overview
The dictionary now has an unlock system where entries are locked/unlocked based on user progress through lessons. This ensures users only see content they've learned about.

## How It Works

### 1. **Entry Unlock Rules**
Each dictionary entry has an `unlockedByLesson` field:
- If `null`: Entry is unlocked by default (accessible to everyone)
- If a lesson ID (number): Entry is unlocked after completing that lesson

### 2. **Current Unlock Mapping**
```typescript
// Example from dictionary.ts
{
  id: 'hammer',
  term: 'פטיש',
  topicId: 'candles',
  unlockedByLesson: 2,  // Unlocked after completing lesson 2 (נרות פטיש)
}
```

**Current mappings:**
- **Lesson 2** (נרות פטיש): Unlocks `hammer`, `inverted-hammer`
- **Lesson 3**: Unlocks `doji`, `dragonfly-doji`, `gravestone-doji`, `regular-doji`
- **Lesson 4**: Unlocks `long-legged-doji`
- **Lesson 5**: Unlocks `bullish-engulfing`, `bearish-engulfing`
- **Lesson 6**: Unlocks `shooting-star`
- **Lesson 10**: Unlocks graph entries
- **Lesson 20**: Unlocks indicator entries

### 3. **Visual Indication**
Locked entries display:
- 🔒 Lock icon
- "נעול" (Locked) text
- Grayed out appearance
- Cannot be flipped to view explanation

### 4. **Database Storage (Supabase)**

#### Table: `dictionary_progress`
```sql
CREATE TABLE dictionary_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    entry_id VARCHAR(255) NOT NULL,
    seen BOOLEAN DEFAULT FALSE,
    mastered BOOLEAN DEFAULT FALSE,
    first_seen_at TIMESTAMP,
    mastered_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, entry_id)
);
```

#### API Endpoints (Backend)
- **GET** `/api/dictionary/progress/:userId` - Get all progress for a user
- **POST** `/api/dictionary/mark-seen` - Mark an entry as seen when flipped
- **POST** `/api/dictionary/mark-mastered` - Mark an entry as mastered
- **GET** `/api/dictionary/topic-progress/:userId` - Get topic-level progress

### 5. **Frontend Implementation**

#### Components Updated:
1. **`FlippableCard.tsx`**
   - Accepts `isLocked` prop
   - Renders lock icon when locked
   - Prevents flipping when locked

2. **`DictionaryDrawer.tsx`**
   - Uses `useUser()` to access `completedLessons`
   - Calls `isEntryUnlocked(entry, completedLessons)` for each entry
   - Passes `isLocked` prop to cards

3. **`dictionary.ts`**
   - Added `unlockedByLesson` field to entries
   - Added `isEntryUnlocked()` helper function

## How to Configure

### Adding New Entries
When adding a new dictionary entry, specify which lesson unlocks it:

```typescript
{
  id: 'my-new-term',
  term: 'מונח חדש',
  explanation: 'הסבר...',
  topicId: 'candles',
  imageComponent: MyComponent,
  unlockedByLesson: 7,  // Unlocked after lesson 7
}
```

### Making Entries Always Available
Set `unlockedByLesson: null` for entries that should be available to everyone:

```typescript
{
  id: 'basic-term',
  term: 'מונח בסיסי',
  explanation: 'הסבר...',
  topicId: 'basics',
  unlockedByLesson: null,  // Always unlocked
}
```

## Database Migration

To set up the database, run the migration:

```bash
# File: server/migrations/add_dictionary_progress.sql
psql -U your_user -d your_database -f add_dictionary_progress.sql
```

Or apply via Supabase dashboard SQL editor.

## Progress Tracking

When a user flips a card (views an explanation):
1. Frontend calls `onFlip(entry.id)`
2. Backend stores: `seen: true`, `first_seen_at: NOW()`
3. Progress is reflected in topic percentages

Future: Implement mastery system (e.g., after reviewing multiple times or passing a quiz).

## Future Enhancements

1. **Progressive Unlock**: Unlock entries as lessons are attempted (not just completed)
2. **Topic Locking**: Lock entire topics until a milestone is reached
3. **Badges**: Award badges for completing topic dictionaries
4. **Spaced Repetition**: Suggest reviewing mastered entries periodically
5. **Search Within Unlocked**: Only show unlocked entries in search results

## Testing

### Test Scenarios:
1. New user (no completed lessons) → Most entries should be locked
2. Complete lesson 2 → Hammer entries should unlock
3. Complete lesson 3 → Doji entries should unlock
4. Flip a card → Progress should be saved to database
5. Topic progress bar → Should update based on unlocked entries

### Manual Testing:
```javascript
// In React Native Debugger or browser console:
// Check completed lessons
console.log(completedLessons);

// Check which entries are unlocked
DICTIONARY_ENTRIES.forEach(entry => {
  console.log(entry.id, isEntryUnlocked(entry, completedLessons));
});
```

## Notes

- Unlock logic is **frontend-first**: The frontend determines what's locked based on `completedLessons`
- Backend stores progress but doesn't enforce locks
- Progress persists across devices (via Supabase)
- Lesson IDs should match your lesson registry exactly
