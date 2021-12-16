const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message:'GET user'
    });
});

router.post('/', (req, res, next) => {
    const user = {
        userName: req.body.userName,
        userlName:req.body.userlName
    };
    res.status(201).json({
        message:'POST user',
        user:user
    });
});

router.get('/:userId', (req, res, next) => {
    const id = req.params.userId;
    res.status(200).json({
        id: "get user " + id
    });
});

router.patch('/:userId', (req, res, next) => {
    const id = req.params.userId;
    res.status(200).json({
        id: "updated user " + id
    });
});

router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId;
    res.status(200).json({
        id: "delete user "+ id
    });
});

module.exports = router;