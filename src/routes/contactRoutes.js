// src/routes/contactRoutes.js
import express from "express";
const router = express.Router();

// rutas de ejemplo
router.get("/", (req, res) => {
    res.send("Lista de contactos");
});

router.post("/", (req, res) => {
    res.send("Crear contacto");
});

export default router;