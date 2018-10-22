
const { body, query, } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

///////////////////////////////////////////////////////////
// Validations
///////////////////////////////////////////////////////////
const textVal = [
  body('text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('text missing')
    .isAscii()
    .withMessage('text should include only valid ascii characters'),

  sanitizeBody('text').trim(),
]

const passVal = [
  body('delete_password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('delete_password missing')
    .isAscii()
    .withMessage('delete_password should include only valid ascii characters'),

  sanitizeBody('delete_password').trim(),
]

const bodyThreadIdVal = [
  body('thread_id')
    .trim()
    .isMongoId()
    .withMessage('thread_id should be a valid MongoID')
]
const bodyReplyIdVal = [
  body('thread_id')
    .trim()
    .isMongoId()
    .withMessage('thread_id should be a valid MongoID')
]

const queryThreadIdVal = [
  query('thread_id')
    .trim()
    .isMongoId()
    .withMessage('thread_id should be a valid MongoID')
]

module.exports = {
  textVal,
  passVal,
  bodyThreadIdVal,
  bodyReplyIdVal,
  queryThreadIdVal,
}