const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String
        },
        confirmPassword: {
            type: String
        },
        refreshToken: {
            type: String
        },
        gender: {
            type: String
        }
    }, { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    this.confirmPassword = await bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        }, process.env.ACCESS_TOKEN_EXPIRY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}


// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password)
// }





module.exports = mongoose.model("User", userSchema)













// const userSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     fullname: {
//         type: String,
//         required: false,
//         trim: true,
//         index: true
//     },
//     avatar: {
//         type: String, // cloudnary url
//         required: false,

//     },
//     coverImage: {
//         type: String,
//         required: false,

//     },
//     //watchHistory: [
//     //     {
//     //         type: Schema.Types.ObjectId, // provide refrence to the video modal
//     //         ref: "video"
//     //     }
//     // ],
//     // password: {
//     //     type: String,
//     //     required: [true, 'Password is required ']
//     // },
//     refreshToken: {
//         type: String
//     }



// }, { timestamps: true })

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     this.password = await bcrypt.hash(this.password, 10)
//     next()
// })

// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password)
// }

// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//             email: this.email,
//             username: this.username,
//             fullName: this.fullName
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }
// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,

//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }


// //export const User = mongoose.modelNames("User", userSchema)
// // another way to export
// module.exports = mongoose.model("User", userSchema) 