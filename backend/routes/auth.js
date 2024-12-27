const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const logger = require('../middleware/logger')

router.post('/login', logger('login'), authController.login)
router.post('/logout', authController.logout)

module.exports = router