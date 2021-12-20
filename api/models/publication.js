const mongoose = require('mongoose');

const publicationSchema = mongoose.Schema({
    artistId: {type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    mediaUrl: {type:String}
});

module.exports = mongoose.model('Publication', publicationSchema);