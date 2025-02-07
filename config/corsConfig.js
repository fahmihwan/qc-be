const cors = require('cors');

const corsOptions = {
    credentials: true,
    origin: process.env.CORS_FE,
    optionsSuccessStatus: 200
    // origin: true,

};

module.exports = cors(corsOptions)