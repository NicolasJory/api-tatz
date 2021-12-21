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
                    id:media._id,
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
    Publication.aggregate([
            {
                $lookup: {
                    from:"media",
                    localField:"_id",
                    foreignField: "publicationId",
                    as: "media"
                }
            }
        ])       
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                publications: docs.map(doc =>{
                    return {
                        id: doc._id,
                        artistId: doc.artistId,
                        title: doc.title,
                        description: doc.description,
                        media: doc.media,
                        request: [{
                            type: "GET",
                            description:'GET_PUBLICATIONS',
                            url: 'http://localhost:3000/publications/'+ doc._id
                        },
                        {
                            type: "GET",
                            description:'GET_PUBLICATION_S_ARTIST',
                            url: 'http://localhost:3000/artists/'+ doc.artistId
                        }]

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
    Publication.aggregate([
            {
                $match : { _id: mongoose.Types.ObjectId(id)}
            },
            {
                $lookup: {
                    from:"media",
                    localField:"_id",
                    foreignField: "publicationId",
                    as: "media"
                }
            }
        ])    
        .exec()
        .then(docs => {
            //check if res != null, index[0] because aggregate returns an array of json
            if (docs[0]) {   
                res.status(200).json({
                    id: docs[0]._id,
                    title: docs[0].title,
                    description: docs[0].description,
                    request: [{
                        type: "GET",
                        description:'GET_ALL_PUBLICATIONS',
                        url: 'http://localhost:3000/publications'
                    },
                    {
                        type: "GET",
                        description:'GET_ALL_ARTISTS',
                        url: 'http://localhost:3000/artists'
                    }],
                    //.map to map on every media (multiple images on one publication)
                    // No global .map we don't want to get x.media times the publication information (because it's on the same pub)
                    medias: docs.map(doc =>{
                        return (doc.media);
                    })     
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
    Publication.deleteOne({ _id: id})
        .exec()
        .catch(err => {
            res.status(500).json({error: err});
        });
    Media.find({publicationId : id})
        .exec()
        .then(docs=>{
            docs.map(doc =>{
                bucket.file(doc.mediaUrl.slice(44)).delete();
                console.log(`${doc.mediaUrl} deleted`);
            })     
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
    Media.deleteMany({ publicationId : id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "publication deleted"
            });
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
    
    
});

module.exports = router;