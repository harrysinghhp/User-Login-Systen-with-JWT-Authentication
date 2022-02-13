const bcrypt= require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Mongoose Schema
const user = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokens: [{ token: { type: String } }]
})

// Generate Token
user.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id:this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
}

// Password Hashing
user.pre("save", async function (next) {
    if (this.isModified("password")) { this.password = await bcrypt.hash(this.password, 10) }
    next();
})

module.exports = mongoose.model("user", user)