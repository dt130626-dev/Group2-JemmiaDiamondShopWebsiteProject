import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('❌ uncaughtException:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ unhandledRejection:', err.message);
});

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});