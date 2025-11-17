import express from "express";
import Psicologos from "../Services/Tarjetas.service.js";

const router = express.Router();

router.use("/Tarjetas", Psicologos);

export default router;