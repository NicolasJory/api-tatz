const mongoose = require('mongoose');

const publicationSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    description: {type: String, required: true}
});

module.exports = mongoose.model('Publication', publicationSchema);