import mongoose from "mongoose";

const userInteractionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    post_id: { type: String, required: true },
    liked: { type: Boolean, default: false },
    saved: { type: Boolean, default: false },
    viewed: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
    last_liked: { type: Date },
    last_saved: { type: Date },
    last_viewed: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Create compound index for efficient queries
userInteractionSchema.index({ user_id: 1, post_id: 1 }, { unique: true });
userInteractionSchema.index({ post_id: 1 });
userInteractionSchema.index({ user_id: 1 });

const UserInteraction = mongoose.models.UserInteraction || mongoose.model('UserInteraction', userInteractionSchema);
export default UserInteraction;
