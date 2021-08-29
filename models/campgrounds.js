const mongoose=require("mongoose");
const Review = require("./review");
const Schema=mongoose.Schema;

const imageSchema= new Schema({
    url:String,
    fileName:String

})

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const campgroundSchema=new Schema({
    name:String,
    price:Number,
    Image:[imageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }

    },
    description:String,
    location:String,
    reviews:[{
    
        type:Schema.Types.ObjectId,
        ref:'Review'

    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }

},opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<h3>${this.name}</h3><p><small>${this.location}</small></p><a href="/camps/${this._id}">view</a>`
})

campgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{$in:doc.reviews}
        })
    }

})

module.exports=mongoose.model('Campground',campgroundSchema);
