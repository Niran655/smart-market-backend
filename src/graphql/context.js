export const context = ({ req }) => {
  const token = req.headers.authorization || "";
  return { token };
};
