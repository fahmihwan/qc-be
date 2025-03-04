// middlewares/errorHandler.js
const logger = require('../config/logging');  // Mengimpor logger


const requestLogger = (req, res, next) => {
    logger.info(`Request - Method: ${req.method}, URL: ${req.url}`);
    next();
};

const errorHandler = (err, req, res, next) => {
    console.log(err);


    // logger.error(`Error terjadi: ${err.message}`);
    // logger.error('AMBIL ERROR', err.stack);
    console.log('AMBIL ERROR', err.message);
    console.log('AMBIL ERROR stack', err.stack);

    res.status(500).json({
        message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
        error: err.message,  // Menyertakan pesan error dalam respons (hati-hati untuk tidak mengekspos informasi sensitif)
    });
};

module.exports = { errorHandler, requestLogger };
