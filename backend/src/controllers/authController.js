import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { isEmail, normalizeEmail, optionalString } from '../utils/validators.js';

export const MIN_PASSWORD_LENGTH = 12;

const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
});

export const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body ?? {};
        if (!isEmail(email) || typeof password !== 'string') {
            return res.status(400).json({ error: "A valid email and a password are required" });
        }
        if (password.length < MIN_PASSWORD_LENGTH || password.length > 72) {
            return res.status(400).json({ error: `Password must be ${MIN_PASSWORD_LENGTH}-72 characters` });
        }
        if (!optionalString(first_name, 100) || !optionalString(last_name, 100)) {
            return res.status(400).json({ error: "Name is too long" });
        }
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            first_name,
            last_name
        });
        return res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user.id),
            user: publicUser(user)
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await User.findOne({ where: { email: normalizeEmail(email) } });
        const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        return res.json({
            message: "Login successful",
            token: generateToken(user.id),
            user: publicUser(user)
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
