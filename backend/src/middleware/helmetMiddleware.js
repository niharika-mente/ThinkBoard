// middleware/helmetMiddleware.js
import helmet from "helmet";

// कस्टम कॉन्फ़िगरेशन जो आपके फ्रंटएंड (Vite/React) को ब्लॉक नहीं करेगा
const helmetMiddleware = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:"],
    },
  },
});

export default helmetMiddleware;