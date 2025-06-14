const express = require('express');
const router = express.Router();
const studentController = require('../controller/student.controller');

router.post('/student', studentController.createStudent);
router.get('/student',studentController.getAllStudents); 
router.get('/student/:handle', studentController.getHandleDetails);
router.put('/student/:handle', studentController.updateStudentDetails);
router.delete('/student/:handle', studentController.deleteStudent);


module.exports = router;

