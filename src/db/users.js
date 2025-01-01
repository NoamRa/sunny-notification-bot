import { logger, serialize } from "../logger/index.js";
import {
  createDefaultNotificationObject,
  updateNotificationsObject,
} from "./notifications.js";

export async function createUsersDAO(DB) {
  const entryKey = "USERS";

  // init
  try {
    const users = await getUsers();
    if (!Array.isArray(users)) {
      await DB.overwriteEntry(entryKey, []);
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
    const newUser = {
      id,
      username,
      displayName,
      notifications: createDefaultNotificationObject(),
    };
    await DB.overwriteEntry(entryKey, [...users, newUser]);
    return newUser;
  }

  async function updateUser(userId, updateFn = (user) => user) {
    const users = await getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      logger.error(`updateUser failed to find user with ID '${userId}'`);
      return;
    }

    users[userIndex] = updateFn(users[userIndex]);

    await DB.overwriteEntry(entryKey, [...users]);
    return;
  }

  async function updateLocation(userId, location) {
    return updateUser(userId, (user) => ({ ...user, location }));
  }

  async function updateNotifications(userId, notifications) {
    return updateUser(userId, (user) => ({
      ...user,
      notifications: updateNotificationsObject(user, notifications),
    }));
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
    updateNotifications,
    deleteUser,
  };
}
