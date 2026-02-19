import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error('Please define Mongo URI in local environment file')

let cached = (global as any).mongoose;

if (!cached) cached = (global as any).mongoose = { conn: null, promise: null }

export async function connectDB() {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        // Determine database name based on environment
        const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging' || process.env.VERCEL_ENV === 'preview';
        const dbName = isStaging ? 'event-booking-db-staging' : 'event-booking-db';

        console.log(`[MongoDB] Connecting to database: ${dbName} (env: ${process.env.NEXT_PUBLIC_ENV || process.env.VERCEL_ENV || 'development'})`);

        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName,
            bufferCommands: true,
            serverSelectionTimeoutMS: 20000
        }).then(m => {
            
            console.log(`[MongoDB] Successfully connected to ${dbName}`);
            cached.conn = m;
            return m;
        }).catch(error => {
            console.error("MongoDB connection error:", error);
            cached.promise = null;
            throw error;
        });
    }
    return await cached.promise;
}