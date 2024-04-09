//require('dotenv').config({ path: './env' });
require('dotenv').config();
const mongoose = require("mongoose")
const express = require('express')
const bodyParser = require('body-parser');

const connectDB = require("./db/config");




// connect to db 
connectDB()
    .then(() => {
        app.listen(4500, () => {
            console.log(" Running on port 4500 ")
        })
    })
    .catch((error) => {
        console.log("MongoDb connection failed !!!", error)
    })




const cors = require('cors')
const users = require("./db/users")
const jwt = require('jsonwebtoken')
const jwtKey = 'e-com'
const cookieParser = require("cookie-parser");

const app = express();
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json({ limit: "16kb" }))// to acceptt the data in json format 
//app.use(express.urlencoded({ extended: true }))// to accept the data from url
app.use(express.static("public"))//to stor ethe file or folder in server
app.use(cookieParser())

app.use(cors())

// app.post("/signup", async (req, res) => {
//     let user = new users(req.body)
//     console.log(req.body)
//     let result = await user.save();
//     result = result.toObject();
//     delete result.password
//     res.send(result)
// })


const useRouter = require("./routes/user.routes");





app.use("/users", useRouter)

// app.get("/list", verifyToken, async (req, res) => {
//     //let data = await users.find({ name: 'pankaj' })
//     let data = await users.find()
//     res.send(data)
// })

// app.post("/login", async (req, res) => {
//     console.log(req.body)
//     if (req.body.password && req.body.email) {
//         let user = await users.findOne(req.body).select("-password");
//         if (user) {
//             jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
//                 //res.send(user, { auth: token })

//                 if (err) {
//                     res.send({ result: " Something went wrong " })
//                 }
//                 res.send({ user, auth: token })
//             })
//             //res.send(user)
//         }
//         else {
//             res.send(" user not found ")
//         }
//     }


// })

//============ Middleware for token authentication ==============

// function verifyToken(req, res, next) {
//     let token = req.headers['authentication'];
//     if (token) {
//         token = token.split(' ')[1];
//         jwt.verify(token, jwtKey, (err, valid) => {

//             if (err) {
//                 res.send({ result: "pleaae provide valid token " })
//             } else {
//                 next()
//             }
//         })
//     } else {
//         res.send({ result: "Please add token" })
//     }
// console.log(" middleware called", token)
// next()
//}

//app.listen(4500)

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