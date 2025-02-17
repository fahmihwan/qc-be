const helmet = require('helmet');

const helmetConfig = (app) => {
    app.use(helmet());
    app.use(helmet.frameguard({ action: 'deny' }));

    // Mengonfigurasi X-Content-Type-Options untuk mencegah MIME sniffing
    app.use(helmet.noSniff());  // Mengatur header X-Content-Type-Options ke 'nosniff'

    // Mengonfigurasi X-XSS-Protection untuk perlindungan terhadap serangan XSS
    app.use(helmet.xssFilter());  // Mengaktifkan filter XSS pada browser yang mendukungnya

    // Mengonfigurasi Referrer-Policy
    app.use(helmet.referrerPolicy({ policy: 'strict-origin' }));  // Mengirimkan referrer hanya untuk permintaan HTTPS


    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],  // Mengizinkan skrip dari domain tertentu
        }
    }));

};

module.exports = helmetConfig;
