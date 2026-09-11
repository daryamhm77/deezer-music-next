import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoConnectPromise?: Promise<MongoClient>;
};

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  return uri;
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10_000,
  serverSelectionTimeoutMS: 5_000,
  connectTimeoutMS: 5_000,
};

export function resetMongoClient() {
  const existing = globalForMongo.mongoClient;
  globalForMongo.mongoClient = undefined;
  globalForMongo.mongoConnectPromise = undefined;
  void existing?.close().catch(() => undefined);
}

export function getMongoClient() {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(getMongoUri(), options);
  }

  return globalForMongo.mongoClient;
}

/** Ensures the shared client is connected; recreates it after a closed topology. */
export async function ensureMongoConnected() {
  if (!globalForMongo.mongoConnectPromise) {
    const client = getMongoClient();
    globalForMongo.mongoConnectPromise = client.connect().catch((error) => {
      resetMongoClient();
      throw error;
    });
  }

  try {
    const client = await globalForMongo.mongoConnectPromise;
    await client.db("admin").command({ ping: 1 });
    return client;
  } catch {
    resetMongoClient();
    const client = getMongoClient();
    globalForMongo.mongoConnectPromise = client.connect();
    return globalForMongo.mongoConnectPromise;
  }
}

export function getMongoDb(): Db {
  const client = getMongoClient();
  return client.db(process.env.MONGODB_DB_NAME ?? "sea-music-player");
}
