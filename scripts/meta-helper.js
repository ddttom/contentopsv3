// eslint-disable-next-line import/prefer-default-export
export function replaceTokens(data, text) {
  let ret = text;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const item = key;
      const value = data[item];
      ret = ret.replaceAll(item, value);
    }
  }
  return ret;
}

export function logError(message) {
  // eslint-disable-next-line no-console
  console.error(message);
}
