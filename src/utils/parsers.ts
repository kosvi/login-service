const parseNumber = (num: unknown): number => {
  if (typeof num === 'number') {
    return num;
  }
  if (num instanceof Number) {
    return Number(num);
  }
  return Number(num);
};

export const parsers = {
  parseNumber
};
