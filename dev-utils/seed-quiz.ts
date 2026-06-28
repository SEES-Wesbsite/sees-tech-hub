import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually so we don't need to install dotenv just for this script
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');

const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Placement Quiz...");

  // First, let's delete any existing placement quizzes to prevent duplicates
  await supabase.from('quizzes').delete().eq('quiz_type', 'placement');

  // 1. Create the Quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title: 'Global Placement Exam',
      quiz_type: 'placement',
      base_time_limit: 30
    })
    .select()
    .single();

  if (quizError || !quiz) {
    console.error("Failed to create quiz:", quizError);
    return;
  }

  console.log(`Created Quiz ID: ${quiz.id}`);

  // 2. Create Questions
  const questions = [
    {
      quiz_id: quiz.id,
      question_text: "What is the time complexity of searching for an element in a balanced Binary Search Tree?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      correct_option_index: 2,
      time_limit_seconds: 30
    },
    {
      quiz_id: quiz.id,
      question_text: "Which HTTP method is truly idempotent according to REST principles?",
      options: ["POST", "PUT", "PATCH", "CONNECT"],
      correct_option_index: 1,
      time_limit_seconds: 30
    },
    {
      quiz_id: quiz.id,
      question_text: "In React, what happens when you call setState with the same value that is currently in state?",
      options: ["The component re-renders", "React bails out and does not render", "It throws a warning", "The DOM is painted but not reconciled"],
      correct_option_index: 1,
      time_limit_seconds: 30
    },
    {
      quiz_id: quiz.id,
      question_text: "What does the 'A' stand for in ACID database transaction properties?",
      options: ["Availability", "Atomicity", "Asynchronous", "Automation"],
      correct_option_index: 1,
      time_limit_seconds: 30
    },
    {
      quiz_id: quiz.id,
      question_text: "Which of the following is NOT a valid hook in React?",
      options: ["useState", "useEffect", "useFetch", "useMemo"],
      correct_option_index: 2,
      time_limit_seconds: 30
    }
  ];

  const { error: qError } = await supabase
    .from('quiz_questions')
    .insert(questions);

  if (qError) {
    console.error("Failed to insert questions:", qError);
  } else {
    console.log(`Inserted ${questions.length} questions successfully!`);
    console.log("You can now test the Quiz Arena Onboarding flow.");
  }
}

seed();
