const express = require('express');
const winston = require('winston');


// Setup logger menggunakan winston
const logger = winston.createLogger({
    level: 'info',  // Level log yang dicatat (info, warn, error, dll.)
    handleExceptions: true,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Menambahkan warna untuk log di konsol
                winston.format.simple()    // Format sederhana untuk log di konsol
            )
        }),
        new winston.transports.File({
            filename: 'logs/debug.log',       // Nama file untuk menyimpan log
            level: 'debug',              // Hanya mencatat log dengan level 'info' atau lebih tinggi
            format: winston.format.combine(
                winston.format.timestamp(),  // Menambahkan timestamp ke setiap log
                winston.format.simple()      // Format sederhana untuk log
            )
        }),
        new winston.transports.File({
            filename: 'logs/info.log',       // Nama file untuk menyimpan log
            level: 'info',              // Hanya mencatat log dengan level 'info' atau lebih tinggi
            format: winston.format.combine(
                winston.format.timestamp(),  // Menambahkan timestamp ke setiap log
                winston.format.simple()      // Format sederhana untuk log
            )
        }),
        new winston.transports.File({
            filename: 'logs/error.log',

            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()   // Format sederhana untuk log
            )
        }),

    ]
});

module.exports = logger