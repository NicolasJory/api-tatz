const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message:'GET artist'
    });
});

router.post('/', (req, res, next) => {
    const artist = {
        artistName: req.body.artistName,
        artistlName:req.body.artistlName
    };
    res.status(201).json({
        message:'POST artist',
        artist: artist
    });
});

router.get('/:artistId', (req, res, next) => {
    const id = req.params.artistId;
    res.status(200).json({
        id: "get artist " + id
    });
});

router.patch('/:artistId', (req, res, next) => {
    const id = req.params.artistId;
    res.status(200).json({
        id: "updated artist " + id
    });
});

router.delete('/:artistId', (req, res, next) => {
    const id = req.params.artistId;
    res.status(200).json({
        id: "delete artist "+ id
    });
});

module.exports = router;