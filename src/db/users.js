import { logger, serialize } from "../logger.js";

export async function createUsersDAO(DB) {
  const entryKey = "USERS";

  // init
  try {
    const users = await getUsers();
    if (!Array.isArray(users)) {
      DB.overwriteEntry(entryKey, []);
    }
  } catch (err) {
    logger.error(`Error in UsersDAO init: ${serialize(err)}`);
  }

  async function getUsers() {
    return await DB.readEntry(entryKey);
  }

  async function getUser(id) {
    const users = await getUsers();
    return users.find((user) => user.id === id);
  }

  async function createUser(id, username, displayName) {
    const users = await getUsers();
    if (users.find((user) => user.id === id)) {
      logger.error(`Error: user with id ${id} already exists.`);
      return false;
    }
    const newUser = { id, username, displayName };
    await DB.overwriteEntry(entryKey, [...users, newUser]);
    return newUser;
  }

  async function updateLocation(userId, location) {
    const users = await getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      logger.error(`updateLocation failed to find user with ID '${userId}'`);
      return;
    }

    const currentUser = users[userIndex];
    const updatedUser = { ...currentUser, location };
    users[userIndex] = updatedUser;

    const res = await DB.overwriteEntry(entryKey, [...users]);
    logger.debug(
      `User updated. Before: ${JSON.stringify(
        currentUser,
      )}. After: ${JSON.stringify(updatedUser)}`,
    );
    return res;
  }

  async function deleteUser(userId) {
    logger.info(`Deleting user with ID '${userId}'`);
    try {
      const users = await getUsers();
      await DB.overwriteEntry(
        entryKey,
        users.filter((user) => user.id !== userId),
      );
      return true;
    } catch (err) {
      logger.error(`Delete user failed for userId '${userId}'`);
      return false;
    }
  }

  return {
    getUser,
    getUsers,
    createUser,
    updateLocation,
    deleteUser,
  };
}
