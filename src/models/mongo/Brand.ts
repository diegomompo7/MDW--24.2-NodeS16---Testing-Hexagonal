/**
 * @swagger
 * components:
 *  schemas:
 *    Brand:
 *      type: object
 *      required:
 *        - name
 *      properties:
 *        name:
 *          type: string
 *          description: Name of the brand (sample Ford)
 *        creationYear:
 *          type: number
 *          description: Year when brand was created (sample 1990)
 *        country:
 *          type: string
 *          description: Country of this Brand (sample SPAIN)
 *        logoImage:
 *          type: string
 *          description: Logo of this brand (sample http://balbblabla.com/image.jpg)
 */

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const allowedCountries = ["SPAIN", "ITALY", "USA", "GERMANY", "JAPAN", "FRANCE"];
const currentYear = new Date().getFullYear();

interface IBrand {
  name: string;
  creationYear: number;
  country: string;
  logoImage: string;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Hijo mío... dame algo más de detalle, al menos 3 letras para el nombre"],
      maxLength: 20,
      trim: true
    },
    creationYear: {
      type: Number,
      required: false,
      min: [1803, "No mientas porque la marca de coches más antigua es Peugeot y se creó en 1803"],
      max: currentYear
    },
    country: {
      type: String,
      required: false,
      enum: allowedCountries,
      uppercase: true,
      trim: true
    },
    logoImage: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

export const Brand = mongoose.model("Brand", brandSchema);
