import { type SwaggerOptions } from "swagger-ui-express";

export const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node S15",
      version: "1.0.0",
      description: "This is a simple CRUD API",
      license: {
        name: "MIT",
        url: "http://mit.com"
      },
      contact: {
        name: "Fran Linde",
        url: "https://github.com/franlidebl",
        email: "fran@example.com"
      }
    },
    server: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: [
    "./src/models/*/*.ts",
    // eslint-disable-next-line @typescript-eslint/comma-dangle
    "./src/routes/*/*.routes.ts",
  ]
};
