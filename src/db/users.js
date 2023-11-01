export async function createUsersDAO(DB) {
  const entryKey = "USERS";

  // init
  try {
    const users = await getUsers();
    if (!Array.isArray(users)) {
      DB.overwriteEntry(entryKey, []);
    }
  } catch (err) {
    console.error("Error in UsersDAO init:");
    console.error(err);
  }

  async function getUsers() {
    return await DB.readEntry(entryKey);
  }

  async function createUser(id, username, displayName) {
    const users = await getUsers();
    if (users.find((user) => user.id === id)) {
      console.error(`Error: user with id ${id} already exists.`);
      return false;
    }
    const newUser = { id, username, displayName };
    await DB.overwriteEntry(entryKey, [...users, newUser]);
    return newUser;
  }

  return {
    getUsers,
    createUser,
  };
}
