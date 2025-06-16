const express = require('express');
const router = express.Router();
const studentController = require('../controller/student.controller');

router.post('/student', studentController.createStudent);
router.get('/student',studentController.getAllStudents); 
router.get('/students/csv', studentController.downloadStudentsCsv);
router.get('/student/:handle', studentController.getHandleDetails);
router.put('/student/:handle', studentController.updateStudentDetails);
router.delete('/student/:handle', studentController.deleteStudent);

router.post('/student/send-reminder/:cfHandle', studentController.sendReminderEmail);
router.post('/student/sync', studentController.syncStudentsData);
router.put("/student/:handle/update-reminder",studentController.setEmailReminder);



module.exports = router;

