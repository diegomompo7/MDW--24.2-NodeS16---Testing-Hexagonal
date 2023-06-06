import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";
import { app, server } from "../src/index";
import { type IUser } from "../src/models/mongo/User";
import request from "supertest";

describe("User controller", () => {
  const userMock: IUser = {
    email: "fran@mail.com",
    password: "12345678",
    firstName: "Fran",
    lastName: "Linde",
    phone: "666555444",
    address: {
      street: "Calle Falsa",
      number: 123,
      city: "Madrid"
    }
  };

  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    app.close();
  });

  it("Simple test to check jest in working", () => {
    expect(true).toBeTruthy();
  });

  it("Simple test to check jest in working", () => {
    const miTexto = "Hola chicos";
    expect(miTexto.length).toBe(11);
  });

  it("POST /user - this should create an user", async() => {
    const response = await request(server)
      .post("/user")
      .send(userMock)
      .set("Accept", "application/json")
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.email).toBe(userMock.email);
  })
});
