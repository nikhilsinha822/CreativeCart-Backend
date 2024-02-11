const express = require('express');
const router = express.Router()
const path = require('path')

router.get('/', (req,res)=>{
    if(req.accepts('.html')){
        res.sendFile(path.join(__dirname, '../','view', 'index.html'))
    }
})

module.exports = router;
