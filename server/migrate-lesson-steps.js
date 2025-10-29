// Script to migrate lesson steps from code files to Supabase
require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function migrateLessonSteps() {
  console.log('Environment variables:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    console.error('Current working directory:', process.cwd());
    console.error('Files in current directory:', require('fs').readdirSync('.'));
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get all lessons from Supabase
    const { data: lessons, error: lessonsError } = await supabase
      .from('Lesson')
      .select('id, code')
      .order('code');
    
    if (lessonsError) throw lessonsError;
    
    console.log(`Found ${lessons.length} lessons in Supabase`);
    
    for (const lesson of lessons) {
      try {
        // Try to load lesson steps from code file
        const lessonFilePath = path.join(__dirname, '..', 'invixe-app', 'src', 'modules', 'lessons', `step2`, `lesson${lesson.code}.ts`);
        
        if (fs.existsSync(lessonFilePath)) {
          console.log(`Loading lesson steps for lesson ${lesson.code}...`);
          
          // Read and evaluate the TypeScript file
          const fileContent = fs.readFileSync(lessonFilePath, 'utf8');
          
          // Extract the lesson steps array using regex
          const match = fileContent.match(/export const lesson\d+Steps: LessonStep\[\] = (\[[\s\S]*?\]);/);
          if (match) {
            // Convert TypeScript to JavaScript and evaluate
            const jsContent = match[1]
              .replace(/id: "([^"]+)"/g, 'id: "$1"')
              .replace(/text: "([^"]+)"/g, 'text: "$1"')
              .replace(/nextStepId: "([^"]+)"/g, 'nextStepId: "$1"')
              .replace(/message: "([^"]+)"/g, 'message: "$1"')
              .replace(/backgroundImage: "([^"]+)"/g, 'backgroundImage: "$1"')
              .replace(/choices: \[([\s\S]*?)\]/g, (match, choices) => {
                return `choices: [${choices}]`;
              });
            
            try {
              const steps = eval(`(${jsContent})`);
              
              // Upsert lesson steps to Supabase
              const { error: stepsError } = await supabase
                .from('LessonStepsV2')
                .upsert({
                  lessonid: lesson.id,
                  steps: steps
                }, { onConflict: 'lessonid' });
              
              if (stepsError) {
                console.error(`Error saving steps for lesson ${lesson.code}:`, stepsError);
              } else {
                console.log(`✅ Successfully migrated lesson ${lesson.code} with ${steps.length} steps`);
              }
            } catch (evalError) {
              console.error(`Error parsing lesson ${lesson.code}:`, evalError.message);
            }
          } else {
            console.log(`⚠️  Could not find lesson steps array in ${lessonFilePath}`);
          }
        } else {
          console.log(`⚠️  Lesson file not found: ${lessonFilePath}`);
        }
      } catch (error) {
        console.error(`Error processing lesson ${lesson.code}:`, error.message);
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateLessonSteps();
