const express = require('express')
const router = express.Router()
const statsController = require('../controllers/statsController')
const auth = require('../middleware/auth')

router.get('/', auth, statsController.getStats)
router.get('/recent-students', auth, statsController.getRecentStudents)

module.exports = router 