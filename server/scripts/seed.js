import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

const run = async () => {
  try {
    await connectDB();
    const email = 'demo@mail.com';
    const password = 'demo123';

    const exists = await User.findOne({ email });
    if (exists) {
      console.log('User already exists:', email);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({ name: 'Demo User', email, passwordHash, role: 'admin' });
      console.log('Created demo user:', email, password);
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
