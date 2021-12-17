const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Publication = require('../models/publication');

// router.get('/', (req, res, next) => {
//     User.find()
//         .select('-__v')
//         .exec()
//         .then(docs => {
//             const response = {
//                 count: docs.length,
//                 users: docs.map(doc =>{
//                     return {
//                         id: doc._id,
//                         name: doc.name,
//                         lName: doc.lName,
//                         request: {
//                             type: "GET",
//                             description:'GET_USER',
//                             url: 'http://localhost:3000/users/'+ doc._id
//                         }
//                     }
                    
//                 })
//             };
//             res.status(200).json(response);
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({error: err});
//         });
// });
const {format} = require('util');
const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5mb
    },
  });
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

router.post('/upload', multer.single('file'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
  
    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
  
    blobStream.on('error', err => {
      next(err);
    });
  
    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      res.status(200).send(publicUrl);
    });
  
    blobStream.end(req.file.buffer);
  });
router.post('/', (req, res, next) => {
    const publication = new Publication({
        title: req.body.title,
        description: req.body.description,
        user: req.body.userId
    });
    publication.save()
        .then(result => {
            res.status(201).json({
                id: result._id,
                title: result.title,
                description: result.description,
                user: result.user,
                request:[
                    {
                        type: "GET",
                        description:'GET_CREATED_PUBLICATION',
                        url: 'http://localhost:3000/publications/'+ result._id
                    },
                    {
                        type: "GET",
                        description:'GET_PUBLICATION_S_USER',
                        url: 'http://localhost:3000/publications/'+ result._id
                    }
                ]
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

// router.get('/:userId', (req, res, next) => {
//     const id = req.params.userId;
//     User.findById(id)
//         .select('-__v')
//         .exec()
//         .then(doc => {
//             if (doc) {
//                 res.status(200).json({
//                     id: doc._id,
//                     name: doc.name,
//                     lName: doc.lName,
//                     request:{
//                         type: "GET",
//                         description: "GET_ALL_USER",
//                         url: "http://localhost:3000/users"
//                     }
//                 });
//             } else {
//                 res.status(404).json({message : "Value not found"});
//             }      
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({error: err});
//         });
// });

// router.patch('/:userId', (req, res, next) => {
//     const id = req.params.userId;
//     User.findByIdAndUpdate(id, { $set: req.body }, { new: true})
//       .then(result => {
//           res.status(200).json({
//             id: result._id,
//             name: result.name,
//             lName: result.lName,
//                 request:{
//                     type: "GET",
//                     description: "GET_UPDATED_USER",
//                     url: "http://localhost:3000/users/" + result._id
//                 }
//             });
//         })
//       .catch(err => {
//           res.status(500).json({error: err})
//         });
// });

// router.delete('/:userId', (req, res, next) => {
//     const id = req.params.userId;
//     User.remove({ _id: id})
//         .exec()
//         .then(result => {
//             res.status(200).json({
//                 message: "user deleted"
//             });
//         })
//         .catch(err => {
//             res.status(500).json({error: err});
//         });
// });

module.exports = router;