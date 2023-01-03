var _attributes = window.__config.master;
const keys = Object.keys(_attributes);
for (var key of keys) {
  window[key] = _attributes[key];
}
