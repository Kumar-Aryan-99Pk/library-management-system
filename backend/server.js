const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", bookRoutes);
app.get("/", (req, res) => {
  res.send("Library API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});