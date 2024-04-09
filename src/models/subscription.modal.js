const mongoose = require("mongoose")
const { schema } = require("./user_models")

const subscriptionSchema = new schema({

    subscriber:{
        type: schema.Types.ObjectId,//one who is subscribing 
        ref:"user"

    },
    channel:{
        type: schema.Types.ObjectId,//one who subscriber is subscribing 
        ref:"user"

    }
})

module.exports = mongoose.model("Subscription", subscriptionSchema)