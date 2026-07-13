// Browser stub for node:path. Only join is used, and only on the
// storage: "local" path, which the browser bundle never takes.
export default {
  join: (...parts: string[]): string => parts.join("/"),
};
