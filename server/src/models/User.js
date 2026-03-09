import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    isPaid: {
      type: Boolean,
      default: false
    },

    payment: {
      status: {
        type: String,
        enum: ["free", "paid"],
        default: "free"
      },
      paidAt: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
