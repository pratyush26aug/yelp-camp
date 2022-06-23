
const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '62aa82f4815888fa5992a258',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://p.bookcdn.com/data/Photos/Big/9543/954313/954313069/Parvati-Hill-Cottage-Chojh-Village-photos-Exterior-PARVATI-HILL-COTTAGE-CHOJH-VILLAGE.JPEG',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Beatae itaque deserunt optio cum in at reiciendis eum quis laboriosam sint facere a, molestiae ex! Maxime rem at ipsum. Earum, est!',
            price,
            geometry: {
                type: "Point",
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
               
        })
        console.log(camp.image)
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})