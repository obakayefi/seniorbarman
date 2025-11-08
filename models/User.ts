import mongoose, { Schema, models } from "mongoose";



const userSchema = new Schema(
  {
    firstName: {
        type: String,
        require: true
    }, 
    lastName: {
        type: String,
        require: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
