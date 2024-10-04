const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
	const { username, email, password, confirmPassword, isOrganiser } = req.body; // Add isOrganiser from the request body
    console.log(isOrganiser)
	try {
		// Check if all required fields are filled
		if (!username || !email || !password || !confirmPassword) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Check if user already exists
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Check if passwords match
		if (password !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		// Hash the password before saving
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create the new user with the role (organiser or player)
		const user = await User.create({
			username,
			email,
			password: hashedPassword,
			organiser: isOrganiser  // if checkbox is checked, organiser is true; otherwise, false
		});

		// Respond with the created user information
		res.status(201).json({
			id: user._id,
			username: user.username,
			email: user.email,
			organiser: user.organiser
		});
	} catch (error) {
		// Handle any errors during the process
		res.status(500).json({ message: error.message });
	}
};


// const registerUser = async (req, res) => {
// 	const { username, email, password, confirmPassword } = req.body;

// 	try {
// 		if (!username || !email || !password || !confirmPassword) {
// 			return res.status(400).json({ message: "All fields are required" });
// 		}

// 		const userExists = await User.findOne({ email });

// 		if (userExists) {
// 			return res.status(400).json({ message: "User already exists" });
// 		}

// 		if (password !== confirmPassword) {
// 			return res.status(400).json({ message: "Passwords do not match" });
// 		}

// 		const salt = await bcrypt.genSalt(10);
// 		const hashedPassword = await bcrypt.hash(password, salt);

// 		const user = await User.create({
// 			username,
// 			email,
// 			password: hashedPassword,
// 		});

// 		res.status(201).json({
// 			id: user._id,
// 			username: user.username,
// 			email: user.email,
// 		});
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// };

const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		if (!email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const user = await User.findOne({ email });
		const Organiser = user.organiser ; 
		

		if (!user) {
			return res.status(400).json({ message: "User doesn't exist" });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Invalid password" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.cookie("jwt", token, {
			httpOnly: false,
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
			sameSite: "none",
			secure: true,
		});

		res.status(200).json({
			id: user._id,
			username: user.username,
			email: user.email,
			organiser: Organiser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

const getProfile = async (req, res) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.decode(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res.status(401).json({ message: "Invalid token" });
		}
		const { id } = decoded;

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			id: user._id,
			username: user.username,
			email: user.email,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const logoutUser = async (req, res) => {
	try {
		res.cookie("jwt", "", {
			httpOnly: false,
			secure: true,
			sameSite: "none",
			expires: new Date(0),
		});
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const getRole = async (req, res) => {
	try {
	   // Get user ID from the query parameters (or you can pass the email in the query if you prefer)
	   const { userId } = req.query;

	   // Fetch user by ID from the database
	   const user = await User.findById(userId).select('organiser'); // Fetch only the 'organiser' field

	   if (!user) {
		  return res.status(404).json({ message: "User not found" });
	   }

	   // Send back organiser status
	   res.status(200).json({ organiser: user.organiser });
	} catch (error) {
	   // Handle errors
	   res.status(500).json({ message: error.message });
	}
};

module.exports = {
	registerUser,
	loginUser,
	getProfile,
	logoutUser,
	getRole
};
