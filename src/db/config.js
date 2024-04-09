const mongoose = require('mongoose')

const Mongo = process.env.MONGO_URI
//mongoose.connect("mongodb://localhost:27017/myntra_clone")

// mongoose.connect("mongodb+srv://singhsajal920:EivpkB2EnsbEdMqI@cluster0.o7tvndb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const connectDB = async () => {
    try {
        const instance = await mongoose.connect(Mongo)
        console.log("success", instance.connection.host)
    } catch (error) {
        console.log("ERROR", error)
    }
}



// try {
//     await mongoose.connect(`${process.env.MONGO_URI}`)
//     console.log("success")
// } catch (error) {
//     console.log("ERROR", error)
// }
//}



module.exports = connectDB;