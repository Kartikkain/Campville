const express=require("express");
const router=express.Router();
const passport=require("passport");
const wrapAsync=require("../util/wrapAsync");
const ExpressError=require("../util/ExpressError")
const User=require("../models/user");


router.get('/register',wrapAsync(async(req,res,next)=>{
    res.render("register/register.ejs");
}))

router.post('/register',wrapAsync(async(req,res,next)=>{
    try{

        const  {username,email,password}=req.body;
        const user=await new User({email,username});
        const newUser=await User.register(user,password);
        req.login(newUser,err=>{
            if(err) return next(err);
            req.flash('success',"You are Successfully register")
            res.redirect('/camps');

        })
    }catch(e){
        req.flash('error',e.message);
        res.redirect("/register");
}
    
}))

router.get('/login',(req,res)=>{
    res.render("register/login.ejs")
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success',"you are successfully login");
    const urlRedirect=req.session.returnTo || '/camps'
    delete req.session.returnTo;
    res.redirect(urlRedirect);
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"Good bye");
    res.redirect('/');
})

module.exports=router;