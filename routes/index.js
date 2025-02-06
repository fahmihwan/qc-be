const express = require('express')
const router = express.Router();

const auth = require('../controller/auth/AuthController')
const foodEstate = require('../controller/FoodEstateController')


router.get('/tes', auth.tes);
router.post('/login', auth.login);
router.post('/register', auth.register);

router.get('/foodestate', foodEstate.getChart)

module.exports = router;