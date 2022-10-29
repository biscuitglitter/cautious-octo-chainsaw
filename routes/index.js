const express = require("express")
const User = require("../models/user")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const router = express.Router()
const ObjectId = require("mongodb").ObjectId;

router.get("/sign-up", (req, res) => {
    if (req.user) {
        console.log("logged in, in sign up")
        console.log(req.user + "is now logged in")
    } else {
        console.log("not logged in, sign up")
    }
    res.render("sign-up")
})

router.post("/sign-up", async (req, res, next) => {
    const body = req.body
    const user = new User(body)

    user.username = body.username
    user.firstName = body.firstName
    user.lastName = body.lastName
    user.password = body.password
    user.membershipStatus = false
    user.accessCode = (Math.random() * (254576 - 22) + 258).toString().substring(0, 4)
    user.save(err => {
        if (err) {
            return next(err)
        }
        res.redirect("/")
    })
})

passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) {
                return done(err)
            }
            if (!user) {
                return done(null, false, { message: "Incorrect username" })
            }
            if (user.password !== password) {
                return done(null, false, { message: "Incorrect password" })
            }
            return done(null, user)
        })
    })
)

router.use(function (req, res, next) {
    res.locals.currentUser = req.user
    next()
})

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user)
    })
})

router.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/members-area",
        failureRedirect: "/"
    })
)

router.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        res.redirect("/")
    })
})

router.get("/members-area", (req, res) => {
    res.render("members-area", { user: req.user })
})

router.get("/members-access", (req, res) => {
    res.render("members-access", { user: req.user })
})

router.post("/members-access", async (req, res) => {
    const id = req.user.id;
    const accessCode = req.user.accessCode

    if (req.body.accessCode && req.body.accessCode === accessCode) {
        User.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { membershipStatus: true } }, { new: true }, (error) => {
            // if (error) {
            //     console.log("we have an error")
            // } else {
            //     console.log("it's a match!")
            // }
        })
    }
    res.render("members-access", { user: req.user })
})

module.exports = router;

    