import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    post_id: { type: String, required: true },
    user_id: { type: String, required: true },
    content: { type: String, required: true },
    parent_id: { type: String, default: null }, // For replies/threading
    likes: { type: Number, default: 0 },
    replies_count: { type: Number, default: 0 },
    is_edited: { type: Boolean, default: false },
    is_pinned: { type: Boolean, default: false }, // For post authors to pin discussions
    is_hearted: { type: Boolean, default: false }, // Heart from post author (YouTube-style)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create indexes for efficient queries
discussionSchema.index({ id: 1 }, { unique: true }); // Unique constraint on id
discussionSchema.index({ post_id: 1, createdAt: -1 }); // Get discussions for a post, sorted by newest
discussionSchema.index({ parent_id: 1, createdAt: 1 }); // Get replies for a discussion, sorted by oldest
discussionSchema.index({ user_id: 1, createdAt: -1 }); // Get user's discussions
discussionSchema.index({ post_id: 1, is_pinned: -1, createdAt: -1 }); // Pinned discussions first

const Discussions = mongoose.models.Discussions || mongoose.model('Discussions', discussionSchema);
export default Discussions;
