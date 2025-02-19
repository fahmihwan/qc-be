
const express = require('express')
const router = express.Router();

const authController = require('../controller/auth/AuthController')
const foodEstateController = require('../controller/FoodEstateController')
const otherController = require('../controller/otherController')
const surveyController = require('../controller/surveyController')


router.get('/tes', authController.tes);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/foodestate', foodEstateController.getChart)
router.get('/getslider', otherController.getSlider)
router.get('/gettable', otherController.getTable)
router.get('/getpie', otherController.getPieChart)
router.get('/getlistyear', otherController.getListYear)
router.get('/gettotaldatalistprovinsi', otherController.getTotalDataListProvinsi)
// router.get('/get-dropdown-topik', otherController.getDropdownTopik)
router.get('/get-dropdown-subdata', otherController.getDropdownSubdata)
router.get('/get-dropdown-subkategori', otherController.getDropdownSubkategoriByKategori)
router.get('/get-dropdown-namakategori', otherController.getDropdownNamaKategori)
router.get('/get-dropdown-topik', otherController.getDropdownTopikBySubkategoriId)


// survey
router.post('/survey', surveyController.storeSurveyDinamis)
router.get('/getallsurvey', surveyController.getAllSurvey)
router.get('/getdetail-survey-bykoderesponden', surveyController.getDetailSurveyByKodeResponden)

// getDetailSurveyByKodeResponse, getAllSurvey

module.exports = router;