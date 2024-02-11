const express = require('express')
const app =  express();
const path = require('path');
const cors = require('cors')
const corsOptions = require('./config/corsOption')
const PORT = process.env.PORT || 3500
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/dbCon');

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

app.all('*', (req, res)=>{
    res.status(404);
    if(req.accepts('.html')){
        res.sendFile(path.join(__dirname, "view", "404.html"));
    } else if(req.accepts('.json')) {
        res.json({
            message: "requested page not found"
        })
    } else {
        res.type('.txt').send("404! Not found");
    }
})

mongoose.connection.once("open", ()=>{
    console.log('Connected to database');
    app.listen(PORT, ()=> console.log("server running"))
})

