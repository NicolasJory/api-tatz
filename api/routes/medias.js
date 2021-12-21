const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Media = require('../models/media');

router.get('/', (req, res, next) => {
    Media.find()
        .select('-__v')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                medias: docs.map(doc =>{
                    return {
                        id: doc._id,
                        artistId: doc.artistId,
                        userId:doc.userId,
                        studioId: doc.studioId,
                        publicationId: doc.publicationId,
                        flashId: doc.flashId,
                        mediaUrl: doc.mediaUrl,
                        request: {
                            type: "GET",
                            description:'GET_MEDIA',
                            url: 'http://localhost:3000/medias/'+ doc._id
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

router.get('/:mediaId', (req, res, next) => {
    const id = req.params.mediaId;
    Media.findById(id)
        .select('-__v')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    id: doc._id,
                    artistId: doc.artistId,
                    userId:doc.userId,
                    studioId: doc.studioId,
                    publicationId: doc.publicationId,
                    flashId: doc.flashId,
                    mediaUrl: doc.mediaUrl,
                    request:{
                        type: "GET",
                        description: "GET_ALL_MEDIAS",
                        url: "http://localhost:3000/medias"
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

router.patch('/:mediaId', (req, res, next) => {
    const id = req.params.mediaId;
    Media.findByIdAndUpdate(id, { $set: req.body }, { new: true})
      .then(result => {
          res.status(200).json({
            id: result._id,
            name: result.name,
            lName: result.lName,
                request:{
                    type: "GET",
                    description: "GET_UPDATED_ARTIST",
                    url: "http://localhost:3000/medias/" + result._id
                }
            });
        })
      .catch(err => {
          res.status(500).json({error: err})
        });
});

router.delete('/:mediaId', (req, res, next) => {
    const id = req.params.mediaId;
    Media.remove({ _id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "media deleted"
            });
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;