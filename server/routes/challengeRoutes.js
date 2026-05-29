const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getChallenges,
  getChallenge,
  updateChallenge,
  getChallengeProgress
} = require('../controllers/challengeController');

router.route('/')
  .post(createChallenge)
  .get(getChallenges);

router.get('/:id/progress', getChallengeProgress);
router.route('/:id')
  .get(getChallenge)
  .put(updateChallenge);

module.exports = router;