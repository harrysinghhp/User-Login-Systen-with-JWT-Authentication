const bcrypt= require("bcryptjs");
const express = require("express");
const route = new express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const User = require('../models/user');
const auth = require("../middleware/auth");
const { Router } = require("express");

// home route
route.get("/", (req, res) => {
    res.render("index");
})
// Secret Route
route.get("/secret", auth, (req, res) => {
    res.render("secret");
})
// Sign In Routes
route.get("/signin", (req, res) => {
    res.render("signin");
})

route.post("/signin", async (req, res) => {
    try {
        const pass = req.body.password;
        const cpass = req.body.re_pass;
        if (pass === cpass) {
            const user = new User(req.body);
            const token = await user.generateAuthToken();
            res.cookie("jwt", token, { expires: new Date(Date.now() + 60 * 1000), httpOnly: true });
            const saveuser = await user.save();
            res.render('login');
        } else { res.send(`Password and Confirm Password didn't match`) }
    } catch (error) { res.render("401") }
})

// Log In Routes
route.get("/login", async (req, res) => {
    res.render("login");
})

route.post("/login", async (req, res) => {
    try {
        const name = req.body.name;
        const password = req.body.pass;
    
        const findUser = await User.findOne({name:name});
        const matchPass = await bcrypt.compare(password, findUser.password);
        const token = await findUser.generateAuthToken();
        res.cookie("jwt", token, { expires: new Date(Date.now() + 60 * 1000), httpOnly: true });
        if(matchPass){
            res.render('secret');
        }else{res.send('invalid login details')}
    } catch (error) {
        res.send(error)
    }
  
})


// logout from sinle device
route.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((element) => { return element.token !== req.token })
        res.clearCookie("jwt");
        await req.user.save();;
        res.render("index")
    } catch (error) { res.send(error) }
})


// logout from all device
route.get("/logoutall", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        res.clearCookie("jwt");
        await req.user.save();;
        res.render("login")
    } catch (error) { res.send(error) }
})

route.get("*", (req,res)=>{ res.render("404")});
module.exports = route;
