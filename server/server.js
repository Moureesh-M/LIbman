require("dotenv").config();

const app = require("./src/app");
const connectMongo = require("./src/config/mongo");
const connectSqlite = require("./src/config/sqlite");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectMongo();
    connectSqlite();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
