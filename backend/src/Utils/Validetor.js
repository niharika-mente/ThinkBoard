
import validator from "validator"

 const Validate = (data) => {
  const { name, email, password } = data;
  
  if (!name || !email || !password) {
    throw new Error("Some Field Missing");
  }
  
  // Optional: Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  
  // Optional: Password length check
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  
  return true;
};

export default Validate;