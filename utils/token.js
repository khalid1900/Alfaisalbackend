    import jwt from "jsonwebtoken";

    // export const createJwtToken = (payload) => {
    //     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "20d" });
    //     return token;
    // };
    export const createJwtToken = (payload) => {
  try {
    const token = jwt.sign(
      { id: payload }, // Store ID as 'id', not 'user'
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "20d" }
    );
    return token;
  } catch (error) {
    console.error("Token creation error:", error);
    return null;
  }
};


export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    console.log("Decoded token:", decoded); // DEBUG
    return decoded.id; // Return 'id', not 'user'
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
};