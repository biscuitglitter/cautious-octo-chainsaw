const mongoose = require("mongoose")
const Schema = mongoose.Schema

const messageSchema = new Schema({
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }
},
{ timestamps: { createdAt: "posted_on" } }
)

module.exports = mongoose.model("message", messageSchema)
