import mongoose from 'mongoose';

const MongoConnect = async () => {
    const uri = process.env.NEXT_MONGOOSE_URL;

    if (!uri) {
        throw new Error('Environmet variable NEXT_MONGOOSE_URL is not set');
    }

    try {
        await mongoose.connect(uri);
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

export default MongoConnect;