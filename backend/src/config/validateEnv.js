const requiredEnvVars = ["MONGO_URI", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
const optionalEnvVars = ["PORT"];

const placeholderPattern = /your_.*_here/i;

const validateEnv = () => {
  const missingOrPlaceholder = [];

  requiredEnvVars.forEach((key) => {
    const value = process.env[key];
    if (!value || placeholderPattern.test(value)) {
      missingOrPlaceholder.push(key);
    }
  });

  if (missingOrPlaceholder.length > 0) {
    console.error("\n[ENV] Critical errors — server cannot start:");
    missingOrPlaceholder.forEach((key) => {
      console.error(`❌ Missing or placeholder value: ${key}`);
    });
    console.error("\nPlease set these variables in your .env file.\n");
    process.exit(1);
  }

  optionalEnvVars.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`[ENV] Warning: Optional variable ${key} not set, using default.`);
    }
  });

  console.log("[ENV] All required environment variables are set correctly.\n");
};

export default validateEnv;