import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Route test pour vérifier que tout fonctionne
app.get("/", (req, res) => {
  res.send("Backend is running! 🚀");
});

export default app;
