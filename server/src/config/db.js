import mongoose from 'mongoose';

export const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Mongo connection error:', error.message);
    process.exit(1);
  }
};





