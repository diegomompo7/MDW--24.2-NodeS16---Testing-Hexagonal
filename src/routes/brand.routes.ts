/**
 * @swagger
 * tags:
 *   name: Brand
 *   description: The brands managing API
 */

import express, { type NextFunction, type Response, type Request } from "express";
import fs from "fs";
import multer from "multer";

// Modelos
import { Brand } from "../models/mongo/Brand";
const upload = multer({ dest: "public" });

export const brandRouter = express.Router();

/**
 * @swagger
 * /brand:
 *   get:
 *     summary: Lists all the brands
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: The list of the brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
brandRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Asi leemos query params
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const brands = await Brand.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Num total de elementos
    const totalElements = await Brand.countDocuments();

    const response = {
      pagination: {
        totalItems: totalElements,
        totalPages: Math.ceil(totalElements / limit),
        currentPage: page
      },
      data: brands
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /brand/{id}:
 *   get:
 *     summary: Get a brand by ID
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The brand ID
 *     responses:
 *       200:
 *         description: The brand info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 */
brandRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const brand = await Brand.findById(id);
    if (brand) {
      res.json(brand);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /brand/name/{name}:
 *   get:
 *     summary: Get brands by name
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The brand name
 *     responses:
 *       200:
 *         description: The list of brands with matching name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 */

// CRUD: Operación custom, no es CRUD
brandRouter.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  const brandName = req.params.name;

  try {
    const brand = await Brand.find({ name: new RegExp("^" + brandName.toLowerCase(), "i") });
    if (brand?.length) {
      res.json(brand);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /brand:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brand]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Brand'
 *     responses:
 *       201:
 *         description: The created brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Bad request - Missing required fields in the request body
 */

// CRUD: CREATE
brandRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = new Brand(req.body);
    const createdBrand = await brand.save();
    return res.status(201).json(createdBrand);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /brand/{id}:
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The brand ID
 *     responses:
 *       200:
 *         description: The deleted brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *  *   put:
 *     summary: Update a brand by ID
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Brand'
 *     responses:
 *       200:
 *         description: The updated brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Bad request - Missing required fields in the request body
 *       404:
 *         description: Brand not found
 */

// CRUD: DELETE
brandRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const brandDeleted = await Brand.findByIdAndDelete(id);
    if (brandDeleted) {
      res.json(brandDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
brandRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const brandUpdated = await Brand.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (brandUpdated) {
      res.json(brandUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /brand/logo-upload:
 *   post:
 *     summary: Upload a brand logo
 *     tags: [Brand]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *               brandId:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated brand with new logo path
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 */

brandRouter.post("/logo-upload", upload.single("logo"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Renombrado de la imagen
    const originalname = req.file?.originalname as string;
    const path = req.file?.path as string;
    const newPath = `${path}_${originalname}`;
    fs.renameSync(path, newPath);

    // Busqueda de la marca
    const brandId = req.body.brandId;
    const brand = await Brand.findById(brandId);

    if (brand) {
      brand.logoImage = newPath;
      await brand.save();
      res.json(brand);

      console.log("Marca modificada correctamente!");
    } else {
      fs.unlinkSync(newPath);
      res.status(404).send("Marca no encontrada");
    }
  } catch (error) {
    next(error);
  }
});
