import mongoose from "mongoose";

const discussionInteractionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    discussion_id: { type: String, required: true },
    liked: { type: Boolean, default: false },
    last_liked: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Create compound index for efficient queries
discussionInteractionSchema.index({ user_id: 1, discussion_id: 1 }, { unique: true });
discussionInteractionSchema.index({ discussion_id: 1 });
discussionInteractionSchema.index({ user_id: 1 });

const DiscussionInteraction = mongoose.models.DiscussionInteraction || mongoose.model('DiscussionInteraction', discussionInteractionSchema);
export default DiscussionInteraction;
