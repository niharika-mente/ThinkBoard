import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dns from "dns";

import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"])
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors(
    {
        origin: "http://localhost:5173"
    }
));
//middleware to parse JSON body
app.use(express.json());

app.use(rateLimiter);


// app.use((req,res,next)=>{
//     console.log(`Req method is ${req.method} and Req url is ${req.url}`);
//     next();
// })

app.use("/api/notes", notesRoutes);

connectDB().then(()=>{
    app.listen(PORT, () => {
    console.log("Server started on port:",PORT);
});
})

