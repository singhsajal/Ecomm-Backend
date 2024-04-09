//const asyncHandler = require("../utils/asyncHandler")
const express = require("express")
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken")
const app = express()
app.use(express.json())
const users = require("../models/users_models")


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await users.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // console.log("refresh Token", refreshToken)
        // console.log("access Token", accessToken)

        return { accessToken, refreshToken }

    } catch (error) {
        console.log(" unable to generate access token ")
    }

}

const registerUser = async (req, res) => {


    try {
        const { userName, email, password, confirmPassword, gender } = req.body// destructur  the request 
        console.log("user ", userName)
        console.log("email", email)
        console.log("pasword", password)
        console.log("confirmPassword", confirmPassword)

        if (!userName || !email || !password || !confirmPassword || !gender) {
            return res.send("Provide all information")
        }

        if (!(confirmPassword == password)) {
            return res.send(" confirm password failed ")
        }

        const existedData = await users.findOne({ userName })// check if user is already present or not 
        console.log("existed data ", existedData)
        if (existedData) {
            return res.send("user already exist ")  // send error if user already present
        }

        const user = await users.create({
            userName,
            email,
            gender,
            password
        }) // store user in db 
        user ? res.send(user) : console.log("not good") // send response after saving data in db 
        // res.send(req.body)
        return res.status(200).json({ success: true, mesage: "", data: user })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: [] })
    }
}

const loginUser = async (req, res) => {

    try {
        const { userName, email, password } = req.body
        console.log(req.body)

        if (!userName || !email || !password) {
            return res.json({ success: false, message: "Provide all details" })
        }

        const user = await users.findOne({ userName })
        console.log(user._id)

        if (!user) {
            return res.send(" user not found")
        }

        const { accessToken, refreshToken } = await
            generateAccessAndRefreshToken(user._id)



        const loggedInUser = await users.findById(user._id).select("-password")

        // console.log(loggedInUser)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(

                200,
                {
                    user: loggedInUser, accessToken, refreshToken,
                    message: "User logged In Successfully"
                },

            )

        // if (loggedInUser) {
        //     return res.send(user)
        // }

        // if (user.userName == userName) {
        //     console.log(user.userName)
        //     return res.send(user)
        // }



    } catch (error) {
        return res.status(402).json({ message: " something went wrong " })
    }
}

const logout = async (req, res) => {

    try {
        const { userName } = req.body
        const user = await users.findOne({ userName })

        await users.findByIdAndUpdate(
            user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(

                200,
                {

                    message: "User logged out Successfully"
                },

            )


    } catch (error) {
        return res.status(402).json({ message: " something went wrong while logging out " })
    }
}

const refreshAccessToken = (async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await users.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = (async (req, res) => {

    const { oldPassword, newPassword } = req.body
    const user = await users.findById(req.user?._id)
    const isPasswordCorrect = await isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, " Invalid Old Password ")
    }

    user.password = newPassword
    await user.save({ validBeforeSave: false })
    return res
})

const getcurrentUser = (async (req, res) => {

    return res.status(200).json(200, req.user, "current user fetch successfully")
})

const updateAccountDetails = (async (req, res) => {

    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, " All fields are requires ")
    }

    const user = await users.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        }, { new: true }).select("-password")

    return res.status(200).json(new ApiResponse(200, user, " Accout details Updated Successfully "))

})

const femaleCount = async (req, res) => {
    try {

        // const pipeline = [
        //     {
        //         $group: {
        //             _id: "$gender",
        //             count: {
        //                 $sum: 1
        //             }
        //         }
        //     }
        // ];

        const pipeline = [
            {
                $match: {
                    gender: "male" // Filter documents where gender is female
                }
            },
            {
                $group: {
                    _id: null, // We don't need to group by gender since we're filtering by female
                    count: {
                        $sum: 1 // Count the documents
                    }
                }
            }
        ];

        const result = await users.aggregate(pipeline);
        console.log(result)
        res.send(result[0])

    } catch (error) {

    }
}



module.exports = { registerUser, loginUser, logout, refreshAccessToken, changeCurrentPassword, updateAccountDetails, getcurrentUser, femaleCount }

























// const users = require("../models/user_models")
// const ApiError = require("../utils/ApiError")
// const { ApiResponse } = require("../utils/ApiResponse")
// const uploadOnCloudinary = require("../utils/cloudinary")
// const generateAccessAndRefereshTokens = async (userId) => {
//     try {
//         const user = await users.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()

//         user.refreshToken = refreshToken
//         await user.save({ validateBeforeSave: false })

//         return { accessToken, refreshToken }


//     } catch (error) {
//         throw new ApiError(500, "Something went wrong while generating referesh and access token")
//     }
// }

// const registerUser = async (req, res) => {
//     try {

//         let avatarLocalPath;
//         let coverImageLocalPath;


//         if (req.files.avatarLocalPath[0].path != undefined) {
//             avatarLocalPath = req.files.avatarLocalPath[0].path;
//             avatarLocalPath = avatarLocalPath.split('/')
//             avatarLocalPath = avatarLocalPath[1] + '/' + avatarLocalPath[2]
//         }
//         if (req.files.coverImageLocalPath[0].path != undefined) {
//             coverImageLocalPath = req.files.coverImageLocalPath[0].path;
//             coverImageLocalPath = coverImageLocalPath.split('/')
//             coverImageLocalPath = coverImageLocalPath[1] + '/' + coverImageLocalPath[2]
//         }



//     } catch (error) {

//     }
// }

// // const registerUser = asyncHandler(async (req, res) => {
// //     // res.status(400).send({
// //     //     message: "ok"
// //     // })

