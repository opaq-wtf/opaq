import mongoose from "mongoose";

const manifestHistorySchema = new mongoose.Schema({
    id: { type: String, required: true },
    user_id: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    title: { type: String, required: true }, // Auto-generated short title from prompt
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Create indexes for efficient queries
manifestHistorySchema.index({ id: 1 }, { unique: true }); // Unique constraint on id
manifestHistorySchema.index({ user_id: 1, createdAt: -1 }); // Get user's history, sorted by newest

const ManifestHistory = mongoose.models.ManifestHistory || mongoose.model('ManifestHistory', manifestHistorySchema);
export default ManifestHistory;
