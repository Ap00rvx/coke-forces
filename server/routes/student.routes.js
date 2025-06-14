const express = require('express');
const router = express.Router();
const studentController = require('../controller/student.controller');

router.post('/student', studentController.createStudent);
router.get('/student',studentController.getAllStudents); 


module.exports = router;

