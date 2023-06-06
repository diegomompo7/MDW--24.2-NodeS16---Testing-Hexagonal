/**
 * @swagger
 * tags:
 *   name: Car
 *   description: The cars managing API
 */

import express, { type NextFunction, type Response, type Request } from "express";

// Modelos
import { Car } from "../models/mongo/Car";

// Router propio de usuarios
export const carRouter = express.Router();

/**
 * @swagger
 * /car:
 *   get:
 *     summary: Lists all the cars
 *     tags: [Car]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination (default: 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The maximum number of items to return per page (default: 10)
 *     responses:
 *       200:
 *         description: The list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 */

// CRUD: READ
carRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Estamos en el middleware /car que comprueba parámetros");

    const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

carRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Asi leemos query params
    const page: number = req.query.page as any;
    const limit: number = req.query.limit as any;

    const cars = await Car.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(["owner", "brand"]);

    // Num total de elementos
    const totalElements = await Car.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: cars
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /car/{id}:
 *   get:
 *     summary: Get a car by ID
 *     tags: [Car]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The car ID
 *     responses:
 *       200:
 *         description: The car info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 */

// CRUD: READ
carRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const car = await Car.findById(id).populate(["owner", "brand"]);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /car/brand/{brand}:
 *   get:
 *     summary: Get cars by brand
 *     tags: [Car]
 *     parameters:
 *       - in: path
 *         name: brand
 *         schema:
 *           type: string
 *         required: true
 *         description: The brand name
 *     responses:
 *       200:
 *         description: The cars matching the brand
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 *       404:
 *         description: No cars found for the brand
 */

// CRUD: Operación custom, no es CRUD
carRouter.get("/brand/:brand", async (req: Request, res: Response, next: NextFunction) => {
  const brand = req.params.brand;

  try {
    const car = await Car.find({ brand: new RegExp("^" + brand.toLowerCase(), "i") }).populate(["owner", "brand"]);
    if (car?.length) {
      res.json(car);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});

// Endpoint de creación de usuarios
// CRUD: CREATE

/**
 * @swagger
 * /car:
 *   post:
 *     summary: Create a new car
 *     tags: [Car]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: The car was created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Missing parameters or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
carRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = new Car(req.body);
    const createdCar = await car.save();
    return res.status(201).json(createdCar);
  } catch (error) {
    next(error);
  }
});

// Para elimnar coches
// CRUD: DELETE
/**
 * @swagger
 * /car:
 *   post:
 *     summary: Create a new car
 *     tags: [Car]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: The car was created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Missing parameters or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
carRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const carDeleted = await Car.findByIdAndDelete(id);
    if (carDeleted) {
      res.json(carDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /car/{id}:
 *   put:
 *     summary: Update a car by ID
 *     tags: [Car]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The car ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: The car was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Some parameters are missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The car was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// CRUD: UPDATE
carRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const carUpdated = await Car.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (carUpdated) {
      res.json(carUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});
