import express from "express";
import router from "./routes/inicio.js";
import { conectarDB } from "./Data/database.js";

const app = express();
app.use(express.json());

app.use("/api", router);

conectarDB();

app.listen(3000, () => {
  console.log("🚀 API del Colegio de Profecionales en psicologia corriendo en http://localhost:3000");
});