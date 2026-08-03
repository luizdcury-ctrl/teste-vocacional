require("dotenv").config();
const path = require("path");
const express = require("express");

const apiRouter = require("./routes/api");
const { router: adminRouter } = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", apiRouter);
app.use("/api/admin", adminRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Teste Vocacional rodando em http://localhost:${PORT}`);
});
