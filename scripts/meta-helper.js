// eslint-disable-next-line import/prefer-default-export
export function replaceTokens(data, text) {
  let ret = text;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in data) {
    const value = data[key];
    ret = ret.replaceAll(key, value);
  }
  return ret;
}

export function logError(message) {
  // eslint-disable-next-line no-console
  console.error(message);
}
