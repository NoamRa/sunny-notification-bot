import fs from "node:fs/promises";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DB } from "./db.js";
import { createUsersDAO } from "./users.js";

const mockedReadFile = vi.spyOn(fs, "readFile");
const mockedWriteFile = vi.spyOn(fs, "writeFile").mockResolvedValue();
vi.spyOn(fs, "stat").mockResolvedValue("it's ok, db file exists :D");
const dbPath = "fooBar.json";

const user1 = {
  id: 123,
  username: "my username",
  displayName: "my display name",
  notifications: {
    morning: "Always",
    hourly: "Yes",
  },
};
const user2 = {
  id: 456,
  username: "another username",
  displayName: "another display name",
  notifications: {
    morning: "Always",
    hourly: "Yes",
  },
};
const user3 = {
  id: 789,
  username: "john",
  displayName: "duh",
  notifications: {
    morning: "Always",
    hourly: "Yes",
  },
};

describe("Test users", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("init - create USERS entry", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({}));
    await createUsersDAO(await DB(dbPath));

    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({ USERS: [] }, null, 2),
      { encoding: "utf-8" },
    );
  });

  test("create user", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ USERS: [] }));
    const users = await createUsersDAO(await DB(dbPath));

    await users.createUser(user1.id, user1.username, user1.displayName);

    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({ USERS: [user1] }, null, 2),
      { encoding: "utf-8" },
    );
  });

  test("create another user", async () => {
    mockedReadFile.mockResolvedValue(JSON.stringify({ USERS: [user2] }));
    const users = await createUsersDAO(await DB(dbPath));

    await users.createUser(user3.id, user3.username, user3.displayName);

    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({ USERS: [user2, user3] }, null, 2),
      { encoding: "utf-8" },
    );
  });

  test("delete user", async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ USERS: [user1, user2, user3] }),
    );
    const users = await createUsersDAO(await DB(dbPath));

    await users.deleteUser(456);

    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({ USERS: [user1, user3] }, null, 2),
      { encoding: "utf-8" },
    );
  });

  test("get users", async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ USERS: [user1, user2, user3] }),
    );
    const users = await createUsersDAO(await DB(dbPath));

    const allUsers = await users.getUsers();
    expect(allUsers).toStrictEqual([user1, user2, user3]);
  });

  test("get users", async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ USERS: [user1, user2, user3] }),
    );
    const users = await createUsersDAO(await DB(dbPath));

    const user = await users.getUser(user3.id);
    expect(user).toStrictEqual(user3);
  });

  test("add location", async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ USERS: [user1, user2, user3] }),
    );
    const users = await createUsersDAO(await DB(dbPath));

    await users.updateLocation(user2.id, {
      latitude: 741,
      longitude: 963,
    });
    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify(
        {
          USERS: [
            user1,
            { ...user2, location: { latitude: 741, longitude: 963 } },
            user3,
          ],
        },
        null,
        2,
      ),
      { encoding: "utf-8" },
    );
  });

  test("update location", async () => {
    const user2WithLocation = {
      ...user2,
      location: { latitude: 741, longitude: 963 },
    };

    mockedReadFile.mockResolvedValue(
      JSON.stringify({ USERS: [user1, user2WithLocation, user3] }),
    );
    const users = await createUsersDAO(await DB(dbPath));

    await users.updateLocation(user2.id, {
      latitude: 123,
      longitude: 456,
    });
    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify(
        {
          USERS: [
            user1,
            {
              ...user2WithLocation,
              location: { latitude: 123, longitude: 456 },
            },
            user3,
          ],
        },
        null,
        2,
      ),
      { encoding: "utf-8" },
    );
  });

  test("update user notification", async () => {
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ USERS: [user1, user2, user3] }),
    );
    const users = await createUsersDAO(await DB(dbPath));

    await users.updateNotifications(user2.id, {
      hourly: "yes please",
    });
    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify(
        {
          USERS: [
            user1,
            {
              ...user2,
              notifications: {
                ...user2.notifications,
                hourly: "yes please",
              },
            },
            user3,
          ],
        },
        null,
        2,
      ),
      { encoding: "utf-8" },
    );
  });
});
