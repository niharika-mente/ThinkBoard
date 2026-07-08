import validator from "validator";

const Validate = (data) => {
  const { name, email, password } = data;
  
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new Error("Invalid field type");
  }
  
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  
  if (!validator.isLength(password, { min: 6 })) {
    throw new Error("Password must be at least 6 characters");
  }
  
  return true;
};

export default Validate;