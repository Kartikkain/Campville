const express=require("express");
const router=express.Router();
const wrapAsync=require("../util/wrapAsync");
const ExpressError=require("../util/ExpressError");
const campGrounds=require("../models/campgrounds");
const {campgroundSchema}=require("../schemas.js");
const {isLogin,isAuthor}=require("../middleware/isLogin");
const {storage,cloudinary}=require("../cloudinary")
const multer  = require('multer')
const upload = multer({storage});
const mbxGeoCode=require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken=process.env.MAPBOX_TOKEN;
const geoCoder=mbxGeoCode({accessToken:mbxToken});



const validCampgrounds=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,msg);

    }
    else{
        next();
    }
}



router.get('/',wrapAsync(async (req,res)=>{
   
    const campList=await campGrounds.find({})
    res.render('Campground/home.ejs',{campList})
    
}))

router.get('/new',isLogin,(req,res)=>{
    res.render('Campground/new.ejs');
})

router.post('/',isLogin,upload.array('Image'),validCampgrounds,wrapAsync(async (req,res)=>{

    const geoData= await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
      })
      .send()
      const newcamp = new campGrounds(req.body.campground);
      newcamp.geometry=geoData.body.features[0].geometry;
      newcamp.Image=req.files.map(f=>({url:f.path,fileName:f.filename}));
      newcamp.owner=req.user._id;
     await newcamp.save();
     console.log(newcamp);
     req.flash('success',"You successfully created campground")
     res.redirect(`/camps/${newcamp._id}`);
}))


router.get('/:id',wrapAsync(async (req,res)=>{
    const {id}=req.params;
    const detail=await campGrounds.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
}).populate('owner');
    if(!detail){
    req.flash('error',"Not found")
    res.redirect('/camps');
    }
    res.render('Campground/show.ejs',{detail});
    
}))
router.get('/:id/edit',isLogin,isAuthor,wrapAsync(async (req,res)=>{
    const {id}=req.params;
    const replaceCamp=await campGrounds.findById(id);
    if(!replaceCamp){
        req.flash('error',"Not found")
        res.redirect('/camps');
        }
    res.render('Campground/replace.ejs',{replaceCamp});
}))
router.put('/:id',isAuthor,isLogin,upload.array('Image'),validCampgrounds,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const updatedCamp=await campGrounds.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,fileName:f.filename}));
    updatedCamp.Image.push(...imgs);
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImage){
            cloudinary.uploader.destroy(filename);
        }
        await updatedCamp.updateOne({$pull:{Image:{fileName:{$in: req.body.deleteImage}}}})
        
    }
    console.log(req.body);
    await updatedCamp.save()
    req.flash('success',"You successfully Updated campground")
    res.redirect(`/camps/${updatedCamp._id}`);
    
    
}))
router.delete('/:id',isAuthor,isLogin,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const deletedCamp=await campGrounds.findByIdAndDelete(id);
    req.flash('success',"You successfully Deleted campground")
    res.redirect('/camps');
}))


module.exports=router;