//require('dotenv').config();
const express = require('express')
require("./db/config")
const cors = require('cors')
const users = require("./db/users")
const jwt = require('jsonwebtoken')
const jwtKey = 'e-com'

const app = express();
app.use(express.json())
app.use(cors())

app.post("/signup", async (req, res) => {
    let user = new users(req.body)
    console.log(req.body)
    let result = await user.save();
    result = result.toObject();
    delete result.password
    res.send(result)
})

app.get("/list", verifyToken, async (req, res) => {
    let data = await users.find({ name: 'karan' })
    res.send(data)
})

app.post("/login", async (req, res) => {
    console.log(req.body)
    if (req.body.password && req.body.email) {
        let user = await users.findOne(req.body).select("-password");
        if (user) {
            jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                //res.send(user, { auth: token })

                if (err) {
                    res.send({ result: " Something went wrong " })
                }
                res.send({ user, auth: token })
            })
            //res.send(user)
        }
        else {
            res.send(" user not found ")
        }
    }


})

//============ Middleware for token authentication ==============

function verifyToken(req, res, next) {
    let token = req.headers['authentication'];
    if (token) {
        token = token.split(' ')[1];
        jwt.verify(token, jwtKey, (err, valid) => {

            if (err) {
                res.send({ result: "pleaae provide valid token " })
            } else {
                next()
            }
        })
    } else {
        res.send({ result: "Please add token" })
    }
    // console.log(" middleware called", token)
    // next()
}

app.listen(4500)

// require('dotenv').config();

// const express = require('express')
// const mongoose = require('mongoose')
// const Book = require("./models/books.js");

// const app = express()
// const PORT = process.env.PORT || 3000

// mongoose.set('strictQuery', false);
// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.log(error);
//         process.exit(1);
//     }
// }

// //Routes go here
// app.get('/', (req, res) => {
//     res.send({ title: 'Books' });
// })

// app.get('/books', async (req, res) => {

//     const book = await Book.find();

//     if (book) {
//         res.json(book)
//     } else {
//         res.send("Something went wrong.");
//     }

// });

// app.get('/add-note', async (req, res) => {
//     try {
//         await Book.insertMany([
//             {
//                 title: "Sons Of Anarchy",
//                 body: "Body text goes here...",
//             },
//             {
//                 title: "Games of Thrones",
//                 body: "Body text goes here...",
//             }
//         ]);
//         res.json({ "Data": "Added" })
//     } catch (error) {
//         console.log("err", + error);
//     }
// })

// //Connect to the database before listening
// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log("listening for requests");
//     })
// })