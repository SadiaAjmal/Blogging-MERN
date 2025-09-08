const { Schema, model } = require("mongoose");
const {
    randomBytes,
    createHmac
} = require("node:crypto");
const { createTokenForUser } = require("../services/auth");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,

    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: './images/default.jpg',
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
}, {
    timestamps: true,
});



//this is used to check wether entered password by user while signin is correct or not
userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");
    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");
    if (hashedPassword !== userProvidedHash) throw new Error("Password is incorrect");
    //return {...user, password: undefined, email: undefined };

    const token = createTokenForUser(user);
    return token;

})

//this is used to convert password into encrypted form
userSchema.pre("save", function(next) {
    const user = this;
    if (!user.isModified("password")) return;
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");
    this.salt = salt;
    this.password = hashedPassword;
    next();
});

const User = model('user', userSchema);

module.exports = User;