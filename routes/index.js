
const express = require('express')
const router = express.Router();

const authController = require('../controller/auth/AuthController')
const foodEstateController = require('../controller/FoodEstateController')
const otherController = require('../controller/otherController')
const surveyController = require('../controller/surveyController')
const qrcodeController = require('../controller/qrcodeController');
const publicapiController = require('../controller/publicapiController');
const { default: axios } = require('axios');


router.get('/tes', authController.tes);


// https://gis.bnpb.go.id/dev/api/summary/?start=%27${startDate}%27&end=%27${endDate}%27&id=${provinceId}`

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/foodestate', foodEstateController.getChart)
router.get('/getslider', otherController.getSlider)
router.get('/gettable', otherController.getTable)
router.get('/getpie', otherController.getPieChart)
router.get('/getlistyear', otherController.getListYear)
router.get('/gettotaldatalistprovinsi', otherController.getTotalDataListProvinsi)
router.get('/get-dropdown-subdata', otherController.getDropdownSubdata)
router.get('/get-dropdown-subkategori', otherController.getDropdownSubkategoriByKategori)
router.get('/get-dropdown-namakategori', otherController.getDropdownNamaKategori)
router.get('/get-dropdown-topik', otherController.getDropdownTopikBySubkategoriId)
router.get('/publicapi/getsummary',publicapiController.getSummary)
router.get('/publicapi/getbencana',publicapiController.getBencana)


// survey
router.post('/survey', surveyController.storeSurveyDinamis)
router.get('/getallsurvey', surveyController.getAllSurvey)
router.get('/getdetail-survey-bykoderesponden', surveyController.getDetailSurveyByKodeResponden)


// qrcode
router.get('/qrcodes', qrcodeController.getListQrcode)
router.post('/qrcode', qrcodeController.storeQRcode)
router.delete('/qrcode/:kode_qr', qrcodeController.deleteQRcode)

// getDetailSurveyByKodeResponse, getAllSurvey

module.exports = router;