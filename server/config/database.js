const mongoose = require('mongoose');
const { startCronJob } = require('../cron/cron');
/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * @returns {Promise<void>} Resolves when the connection is successful, or exits the process on failure.
 * @throws {Error} If the connection fails due to invalid URI or server issues.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        startCronJob(); // Start the cron job after successful 
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;