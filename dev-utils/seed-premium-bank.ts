import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

async function seedPremiumBank() {
  console.log("Seeding Premium Question Bank...");

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id')
    .eq('quiz_type', 'placement')
    .single();

  if (quizError || !quiz) {
    console.error("Placement quiz not found. Run seed-quiz.ts first.");
    return;
  }

  const qid = quiz.id;

  const premiumQuestions = [
    // --- DSA (10 Questions) ---
    { quiz_id: qid, category: 'dsa', correct_option_index: 2, time_limit_seconds: 30, question_text: "Which sorting algorithm is used by Python's built-in sort() (Timsort)?", options: ["Quick Sort", "Merge Sort", "Insertion Sort + Merge Sort", "Heap Sort"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 1, time_limit_seconds: 30, question_text: "What is the worst-case time complexity of inserting an element into a Binary Search Tree (not balanced)?", options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 3, time_limit_seconds: 30, question_text: "Which data structure is most optimal for implementing an LRU (Least Recently Used) cache?", options: ["Array + Hash Map", "Min Heap", "Binary Search Tree", "Doubly Linked List + Hash Map"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 0, time_limit_seconds: 30, question_text: "In a hash table using open addressing, what is 'Primary Clustering'?", options: ["When contiguous blocks of occupied slots build up, slowing down probes.", "When hash values all fall into the same bucket.", "When the table needs to be resized frequently.", "When linear probing is replaced by quadratic probing."] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 2, time_limit_seconds: 30, question_text: "What graph traversal algorithm is strictly used to find the shortest path in an unweighted graph?", options: ["Depth First Search (DFS)", "Dijkstra's Algorithm", "Breadth First Search (BFS)", "A* Search"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 1, time_limit_seconds: 30, question_text: "Which operation is O(n) in a standard Array but O(1) in a Linked List?", options: ["Accessing the i-th element", "Inserting at the head", "Finding the maximum element", "Appending to the tail"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 0, time_limit_seconds: 30, question_text: "What is the space complexity of a recursive Depth First Search on a balanced binary tree of N nodes?", options: ["O(log N)", "O(N)", "O(1)", "O(N log N)"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 3, time_limit_seconds: 30, question_text: "What algorithm is commonly used to find strongly connected components in a directed graph?", options: ["Prim's", "Kruskal's", "Bellman-Ford", "Tarjan's"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 1, time_limit_seconds: 30, question_text: "If you have a million integers and want to find the top 100, which is the most efficient structure?", options: ["Max Heap of size 1,000,000", "Min Heap of size 100", "Sorting the array", "Binary Search Tree"] },
    { quiz_id: qid, category: 'dsa', correct_option_index: 2, time_limit_seconds: 30, question_text: "What is the core algorithmic approach of dynamic programming?", options: ["Divide and conquer without memory", "Greedy choice property", "Overlapping subproblems + optimal substructure", "Randomized pivoting"] },

    // --- FRONTEND (10 Questions) ---
    { quiz_id: qid, category: 'frontend', correct_option_index: 1, time_limit_seconds: 30, question_text: "In React 18, what is the primary purpose of concurrent rendering?", options: ["To make React natively multi-threaded", "To allow React to interrupt a long-running render to handle high-priority events", "To render on the server and client simultaneously", "To replace Redux for state management"] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 0, time_limit_seconds: 30, question_text: "What is the exact output of console.log(typeof null) in JavaScript?", options: ["'object'", "'null'", "'undefined'", "Throws an error"] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 3, time_limit_seconds: 30, question_text: "Which CSS property allows an element to overlap others and control stacking context without position: absolute?", options: ["margin-top: -10px", "float: left", "display: grid", "z-index (if position is relative/fixed) or transform"] }, // Adjusted for generic truth, but let's be more specific:
    { quiz_id: qid, category: 'frontend', correct_option_index: 2, time_limit_seconds: 30, question_text: "In Next.js, what is the difference between getStaticProps and getServerSideProps?", options: ["getStaticProps runs on the client, getServerSideProps on the server.", "They are exactly the same, just different syntax.", "getStaticProps runs at build time, getServerSideProps runs on every request.", "getServerSideProps can only fetch from APIs, getStaticProps only from DB."] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 1, time_limit_seconds: 30, question_text: "What happens if you define a React component inside another React component?", options: ["It works perfectly and is a good pattern.", "It forces the child component to fully unmount and remount on every parent render.", "React throws a compilation error.", "It automatically memoizes the child component."] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 3, time_limit_seconds: 30, question_text: "What is the Event Loop in JavaScript?", options: ["A library that manages API requests.", "The mechanism Node uses to compile C++ bindings.", "A synchronous queue that blocks execution until empty.", "The mechanism that handles execution of multiple chunks of your program, managing the call stack and callback queue."] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 0, time_limit_seconds: 30, question_text: "Which Web API is used to observe changes to the DOM tree?", options: ["MutationObserver", "IntersectionObserver", "ResizeObserver", "DOMChangeListener"] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 2, time_limit_seconds: 30, question_text: "What does the 'use strict' directive do in JavaScript?", options: ["Makes the code run faster.", "Forces variables to be strictly typed.", "Eliminates some JavaScript silent errors by changing them to throw errors.", "Requires semicolons at the end of every line."] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 1, time_limit_seconds: 30, question_text: "In CSS, what does the :has() pseudo-class do?", options: ["Selects an element if it has a specific attribute.", "Selects a parent element if it contains a certain child element.", "Selects an element if it has focus.", "It is a deprecated selector for pseudo-elements."] },
    { quiz_id: qid, category: 'frontend', correct_option_index: 3, time_limit_seconds: 30, question_text: "What is hydration in Server-Side Rendering (SSR)?", options: ["Sending HTML over WebSockets.", "Converting CSS into inline styles.", "Prefetching data before the user clicks.", "Attaching React event listeners to the raw HTML sent from the server."] },

    // --- BACKEND (10 Questions) ---
    { quiz_id: qid, category: 'backend', correct_option_index: 1, time_limit_seconds: 30, question_text: "In a distributed system, what specific problem does the Raft consensus algorithm solve?", options: ["Load balancing traffic across regions.", "Electing a leader and safely replicating state across nodes.", "Encrypting data in transit.", "Caching database queries efficiently."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 2, time_limit_seconds: 30, question_text: "What is the primary difference between a Message Queue (like RabbitMQ) and an Event Stream (like Kafka)?", options: ["RabbitMQ is faster than Kafka.", "Kafka deletes messages immediately after reading, RabbitMQ stores them forever.", "RabbitMQ routes messages to specific consumers who consume and delete them; Kafka is an immutable append-only log.", "RabbitMQ only supports JSON, Kafka supports binary."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 0, time_limit_seconds: 30, question_text: "What is an N+1 query problem in ORMs?", options: ["Executing 1 query to fetch a list of N items, then executing N additional queries to fetch related data for each item.", "A database crashing when it hits N+1 concurrent connections.", "When a recursive CTE runs infinitely.", "Fetching N rows but the database returns N+1 rows due to ghost reads."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 3, time_limit_seconds: 30, question_text: "What is the purpose of a Reverse Proxy like Nginx?", options: ["To hide the client's IP from the internet.", "To compile server-side code into machine code.", "To connect to the database securely.", "To sit in front of web servers and forward client requests to them, handling load balancing and SSL."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 1, time_limit_seconds: 30, question_text: "In PostgreSQL, what is the difference between VARCHAR and TEXT?", options: ["TEXT has a strict 65535 character limit.", "Under the hood, they are exactly the same type; VARCHAR just adds an optional length constraint.", "VARCHAR is significantly faster for indexing.", "TEXT cannot be used in a WHERE clause."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 2, time_limit_seconds: 30, question_text: "What does the CAP theorem state?", options: ["A database must have Consistency, Availability, and Partitions.", "Consistency is always more important than Availability.", "A distributed data store can simultaneously provide at most two out of three: Consistency, Availability, and Partition Tolerance.", "Concurrency affects Performance."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 0, time_limit_seconds: 30, question_text: "Which HTTP status code signifies that the server understands the request but refuses to authorize it (often due to lack of permissions)?", options: ["403 Forbidden", "401 Unauthorized", "404 Not Found", "500 Internal Server Error"] },
    { quiz_id: qid, category: 'backend', correct_option_index: 1, time_limit_seconds: 30, question_text: "What is a JWT (JSON Web Token)?", options: ["A stateful session stored in the database.", "A stateless, cryptographically signed token containing claims.", "A hashed password string.", "An encrypted tunnel protocol for WebSockets."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 3, time_limit_seconds: 30, question_text: "In Docker, what is the difference between an Image and a Container?", options: ["They are synonymous.", "An image runs on Linux, a container runs on Windows.", "An image is the running process, the container is the file.", "An image is the read-only blueprint, a container is a runnable instance of an image."] },
    { quiz_id: qid, category: 'backend', correct_option_index: 2, time_limit_seconds: 30, question_text: "What is a Deadlock in a database transaction?", options: ["When the database runs out of memory.", "When a query takes too long to execute and times out.", "When two transactions hold locks that the other needs, causing both to wait indefinitely.", "When a transaction is committed but the disk fails to write it."] }
  ];

  const { error: qError } = await supabase
    .from('quiz_questions')
    .insert(premiumQuestions);

  if (qError) {
    console.error("Failed to insert premium questions:", qError);
  } else {
    console.log(`Successfully injected ${premiumQuestions.length} premium targeted questions!`);
  }
}

seedPremiumBank();
