const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // ✅ Validate email format
    },    
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// ✅ Password Hashing
UserSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
