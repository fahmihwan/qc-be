require('dotenv').config();
const express = require('express') //import express
const router = require('./routes');
const corsConfig = require('./config/corsConfig');
const helmetConfig = require('./config/scurity');
const errorHandler = require('./middleware/requestLogger');
const limiter = require('./config/rateLimitingConfig');

const app = express() //init app

const port = process.env.PORT_BE;


app.use(limiter)
app.use(express.static('public'))
app.use(express.json())

helmetConfig(app)
app.use(express.urlencoded({ extended: true }))
app.use(corsConfig)


app.use(errorHandler.requestLogger)

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

app.use(errorHandler.errorHandler)


//start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})