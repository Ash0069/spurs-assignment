import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

export default app;