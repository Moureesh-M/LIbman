const express = require("express");
const cors = require("cors");
const bookRoutes = require("./routes/books");
const memberRoutes = require("./routes/members");
const borrowingRoutes = require("./routes/borrowings");
const borrowedRoutes = require("./routes/borrowed");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrowings", borrowingRoutes);
app.use("/api/borrowed", borrowedRoutes);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? "Internal server error" : error.message
  });
});

module.exports = app;
