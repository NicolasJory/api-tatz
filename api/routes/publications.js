const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {upload,bucket,format} = require('../config/storage.js');

const Publication = require('../models/publication');
const Media = require('../models/media');

router.post('/', upload.single('file'), (req, res, next) => {

    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    const blob = bucket.file(Date.now()+'_'+req.body.title+'_'+req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream.on('error', err => {
      next(err);
    });
    blobStream.end(req.file.buffer);


    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    const publication = new Publication({
        title: req.body.title,
        description: req.body.description,
        artistId: req.body.artistId,
    });
    
    publication.save()
        .then(result => {
          const media = new Media({
            mediaUrl: publicUrl,
            publicationId: result._id
          });
          media.save()
          res.status(201).json({
                id: result._id,
                title: result.title,
                description: result.description,
                artistId: result.artistId,
                media:
                  {
                    mediaId:media._id,
                    url: media.mediaUrl,
                    publicationId:media.publicationId,
                  },
                request:[
                    {
                        type: "GET",
                        description:'GET_CREATED_PUBLICATION',
                        url: 'http://localhost:3000/publications/'+ result._id
                    },
                    {
                        type: "GET",
                        description:'GET_PUBLICATION_S_ARTIST',
                        url: 'http://localhost:3000/artists/'+ result.artistId
                    }
                ]
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
      });

router.get('/', (req, res, next) => {
    Publication.find()
        .select('-__v')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                publications: docs.map(doc =>{
                    return {
                        id: doc._id,
                        title: doc.title,
                        description: doc.description,
                        mediaUrl: doc.mediaUrl,
                        request: {
                            type: "GET",
                            description:'GET_PUBLICATIONS',
                            url: 'http://localhost:3000/publications/'+ doc._id
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

router.get('/:publicationId', (req, res, next) => {
    const id = req.params.publicationId;
    Publication.findById(id)
        .select('-__v')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    id: doc._id,
                    artistId: doc.artistId,
                    title: doc.name,
                    description: doc.lName,
                    mediaUrl: doc.mediaUrl,
                    request:{
                        type: "GET",
                        description: "GET_ALL_PUBLICATIONS",
                        url: "http://localhost:3000/publications"
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


router.delete('/:publicationId', (req, res, next) => {
    const id = req.params.publicationId;
    Publication.remove({ _id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "publications deleted"
            });
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

module.exports = router;