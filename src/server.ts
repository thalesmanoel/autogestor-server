import "dotenv/config";
import express from "express";
import Database from "./config/Database";
import routes from "./routes";

const app = express();
app.use(express.json());

Database.connect();

const PORT = process.env.PORT || 3000;

app.use("/", routes); 

app.get("/", (_req, res) => {
  res.send("API rodando 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
