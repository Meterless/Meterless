// Browser stub for node:fs. The browser bundle always runs with
// storage: "memory", which never touches the filesystem; these throw if
// anything reaches them anyway.
const unavailable = (): never => {
  throw new Error("node:fs is unavailable in the browser bundle; use storage: \"memory\"");
};
export default {
  mkdirSync: unavailable,
  existsSync: (): boolean => false,
  readFileSync: unavailable,
  writeFileSync: unavailable,
  appendFileSync: unavailable,
};
