if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}


const express=require("express");
const path=require("path");
const app=express();
const mongoose=require("mongoose");
const campgrounds=require("./routes/campground");
const reviews=require("./routes/review");
const userRouter=require("./routes/users");
const Joi=require("joi");
const flash=require("connect-flash");
const ejsMate=require("ejs-mate");
const ExpressError=require("./util/ExpressError");
const methodOverride=require("method-override");
const { Cookie } = require("express-session");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user");
const mongoSanitize =require("express-mongo-sanitize");
const helmet=require("helmet");
const session=require("express-session");
const MongoDBStore = require("connect-mongo");
const dbUrl=process.env.MONGO_DB_URL;
const localUrl='mongodb://localhost:27017/yelpCamp';

mongoose.connect(dbUrl || localUrl, {useNewUrlParser: true,useCreateIndex:true,useUnifiedTopology:true,useFindAndModify:false});
const db=mongoose.connection;
db.on('error', console.error.bind(console,"connection error"));
db.once('open',()=>{
    console.log("Database is connected");
});

app.engine('ejs',ejsMate);
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
const Secret=process.env.SECRET;

const store=  MongoDBStore.create({
    mongoUrl:dbUrl || localUrl,
    secret:Secret|| 'Thisthesecret',
    touchAfter:24*60*60
});

store.on("error",function(e){
    console.log("Session error",e);
})
const sessionConfig={
    store,
    name:'session',
    secret: Secret || 'Thisthesecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+ 1000*60*60*24*7,
        maxAge:1000*60*60*24*7

    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://getbootstrap.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddsytdpy4/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(mongoSanitize({replaceWith: '_',}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentPerson=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    
    next();

})



app.use('/camps',campgrounds);
app.use('/camps/:id/reviews',reviews);
app.use('/',userRouter);
app.use(express.static(path.join(__dirname,'public')));




app.get('/',(req,res)=>{
    res.render('Campground/display.ejs');
})








app.all('*',(req,res,next)=>{
next(new ExpressError(404,"Page not found"));
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)err.message="something went wrong";
    res.status(statusCode).render('error.ejs',{err});
})
app.listen(8080,()=>{
    console.log("Server is started");
})