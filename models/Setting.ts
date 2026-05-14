import mongoose, { Schema, models } from "mongoose";

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: String
  },
  { timestamps: true }
);

const Setting = models.Setting || mongoose.model("Setting", settingSchema);
export default Setting;
