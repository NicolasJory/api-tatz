const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
    artistId: {type: mongoose.Schema.Types.ObjectId, ref: 'Artist'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    // studioId: {type: mongoose.Schema.Types.ObjectId, ref: 'Studio'},
    publicationId: {type: mongoose.Schema.Types.ObjectId, ref: 'Publication'},
    // flashId: {type: mongoose.Schema.Types.ObjectId, ref: 'Flash'},
    mediaUrl: {type:String}
});

module.exports = mongoose.model('Media', mediaSchema);