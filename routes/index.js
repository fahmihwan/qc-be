
const express = require('express')
const router = express.Router();

const authController = require('../controller/auth/AuthController')
const foodEstateController = require('../controller/FoodEstateController')
const otherController = require('../controller/otherController')
const surveyController = require('../controller/surveyController')
const qrcodeController = require('../controller/qrcodeController');
const publicapiController = require('../controller/publicapiController');
const regencyController = require('../controller/regencyController');
const dashboardSurveyChartController = require('../controller/dashboardSurveyChartController')
const dashboardSurveyChartDiammisController = require('../controller/dashboardSurveyChartDinamisController')
const logController = require('../controller/logController')


router.get('/tes', authController.tes);


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
router.get('/publicapi/getsummary', publicapiController.getSummary)
router.get('/publicapi/getbencana', publicapiController.getBencana)
router.get('/publicapi/get-by-each-bencana', publicapiController.getByEachBencana)


// regency 
router.get('/provinsi', regencyController.getProvinsi)
router.get('/kabkota/:provinsi_id', regencyController.getKabupaten)
router.get('/kecamatan/:kabkota_id', regencyController.getKecamatan)



// survey
router.post('/survey', surveyController.storeSurveyDinamis)
router.get('/getallsurvey', surveyController.getAllSurvey)
router.get('/getdetail-survey-bykoderesponden', surveyController.getDetailSurveyByKodeResponden)


// qrcode
router.get('/qrcodes', qrcodeController.getListQrcode)
router.get('/qrcode/:kode_qr', qrcodeController.getDetailQRcode)
router.post('/qrcode', qrcodeController.storeQRcode)
router.delete('/qrcode/:kode_qr', qrcodeController.deleteQRcode)

// dashboard survey
router.get('/getpie-dashboard-survey', dashboardSurveyChartController.getPie)
router.get('/getbar-dashboard-survey', dashboardSurveyChartController.getBar)
router.get('/getworldcloud-dashboard-survey', dashboardSurveyChartController.getWorldCloud)
router.get('/getlinechart-dashboard-survey', dashboardSurveyChartController.getLineChart)
router.get('/getlinechart-dashboard-survey', dashboardSurveyChartController.getLineChart)


router.post('/get-chart-dinamis', dashboardSurveyChartDiammisController.chartDashboardSurveyDinamis)


router.post('/log-fe', logController.logFe)



module.exports = router;