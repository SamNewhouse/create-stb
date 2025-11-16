export const shortUUID = (): string => {
  const uuid = crypto.randomUUID();
  return uuid.slice(0, 8);
};
