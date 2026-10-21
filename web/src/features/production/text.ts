// Require actual letters/numbers without changing valid Bengali shaping or authored text.
export const meaningfulText = (value: string) =>
  /[\p{L}\p{N}]/u.test(value) && !/[\u0000-\u001f\u007f]/.test(value);
