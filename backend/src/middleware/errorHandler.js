// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  // प्रोडक्शन में मैसेज न दिखाएं, सिर्फ डेवलपमेंट में दिखाएं (पहले जैसा ही बिहेवियर)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

export default errorHandler;