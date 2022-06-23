if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
console.log('xxxx',process.env.SECRET)

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride= require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// const MongoDBStore = require("connect-mongo");
const MongoDBStore = require("connect-mongo")(session);
//const dbUrl = process.env.DB_URL;
  const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
//'mongodb://localhost:27017/yelp-camp'

// console.log('hey', new MongoDBStore(session))

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("DATABASE CONNECTED");
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());
 
const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR!!",e);
})



const sessionConfig = {
     store,
     name: 'session',
     secret,
     resave: false,
     saveUnintialized: true,
     cookie:{
         httpOnly: true,
         //secure: true,
         expires: Date.now() + 1000*60*60*24*7,
         maxAge: 1000*60*60*24*7
     }
 }
 app.use(session(sessionConfig));
 app.use(flash());
 
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 app.use((req,res,next)=>{
    console.log(req.query);
     res.locals.currentUser = req.user;
     res.locals.success = req.flash('success');
     res.locals.error = req.flash('error');
     next();
 })

 app.get('/fakeUser', async (req,res)=>{
    const user = new User({email: 'Prats@gmail.com', username: 'Pratyush'})
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
 })

app.get('/',(req,res)=>{
    res.render('home');
})
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/makeCampground', async(req,res)=>{
    const camp = new Campground({title: 'My Backyard',description:'Cheap Camping'});
    await camp.save();
    res.send(camp);
})


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found!!!!',404));
})
app.use((err,req,res,next)=>{
    const {statusCode=500, message = 'Something went wrong'} = err;
    if(!err.message) err.message='Something went wrong!!!';
    res.status(statusCode).render('error',{ err });
})


app.listen(3000,()=>{
   console.log("Serving on port 3000")
})