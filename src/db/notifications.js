import { hasOwnProp } from "../utils/index.js";

const toObj = (acc, curr) => ({ ...acc, [curr]: curr });

// #region morning notification
export const MorningNotification = ["Always", "None", "Sunny"].reduce(
  toObj,
  {},
);
const defaultMorningNotification = "Always";

export function isValidMorningNotification(value) {
  return hasOwnProp(MorningNotification, value);
}
// #endregion

// #region hourly notification
export const HourlyNotification = ["Yes", "No"].reduce(toObj, {});

const defaultHourlyNotification = "Yes";

export function isValidHourlyNotification(value) {
  return hasOwnProp(HourlyNotification, value);
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

const notificationKeys = new Set(["hourly", "morning"]);
export function notificationsIsValid(notifications) {
  if (!notifications || typeof notifications !== "object") return false;
  if (!Object.keys(notifications).every((key) => notificationKeys.has(key)))
    return false;
  return (
    (notifications.hourly
      ? isValidHourlyNotification(notifications.hourly)
      : true) &&
    (notifications.morning
      ? isValidMorningNotification(notifications.morning)
      : true)
  );
}
