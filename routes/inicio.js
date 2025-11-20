import express from "express";
import tarjetas from "../Services/Tarjetas.service.js";

const router = express.Router();

router.use("/Tarjetas", tarjetas);

export default router;