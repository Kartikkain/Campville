const campGrounds=require("../models/campgrounds");
const reviews=require("../models/review");

module.exports.isLogin=(req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error',"you must be login first");
        return res.redirect('/login');
    }
    next();
}


module.exports.isAuthor= async(req,res,next)=>{
    const { id } = req.params;
    const camps=await campGrounds.findById(id);
    if(!camps.owner.equals(req.user._id)){
        req.flash('error',"You are not authorize !");
       return res.redirect(`/camps/${id}`);


    }
    next();
}


module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const foundReview=await reviews.findById(reviewId);
    if(!foundReview.author.equals(req.user._id))
    {
        req.flash('error',"you are not authorize !");
        return res.redirect(`/camps/${id}`);
    }
    next();

}

