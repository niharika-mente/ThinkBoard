
import validator from "validator"

 const Validate = (data) => {
  const { name, email, password } = data;
  
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new Error("Invalid field type");
  }
  
  // Optional: Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  
  // Optional: Password length check
  const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!strongPassword.test(password)) {
  throw new Error(
    "Password must contain minimum 8 characters with uppercase, lowercase, number and special character"
  );
}
  
  return true;
};

export default Validate;