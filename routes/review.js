const express=require("express");
const router=express.Router({mergeParams:true});
const review=require("../models/review");
const campGrounds=require("../models/campgrounds");
const wrapAsync=require("../util/wrapAsync");
const ExpressError=require("../util/ExpressError");
const {reviewSchema}=require("../schemas.js");
const {isLogin,isReviewAuthor}=require("../middleware/isLogin");




const validreviews=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,msg);

    }
    else{
        next();
    }
}


router.post('/',isLogin,validreviews,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const campground=await campGrounds.findById(id);
    const newreview=new review(req.body.review);
    newreview.author=req.user._id;
    campground.reviews.push(newreview);
    await newreview.save();
    await campground.save();
    req.flash('success',"Your review is successfully submitted")
    res.redirect(`/camps/${campground._id}`);

}))
router.delete('/:reviewId',isLogin,isReviewAuthor,wrapAsync(async(req,res)=>{
    const {id,reviewId}=req.params;
    await campGrounds.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash('success',"Your review is deleted")
    res.redirect(`/camps/${id}`);
}))


module.exports=router;