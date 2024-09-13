// Make sure we are in test mode!
import dotenv from "dotenv";
import process from "process";
process.env.TEST = "true";

// Also need to load the .env file
dotenv.config();

import assert from "assert";
import type { SessionDoc } from "../server/concepts/sessioning";

// Test mode must be set before importing the routes
import { app } from "../server/routes";

import db, { client } from "../server/db";
if (db.databaseName !== "test-db") {
  throw new Error("Not connected to test database");
}

// Actual WebSession comes form Express.js, but here
// we just need a mock object
const getEmptySession = () => {
  return { cookie: {} } as WebSessionDoc;
};

beforeEach(async () => {
  // We just drop the test database before each test
  await db.dropDatabase();

  // Might want to add some default users for convenience
  await app.createUser(getEmptySession(), "alice", "alice123");
  await app.createUser(getEmptySession(), "bob", "bob123");
});

describe("Create a user and log in", () => {
  it("should create a user and log in", async () => {
    const session = getEmptySession();

    await assert.doesNotReject(app.createUser(session, "barish", "1234"));
    await assert.rejects(app.logIn(session, "barish", "123"));
    await assert.doesNotReject(app.logIn(session, "barish", "1234"));
    await assert.rejects(app.logIn(session, "barish", "1234"), "Should not be able to login while already logged-in");
  });

  it("duplicate username should fail", async () => {
    const session = getEmptySession();

    await assert.doesNotReject(app.createUser(session, "barish", "1234"));
    await assert.rejects(app.createUser(session, "barish", "1234"));
  });
});

describe("Testing validator", () => {
  it("should validate username", async () => {
    await assert.rejects(app.getUser(""), "Username should be at least 1 character long");
    await assert.doesNotReject(app.getUser("alice"));
  });
});

// More testcases needed!

// After all tests are done, we close the connection
// so that the program can exit
after(async () => {
  await client.close();
});
