const mongoose = require('mongoose');

const artistSchema = mongoose.Schema({
    name: {type: String, required: true},
    lName: {type: String, required: true}
});

module.exports = mongoose.model('Artist', artistSchema);