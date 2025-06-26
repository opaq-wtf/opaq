import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    labels: { type: [String], default: [] },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const posts = mongoose.models.Posts || mongoose.model('Posts', postSchema);
export default posts;
