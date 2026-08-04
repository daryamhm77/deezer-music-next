import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

export function getMongoClient() {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri!);
  }

  return globalForMongo.mongoClient;
}

export function getMongoDb() {
  const client = getMongoClient();
  return client.db(process.env.MONGODB_DB_NAME ?? "sea-music-player");
}
