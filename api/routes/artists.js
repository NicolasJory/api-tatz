const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Artist = require('../models/artist');

router.get('/', (req, res, next) => {
    Artist.find()
        .select('-__v')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                artists: docs.map(doc =>{
                    return {
                        id: doc._id,
                        name: doc.name,
                        lName: doc.lName,
                        request: {
                            type: "GET",
                            description:'GET_ARTIST',
                            url: 'http://localhost:3000/artists/'+ doc._id
                        }
                    }
                    
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.post('/', (req, res, next) => {
    const artist = new Artist({
        name: req.body.name,
        lName: req.body.lName
    });
    artist.save()
        .then(result => {
            res.status(201).json({
                id: result._id,
                name: result.name,
                lName: result.lName,
                request:{
                    type: "GET",
                    description:'GET_CREATED_ARTIST',
                    url: 'http://localhost:3000/artists/'+ result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
    
});

router.get('/:artistId', (req, res, next) => {
    const id = req.params.artistId;
    Artist.findById(id)
        .select('-__v')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    id: doc._id,
                    name: doc.name,
                    lName: doc.lName,
                    request:{
                        type: "GET",
                        description: "GET_ALL_ARTIST",
                        url: "http://localhost:3000/artists"
                    }
                });
            } else {
                res.status(404).json({message : "Value not found"});
            }      
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:artistId', (req, res, next) => {
    const id = req.params.artistId;
    Artist.findByIdAndUpdate(id, { $set: req.body }, { new: true})
      .then(result => {
          res.status(200).json({
            id: result._id,
            name: result.name,
            lName: result.lName,
                request:{
                    type: "GET",
                    description: "GET_UPDATED_ARTIST",
                    url: "http://localhost:3000/artists/" + result._id
                }
            });
        })
      .catch(err => {
          res.status(500).json({error: err})
        });
});

router.delete('/:artistId', (req, res, next) => {
    const id = req.params.artistId;
    Artist.remove({ _id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "artist deleted"
            });
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;