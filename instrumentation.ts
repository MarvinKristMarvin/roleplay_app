import connectDB from "./lib/db";
// Executes function once on npm run dev or start
export function register() {
  connectDB();
}
