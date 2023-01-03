import { config } from "./config";

export const initConfig = function () {
  const selectedConfig = config.master;
  const keys = Object.keys(selectedConfig);
  for (var key of keys) {
    window[key] = selectedConfig[key];
  }
};
