import jwt from "jsonwebtoken";

import User from "./models/User.js";


  const JWT_SECRET = process.env.JWT_SECRET || "Ni0sddfsd325sfweewfer432sdfg_0089@IT";
                                                

  function getTokenFromHeader(req) {
    const auth = req?.headers?.authorization || req?.headers?.Authorization;
    if (!auth) return null;
    const [scheme, token] = auth.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) return token.trim();
    
    return auth.trim();
  }

export async function buildContext({ req }) {
  let user = null;
  try {
    const token = getTokenFromHeader(req);
    // console.log("Token from header:", token); 
    if (!token) return { user: null };

    const payload = jwt.verify(token, JWT_SECRET);
    // console.log("JWT payload:", payload);
    const userId = payload?.userId || payload?.user?.id;
    if (!userId) return { user: null };

    const doc = await User.findById(userId).lean();
    if (!doc) return { user: null };

    if (!doc.id && doc._id) doc.id = String(doc._id);

    user = doc;
  } catch (err) {
    console.log("JWT error:", err.message);
    user = null;
  }
  console.log("Context user:", user);
  return { user };
}
