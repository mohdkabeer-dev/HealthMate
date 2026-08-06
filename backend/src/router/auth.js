const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const validator = require('validator');

// 🔑 detect environment
const isProduction = process.env.NODE_ENV === "production";

/* ===================== SIGNUP ===================== */
authRouter.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be strong (min 8 chars, uppercase, number, symbol)"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.HASH_PASS));

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    // ✅ COOKIE FIXED (DEV + PROD)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,                 // false in localhost
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User signed up successfully",
      user: newUser
    });

  } catch (error) {
    console.error('Error during signup:', error.message);
    return res.status(500).json({ message: error.message });
  }
});


/* ===================== LOGIN ===================== */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found, signup first" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    // ✅ COOKIE FIXED (DEV + PROD)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user,
      token
    });

  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({
      message: "Error during login",
      error: error.message
    });
  }
});


/* ===================== LOGOUT ===================== */
authRouter.post('/logout', (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.error('Error during logout:', error.message);
    return res.status(500).json({
      message: "Error during logout",
      error: error.message
    });
  }
});

module.exports = {
  authRouter
};