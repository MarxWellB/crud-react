import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI');
  await mongoose.connect(uri, { dbName: 'miniusers' });
  console.log('MongoDB connected');
};
