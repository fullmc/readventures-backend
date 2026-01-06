import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./config/passport";


dotenv.config();

const app = express();

app.use(cors({
  // nice practice for CORS settings : it allows only specific origins
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://readventures-int.vercel.app', // Vercel domain for staging (preprod)
    /\.vercel\.app$/ // Allow all Vercel subdomains
  ],
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());


// Routes
import userRoutes from "./routes/user.routes";
app.use("/api/auth", userRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running! 🚀");
});

export default app;
