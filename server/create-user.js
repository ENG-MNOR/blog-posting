
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const createUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'mohamed@gmail.com';
        const password = 'password';
        const name = 'Mohamed';

        // Delete existing users if any to make it clean, or just check
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists, updating password...');
            const hashed = await bcrypt.hash(password, 12);
            existing.password = hashed;
            existing.name = name;
            await existing.save();
            console.log('User updated successfully');
        } else {
            console.log('Creating new user...');
            const hashed = await bcrypt.hash(password, 12);
            await User.create({
                name,
                email,
                password: hashed
            });
            console.log('User created successfully');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createUser();
