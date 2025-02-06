const express = require('express')
const router = express.Router();

const auth = require('../controller/auth/AuthController')

router.get('/tes', auth.tes);
router.post('/login', auth.login);
router.post('/register', auth.register);

module.exports = router;