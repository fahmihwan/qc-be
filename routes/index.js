
const express = require('express')
const router = express.Router();

const authController = require('../controller/auth/AuthController')
const foodEstateController = require('../controller/FoodEstateController')
const otherController = require('../controller/otherController')


router.get('/tes', authController.tes);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/foodestate', foodEstateController.getChart)
router.get('/getslider', otherController.getSlider)

module.exports = router;