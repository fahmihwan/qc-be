require('dotenv').config();
const express = require('express') //import express
const router = require('./routes');
const corsConfig = require('./config/corsConfig');
const morgan = require('morgan');
const logger = require('./config/logging');
const app = express() //init app

const port = process.env.PORT_BE;


// app.use(limiter)
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(corsConfig)

// Middleware untuk logging request
app.use((req, res, next) => {
    logger.info(`Request - Method: ${req.method}, URL: ${req.url}`);
    next();
});


// setup cors, csrf
// app.use(corsConfig)
// app.use(cookieParser())

// app.use(csrfMiddleware()); // Gunakan csrfMiddleware untuk rute yang memerlukannya

// ===========================================================================================
// setup csrf
// app.get('/api/csrf-token', csrfProtection, function (req, res) {
//     res.status(200).send({ csrfToken: req.csrfToken() })
// })

// mount api before csrf is appended to the app stack
app.use('/api', router)



app.get('/', (req, res) => {
    res.send('Hello World!')
})


// Error handling (untuk contoh)
app.use((err, req, res, next) => {
    console.log(err.message);
    logger.error(`Error: ${err.message}`);
    res.status(500).send('Something went wrong!');
});


//start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})