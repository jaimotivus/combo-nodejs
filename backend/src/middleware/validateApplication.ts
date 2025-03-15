import { RequestHandler } from "express";

export const validateApplication: RequestHandler = (req, res, next) => {
  const { id, name, domains } = req.body;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "El campo 'id' es requerido y debe ser un string" });
    return;
  }

  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "El campo 'name' es requerido y debe ser un string" });
    return;
  }

  if (!Array.isArray(domains) || domains.some((d) => typeof d !== "string")) {
    res.status(400).json({ error: "El campo 'domains' debe ser un array de strings" });
    return;
  }

  next();
};
