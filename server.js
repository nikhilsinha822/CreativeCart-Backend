const express = require('express')
const app =  express();
const path = require('path');
const cors = require('cors')
require('dotenv').config();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500
const connectDB = require('./config/dbCon');
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOption')
const cloudinary = require('cloudinary').v2;
const errorMiddleware = require('./middleware/error')

connectDB();

app.use(cors(corsOptions));

app.use(fileUpload());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', express.static(path.join(__dirname, 'public')))

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use('/',require('./routes/root'))
app.use('/api/v1', require('./routes/authRoutes'))
app.use('/api/v1', require('./routes/catRoutes'))
app.use('/api/v1', require('./routes/productRoutes'))
app.use('/api/v1', require('./routes/cartRoutes'))
app.use('/api/v1', require('./routes/orderRoutes'))
app.use('/api/v1', require('./routes/paymentRoutes'))

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

app.use(errorMiddleware);

mongoose.connection.once("open", ()=>{
    console.log('Connected to database');
    app.listen(PORT, ()=> console.log("server running"))
})

