const router = require("express").Router()
const ThreadHandler = require('../controllers/threadHandler')


module.exports = () => {

  const threadHandler = new ThreadHandler()
  ///////////////////////////////////////////////////////////
  // View Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/:board')
    .get((req, res, next) => {
      const { board } = req.params

      threadHandler.getRecentThreads(
        { params: {board} },
        { json: threads => {
          res.render('board', {title: board, threads})
        }})
      
    })

  router.route('/:board/:thread_id')
    .get((req, res, next) => {

      res.render('thread', { success: true })

    })

  return router
  
}