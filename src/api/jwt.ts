export const JWT_ACCESS_KEY = "jwt:access";

export const getEncodedAccessToken = (): string | null => {
  const token = localStorage.getItem(JWT_ACCESS_KEY);
  return token ?? null;
};