// //     // res.status(200).json({
// //     //     message: "ok"
// //     // })
// //     const { fullName, email, username, password } = req.body // destructure the request
// //     console.log(email)

// //     const existedUser = await users.findOne({
// //         $or: [{ username }, { email }]
// //     })
// //     if (existedUser) {
// //         return res.status(409).send("User with email or username already exist")
// //     }

// //     console.log("files", req.files);

// //     // const avatarLocalPath = req.files?.avatar[0]?.path;
// //     // console.log("avatar", avatarLocalPath)
// //     // //const coverImageLocalPath = req.files?.coverImage[0]?.path;

// //     // let coverImageLocalPath;
// //     // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
// //     //     coverImageLocalPath = req.files.coverImage[0].path
// //     // }


// //     // if (!avatarLocalPath) {
// //     //     throw new ApiError(400, "Avatar file is required")
// //     // }

// //     // const avatar = await uploadOnCloudinary(avatarLocalPath)
// //     // const coverImage = await uploadOnCloudinary(coverImageLocalPath)

// //     // if (!avatar) {
// //     //     throw new ApiError(400, "Avatar file is required")
// //     // }


// //     const user = await users.create({
// //         fullName,
// //         // avatar: avatar.url,
// //         // coverImage: coverImage?.url || "",
// //         email,
// //         password,
// //         username: username.toLowerCase()
// //     })

// //     const createdUser = await users.findById(user._id).select(
// //         "-password -refreshToken"
// //     )

// //     if (!createdUser) {
// //         throw new ApiError(500, "Something went wrong while registering the user")
// //     }
// //     console.log(createdUser)

// //     return res.status(201).json(
// //         // new ApiResponse(200, createdUser, "User registered Successfully")
// //         "user regisered successful"
// //     )
// // })

// const loginUser = asyncHandler(async (req, res) => {
//     // req body -> data
//     // username or email
//     //find the user
//     //password check
//     //access and referesh token
//     //send cookie

//     const { email, username, password } = req.body
//     console.log(email);

//     if (!username && !email) {
//         throw new ApiError(400, "username or email is required")
//     }

//     // Here is an alternative of above code based on logic discussed in video:
//     // if (!(username || email)) {
//     //     throw new ApiError(400, "username or email is required")

//     // }

//     const user = await users.findOne({
//         $or: [{ username }, { email }]
//     })

//     if (!user) {
//         throw new ApiError(404, "User does not exist")
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password)

//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid user credentials")
//     }

//     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

//     const loggedInUser = await users.findById(user._id).select("-password -refreshToken")

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     user: loggedInUser, accessToken, refreshToken
//                 },
//                 "User logged In Successfully"
//             )
//         )

// })

// const logoutUser = asyncHandler(async (req, res) => {
//     await users.findByIdAndUpdate(
//         req.user._id,
//         {
//             $unset: {
//                 refreshToken: 1 // this removes the field from document
//             }
//         },
//         {
//             new: true
//         }
//     )

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//         .status(200)
//         .clearCookie("accessToken", options)
//         .clearCookie("refreshToken", options)
//         .json(new ApiResponse(200, {}, "User logged Out"))
// })

// const refreshAccessToken = asyncHandler(async (req, res) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

//     if (!incomingRefreshToken) {
//         throw new ApiError(401, "unauthorized request")
//     }

//     try {
//         const decodedToken = jwt.verify(
//             incomingRefreshToken,
//             process.env.REFRESH_TOKEN_SECRET
//         )

//         const user = await users.findById(decodedToken?._id)

//         if (!user) {
//             throw new ApiError(401, "Invalid refresh token")
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(401, "Refresh token is expired or used")

//         }

//         const options = {
//             httpOnly: true,
//             secure: true
//         }

//         const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { accessToken, refreshToken: newRefreshToken },
//                     "Access token refreshed"
//                 )
//             )
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh token")
//     }

// })

// const changeCurrentPassword = asyncHandler(async (req, res) => {

//     const { oldPassword, newPassword } = req.body
//     const user = await users.findById(req.user?._id)
//     const isPasswordCorrect = await isPasswordCorrect(oldPassword)

//     if (!isPasswordCorrect) {
//         throw new ApiError(400, " Invalid Old Password ")
//     }

//     user.password = newPassword
//     await user.save({ validBeforeSave: false })
//     return res
// })

// const getcurrentUser = asyncHandler(async (req, res) => {

//     return res.status(200).json(200, req.user, "current user fetch successfully")
// })

// const updateAccountDetails = asyncHandler(async (req, res) => {

//     const { fullname, email } = req.body
//     if (!fullname || !email) {
//         throw new ApiError(400, " All fields are requires ")
//     }

//     const user = await users.findByIdAndUpdate(req.user?._id,
//         {
//             $set: {
//                 fullname: fullname,
//                 email: email
//             }
//         }, { new: true }).select("-password")

//     return res.status(200).json(new ApiResponse(200, user, " Accout details Updated Successfully "))

// })

// const updateUserAvatar = asyncHandler(async (req, res) => {

//     const avatarLocalPath = req.file?.path

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avaitar file is missing")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)

//     if (!avatar.url) {
//         throw new ApiError(400, 'Error while Uploading vatar on cloudnary')
//     }



// })







// module.exports = {
//     generateAccessAndRefereshTokens,
//     registerUser,
//     loginUser,
//     logoutUser,
//     refreshAccessToken,
//     changeCurrentPassword,
//     getcurrentUser,
//     updateAccountDetails,
//     updateUserAvatar
// };