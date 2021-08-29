const BaseJoi=require("joi");
const sanitizeHTML = require("sanitize-html");

const extension=(joi)=>({
    type:'string',
    base:joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not contain HTML!'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean=sanitizeHTML(value,{
                    allowedTags:[],
                    allowedAttributes:{}
                });
                if(clean!==value)return helpers.error('string.escapeHTML',{value})
                return clean;
            }
        }
    }

});

const Joi=BaseJoi.extend(extension);

module.exports.campgroundSchema=Joi.object({
    campground:Joi.object({
        name:Joi.string().required().escapeHTML(),
        price:Joi.number().required().min(0),
        //Image:Joi.string().required(),
        description:Joi.string().required().escapeHTML(),
        location:Joi.string().required().escapeHTML()
        

    }).required(),
    deleteImage:Joi.array()
    
})

module.exports.reviewSchema=Joi.object({
     review:Joi.object({
         rBody:Joi.string().required().escapeHTML(),
         rating:Joi.number().required().min(1).max(5)
     }).required()
})