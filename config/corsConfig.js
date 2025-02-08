const cors = require('cors');

const corsOptions = {
    credentials: true,
    origin: true,
    // origin: process.env.CORS_FE,
    optionsSuccessStatus: 200


};

module.exports = cors(corsOptions)