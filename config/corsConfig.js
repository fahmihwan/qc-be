const cors = require('cors');

const corsOptions = {
    credentials: true,
    origin: "http://localhost:5173",
};

module.exports = cors(corsOptions)