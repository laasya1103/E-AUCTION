const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		mongoose.set('strictQuery', false);
mongoose.Promise = global.Promise
mongoose.Promise = global.Promise
const mongouri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auction'

		await mongoose.connect(mongouri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("MongoDB Connected");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

module.exports = connectDB;
