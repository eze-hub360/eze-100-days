const express = require('express');
const router = express.Router();
const {
  createDailyLog,
  getChallengeLogs,
  updateDailyLog
} = require('../controllers/dailyLogController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('proofImage'), createDailyLog);
router.get('/challenge/:challengeId', getChallengeLogs);
router.put('/:id', updateDailyLog);

module.exports = router;