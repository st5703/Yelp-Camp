const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {

    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });

}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;  
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    // console.log(campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground is not exist!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}


module.exports.renderShowCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Campground is not exist!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}


module.exports.updateCampground = async (req, res, next) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    campground.geometry = geoData.body.features[0].geometry;  
    campground.location = req.body.campground.location;
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    for (let img of campground.images){
        var file = img.filename;
        await cloudinary.uploader.destroy(file);
    }
    
    await Campground.findByIdAndDelete(id);
    
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}