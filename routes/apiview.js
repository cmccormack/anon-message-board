const router = require("express").Router()
const ThreadHandler = require('../controllers/threadHandler')
const ReplyHandler = require('../controllers/replyHandler')


module.exports = () => {

  const threadHandler = new ThreadHandler()
  const replyHandler = new ReplyHandler()

  ///////////////////////////////////////////////////////////
  // View Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/:board/')
    .get((req, res, next) => {
      const { board } = req.params

      threadHandler.getRecentThreads(
        { params: { board } },
        { json: threads => {
          res.render('board', { board, threads })
        }}
      )

    })

  router.route('/:board/:thread_id/')
    .get((req, res, next) => {
      const { board, thread_id } = req.params

      replyHandler.getThreadWithReplies(
        { 
          params: { board },
          query: { thread_id }
        },
        { json: thread => {
          res.render('thread', { board, thread })
        }}
      )
    })

  return router
  
}