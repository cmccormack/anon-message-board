const router = require("express").Router()
const { validationResult, } = require('express-validator/check')
const Thread = require('../models/Thread')
const ThreadHandler = require('../controllers/threadHandler')
const ReplyHandler = require('../controllers/replyHandler')
const {
  textVal,
  passVal,
  bodyThreadIdVal,
  bodyReplyIdVal,
  queryThreadIdVal
} = require('../controllers/validations')


module.exports = () => {

  ///////////////////////////////////////////////////////////
  // Initialize Controllers
  ///////////////////////////////////////////////////////////
  const threadHandler = new ThreadHandler()
  const replyHandler = new ReplyHandler()


  ///////////////////////////////////////////////////////////
  // Manage Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/threads/:board')

    /**
     * POST Request
     * Creates a new thread
     * @responds with new Thread object
    */
    .post(textVal, passVal, threadHandler.postThread)

    /**
     * GET Request
     * @responds an array of the most recent 10 bumped
     *  threads on the board with only the most recent 3 replies
    */
    .get(threadHandler.getRecentThreads)


    /**
     * DELETE Request
     * Deletes a thread
     * @responds with String containing success or an error
    */
    .delete(bodyThreadIdVal, passVal, threadHandler.deleteThread)


    /**
     * PUT Request
     * Sets a threads reported value to true
     * @responds with String containing success or an error
    */
    .put(bodyThreadIdVal, threadHandler.reportThread)


  ///////////////////////////////////////////////////////////
  // Manage Thread Replies
  ///////////////////////////////////////////////////////////
  router.route('/replies/:board')

    /**
     * POST Request
     * Creates a new reply to a thread
     * @responds with object containing success and data or error
    */
    .post(bodyThreadIdVal, textVal, passVal, replyHandler.postReply)

    /**
     * GET Request
     * Gets a thread and all of its replies
     * @responds with object containing success and data or error
    */
    .get(queryThreadIdVal, replyHandler.getThreadWithReplies)

    /**
     * DELETE Request
     * Deletes reply by setting text to '[deleted]'
     * @responds with String containing success or an error
    */
    .delete(bodyThreadIdVal, bodyReplyIdVal, passVal, replyHandler.deleteReply)

    /**
     * PUT Request
     * Sets a reply's reported value to true
     * @responds with String containing success or an error
    */
    .put(bodyThreadIdVal, bodyReplyIdVal, replyHandler.reportReply)
    

  return router
  
}