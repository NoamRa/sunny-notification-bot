const toObj = (acc, curr) => ({ ...acc, [curr]: curr });

// #region morning notification
export const MorningNotification = ["Always", "None", "Sunny"].reduce(
  toObj,
  {},
);
export const defaultMorningNotification = "Always";

export function isValidMorningNotification(value) {
  return value in MorningNotification;
}
// #endregion

// #region hourly notification
export const HourlyNotification = ["Yes", "No"].reduce(toObj, {});

export const defaultHourlyNotification = "Yes";

export function isValidHourlyNotification(value) {
  return value in HourlyNotification;
}
// #endregion

export function createDefaultNotificationObject() {
  return {
    morning: defaultMorningNotification,
    hourly: defaultHourlyNotification,
  };
}

export function updateNotificationsObject(user, updatedNotifications) {
  return { ...user.notifications, ...updatedNotifications };
}
