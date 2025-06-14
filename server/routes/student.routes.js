const express = require('express');
const router = express.Router();
const studentController = require('../controller/student.controller');

router.post('/student', studentController.createStudent);


module.exports = router;

