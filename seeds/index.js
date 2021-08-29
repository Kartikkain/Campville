const mongoose=require("mongoose");
const campGrounds=require("../models/campgrounds");
const cities=require("./cities");
const {descriptors,places}=require("./seedHelper");

mongoose.connect('mongodb://localhost:27017/yelpCamp', {useNewUrlParser: true,useCreateIndex:true,useUnifiedTopology:true});
const db=mongoose.connection;
db.on('error', console.error.bind(console,"connection error"));
db.once('open',()=>{
    console.log("Database is connected");
});
const camp=array=>array[Math.floor(Math.random()*array.length)]

const seedDB=async()=>{
    await campGrounds.deleteMany({});

    for(let i=0;i<500;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*50)+10;
        const newCamp=new campGrounds({
            owner:'612668507a8fe139684c77e9',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            name:`${camp(descriptors)} ${camp(places)}`,
            price,
            description:"qwertyuioplkjhgfdsazxcvbnm",
            geometry:{
                type:'Point',
                coordinates:[cities[random1000].longitude,
                 cities[random1000].latitude
                ]
            },
            Image:[
                {
                    url:'https://res.cloudinary.com/ddsytdpy4/image/upload/v1630052350/yelpCamp/gyuqpgv3tv3odsjnxwjt.jpg',
                    fileName:'yelpCamp/gyuqpgv3tv3odsjnxwjt'

                }
            ]
        })

        await newCamp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})