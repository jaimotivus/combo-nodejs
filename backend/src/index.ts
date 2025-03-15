import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { validateApplication } from "./middleware/validateApplication";
import { requestLogger } from "./middleware/logger";


const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use(cors({
  origin: "http://localhost:3000", // Permite peticiones desde el frontend local
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json()); // Parsear JSON en las peticiones

app.use(requestLogger);

// Ruta GET: obtener todas las aplicaciones o filtrar por nombre (query param "q")
app.get('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    console.log("Consulta recibida:", q);

    const apps = await prisma.application.findMany({
      where: {
        name: {
          contains: q as string
        }
      },
      orderBy: { name: 'asc' } // Orden alfabetico
    });

    console.log("Datos enviados:", apps);
    res.json(apps);
  } catch (error) {
    next(error);
  }
});

// Ruta POST: insertar una nueva aplicación
app.post("/applications", validateApplication, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, domains } = req.body;
    const newApp = await prisma.application.create({
      data: { id, name, domains },
    });
    res.status(201).json(newApp);
  } catch (error) {
    next(error);
  }
});

// Ruta DELETE: eliminar una aplicación por id
app.delete('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.application.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.message}`);

  if (err.name === "PrismaClientKnownRequestError") {
    res.status(400).json({ error: "Error de base de datos", details: err.message });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(422).json({ error: "Datos inválidos", details: err.message });
    return;
  }

  if (err.status) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Ha ocurrido un error en el servidor" });
});
