const express = require("express")
const path = require("path")
const session = require("express-session")
const passport = require("passport")
const mongoose = require("mongoose")

require("dotenv").config()

const mongoDb = process.env.MONGO_API_KEY
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true })
const db = mongoose.connection
db.on("error", console.error.bind(console, "mongo connection error"));

// const cleanDB = async () => {
//     await db.collection("users").deleteMany({})
// }
// cleanDB()

const app = express()

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

let secret = process.env.KEY_SECRET

app.use(session({ secret: secret, resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: false }))

app.get("/", (req, res) => {
    res.render("index", { user: req.user })
})

const indexRouter = require("./routes/index")
app.use("/", indexRouter)

app.use(express.static(__dirname + "../views"));

/** Catch and return custom errors */
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

app.listen(5000)