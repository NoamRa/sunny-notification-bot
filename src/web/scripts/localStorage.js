function createLocalStorageHandlers(key) {
  return {
    setItem: (item) => {
      localStorage.setItem(key, JSON.stringify(item));
    },

    getItem: (fallback = null) => {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      try {
        return JSON.parse(item);
      } catch (_err) {
        return item;
      }
    },

    removeItem: () => {
      localStorage.removeItem(key);
    },
  };
}

export const localStorageLocation = createLocalStorageHandlers("location");
