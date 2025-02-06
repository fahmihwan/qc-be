const cors = require('cors');

const corsOptions = {
    credentials: true,
    origin: process.env.CORS_FE,
    // origin: "http://localhost:5173",
};

module.exports = cors(corsOptions)