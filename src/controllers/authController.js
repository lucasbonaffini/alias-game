require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { signToken } = require("../utils/jwt");

const createAdminController = async (req, res) => {
  
  const { username, password } = req.body;

  if(username === "" || password === "") {
     return res.status(401).json({ message: "The fields must have a value !" });

  }else if(typeof(username) !== "string" || typeof(password) !== "string") {
    return res.status(401).json({ message: "The fileds must be a string !" });

  }else {

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(401).json({ message: 'User already exists' });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newAdmin = new User({
      username,
      password: hashedPassword,
      role: 'admin'
    });
  
    await newAdmin.save();
  
    const token = signToken(
      { id: newAdmin._id, username: newAdmin.username },
      process.env.JWT_SECRET,
      "1h",
    );
  
    return res.status(201).json({
      message: 'Admin created successfully',
      _id: newAdmin._id,
      username: newAdmin.username,
      gamesPlayed: newAdmin.gamesPlayed,
      gamesWon: newAdmin.gamesWon,
      currentGame: newAdmin.currentGame,
      team: newAdmin.team,
      role: newAdmin.role,
      adminToken: token
    });

  }

};

const loginUserController = async (req, res) => {

  const { username, password } = req.body;

  if(username === "" || password === "") {
    return res.status(401).json({ message: "The fields must have a value !" });

  }else if(typeof(username) !== "string" || typeof(password) !== "string") {
    return res.status(401).json({ message: "The fileds must be a string !" });

  }else {

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = signToken(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      "1h",
    );

    res.status(200).json({ message: "Logged in", token, id: user._id });
  }

};

const findUserById = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    throw new Error("Database error: " + error.message);
  }
};

module.exports = {
  createAdminController,  
  loginUserController, 
  findUserById
};
