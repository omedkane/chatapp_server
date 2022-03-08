import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "./express";

let mongod: MongoMemoryServer;
const connectDb = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const dbUrl = mongod.getUri();

    const conn = await mongoose.connect(dbUrl);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const server = app.listen(3000, () => {
  console.info("Server started on port %s.", 3000);
});

export { app, server, connectDb, disconnectDB };
