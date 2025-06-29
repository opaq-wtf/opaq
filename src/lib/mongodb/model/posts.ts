import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  id: { type: String, required: true },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  labels: { type: [String], default: [] },
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create indexes for efficient queries
postSchema.index({ id: 1 }, { unique: true }); // Unique constraint on id
postSchema.index({ user_id: 1, createdAt: -1 }); // Get user's posts, sorted by newest
postSchema.index({ status: 1, createdAt: -1 }); // Get published/draft posts, sorted by newest

const posts = mongoose.models.Posts || mongoose.model("Posts", postSchema);
export default posts;
