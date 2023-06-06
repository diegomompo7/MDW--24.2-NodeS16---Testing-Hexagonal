import { userRouter } from "./routes/user.routes";
import { carRouter } from "./routes/car.routes";
import { brandRouter } from "./routes/brand.routes";
// import { AppDataSource } from "./databases/typeorm-datasource";
import { playerRouter } from "./routes/player.routes";
import { swaggerOptions } from "./swagger-options";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
// import { fileUploadRouter } from "./routes/file-upload.routes.js";

import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";

import express from "express";
import cors from "cors";
import { mongoConnect } from "./databases/mongo-db";
// import { sqlConnect } from "./databases/sql-db";
import { languagesRouter } from "./routes/languages.routes";

// Conexión a la BBDD
// const mongoDatabase = await mongoConnect();
// const sqlDatabase = await sqlConnect();
// const datasource = await AppDataSource.initialize();

// Configuración del server
const PORT = 3000;
export const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(
  cors({
    origin: "http://localhost:3000"
  })
);

// Swagger
const specs = swaggerJSDoc(swaggerOptions);
console.log(specs);
server.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

server.use(async (req: Request, res: Response, next: NextFunction) => {
  await mongoConnect();
  next();
});

// Rutas
const router = express.Router();
router.get("/", (req: Request, res: Response) => {
  // res.send(`
  //   <h3>Esta es la RAIZ de nuestra API.</h3>
  //   <p>Estamos usando la BBDD Mongo de ${mongoDatabase?.connection?.name as string}</p>
  //   <p>Estamos usando la BBDD SQL ${sqlDatabase?.config?.database as string} del host ${sqlDatabase?.config?.host as string}</p>
  //   <p>Estamos usando TypeORM con la BBDD: ${datasource.options.database as string}</p>
  // `);
  res.send(`
    <h3>Esta es la RAIZ de nuestra API.</h3>
`);
});
router.get("*", (req: Request, res: Response) => {
  res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
});

server.use((req: Request, res: Response, next: NextFunction) => {
  const date = new Date();
  console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
  next();
});

// Usamos las rutas
server.use("/user", userRouter);
server.use("/car", carRouter);
server.use("/brand", brandRouter);
server.use("/languages", languagesRouter);
server.use("/player", playerRouter);
// server.use("/public", express.static("public"));
// server.use("/file-upload", fileUploadRouter)
server.use("/", router);

server.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.log("*** INICIO DE ERROR ***");
  console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
  console.log(err);
  console.log("*** FIN DE ERROR ***");

  // Truco para quitar el tipo a una variable
  const errorAsAny: any = err as unknown as any;

  if (err?.name === "ValidationError") {
    res.status(400).json(err);
  } else if (errorAsAny.errmsg && errorAsAny.errmsg?.indexOf("duplicate key") !== -1) {
    res.status(400).json({ error: errorAsAny.errmsg });
  } else if (errorAsAny?.code === "ER_NO_DEFAULT_FOR_FIELD") {
    res.status(400).json({ error: errorAsAny?.sqlMessage });
  } else {
    res.status(500).json(err);
  }
});

export const app = server.listen(PORT, () => {
  console.log(`Server levantado en el puerto ${PORT}`);
});
