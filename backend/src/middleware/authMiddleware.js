import jwt from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Not authorized. Please login." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    req.user = decoded; 

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        error: "Token expired. Please login again." 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      error: "Invalid token. Please login again." 
    });
  }
};

