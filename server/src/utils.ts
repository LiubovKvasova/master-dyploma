export const filterOutKeys = (
  inputObject: object,
  unwantedKeys: string[],
): object => {
  const entries = Object.entries(inputObject);
  const filteredEntries = entries.filter(
    ([key]) => !unwantedKeys.includes(key),
  );

  return Object.fromEntries(filteredEntries);
};
