const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!!!");
});

function randnum(arr) {
    return Math.floor(Math.random() * arr.length);
}

const seedBD = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        var location_num = randnum(cities);
        var des_num = randnum(descriptors);
        var places_num = randnum(places);
        const price = Math.floor(Math.random() * 20) + 10;
        var camp = new Campground({
            author:'6127e2cde2f97c3b10c40722',
            location: `${cities[location_num].city} ${cities[location_num].state}`,
            title: `${descriptors[des_num]} ${places[places_num]}`,
            description: '',
            price,
            geometry: {
                type:"Point",
                coordinates:[
                    cities[location_num].longitude,
                    cities[location_num].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/djvh6y0zv/image/upload/v1630622406/YelpCamp/goutham-krishna-lITrCLM6hHc-unsplash_uhs19u.jpg',
                    filename: 'YelpCamp/goutham-krishna-lITrCLM6hHc-unsplash_uhs19u'
                },
                {
                    url: 'https://res.cloudinary.com/djvh6y0zv/image/upload/v1630622348/YelpCamp/tommy-lisbin-gvkdncTaZu8-unsplash_jzpv6f.jpg',
                    filename: 'YelpCamp/tommy-lisbin-gvkdncTaZu8-unsplash_jzpv6f'
                }
            ]
        })
        await camp.save()
        console.log(`${cities[location_num].city} ${cities[location_num].state}`)
        console.log(`${descriptors[des_num]} ${places[places_num]}`)
        console.log(' ')
    }
}

seedBD().then(() => {
    console.log("SAVE compelete!! Connection Close!")
    mongoose.connection.close()
});