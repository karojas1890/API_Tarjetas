import express from "express";
import { validarTarjeta } from "../Libraries/Tarjetas.library.js";

const router = express.Router();

// POST /api/tarjetas/validar
router.post("/validar", async (req, res) => {
  try {
    const resultado = await validarTarjeta(req.body);

    if (!resultado.valido) {
      return res.status(400).json(resultado);
    }

    return res.json(resultado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
});

export default router;

