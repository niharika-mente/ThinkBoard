import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dns from "dns";

import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"])
const app = express();
const PORT = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // backend/src

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}
//middleware to parse JSON body
app.use(express.json());

app.use(rateLimiter);


// app.use((req,res,next)=>{
//     console.log(`Req method is ${req.method} and Req url is ${req.url}`);
//     next();
// })

app.use("/api/notes", notesRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}

connectDB().then(()=>{
    app.listen(PORT, () => {
    console.log("Server started on port:",PORT);
});
});

