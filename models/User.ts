import mongoose, { Schema, models } from "mongoose";
import { ROLES } from "@/lib/roles";


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
    role: {
      enum: Object.values(ROLES),
      type: String,
      default: ROLES.USER
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    favoriteTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", userSchema);
export default User;

