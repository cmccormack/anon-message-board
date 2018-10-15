const router = require("express").Router()
const { body, param, query, validationResult, } = require('express-validator/check')
const { sanitizeQuery, sanitizeBody, sanitizeParam } = require('express-validator/filter')
const fetch = require('node-fetch')
// const Board = require('../models/Board')
const Thread = require('../models/Thread')
// const Reply = require('../models/Reply')



module.exports = () => {

  ///////////////////////////////////////////////////////////
  // Utility Endpoints
  ///////////////////////////////////////////////////////////
  router.get("/wipeticker", (req, res) => {
    Ticker.deleteMany({}, err => {
      if (err) return Error(err.message)
      const message = "Successfully wiped 'books' collection"
      res.json({ success: true, message, })
    })
  })


  ///////////////////////////////////////////////////////////
  // Validations
  ///////////////////////////////////////////////////////////
  const textVal = [
    body('text')
      .trim()
      .isLength({min: 1})
      .withMessage('Text missing')
      .isAscii()
      .withMessage('Text should include only valid ascii characters'),

    sanitizeBody('text').trim(),
  ]

  const passVal = [
    body('delete_password')
      .trim()
      .isLength({min: 1})
      .withMessage('Delete Password missing')
      .isAscii()
      .withMessage('Delete Password should include only valid ascii characters'),

    sanitizeBody('delete_password').trim(),
  ]

  const idVal = [
    body('thread_id')
      .trim()
      .isMongoId()
      .withMessage('Thread ID should be a valid MongoID')
  ]



  ///////////////////////////////////////////////////////////
  // Manage Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/threads/:board')

    // ** POST ** request
    .post(textVal, passVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // console.log(errors.array())
        return next(Error(errors.array()[0].msg))
      }

      const { board } = req.params
      const { delete_password, text } = req.body

      new Thread({ text, delete_password, board })
        .save((err, thread) => {
          if (err) {
            return next(Error(err))
          }

          res.redirect(`/b/${req.params.board}`)
        })
      })


    // ** GET ** request
    .get((req, res, next) => {

      const { board } = req.params

      Thread.find({board})
      .select({reported: 0, delete_password: 0, __v: 0})
      .sort({'bumped_on': -1})
      .limit(10)
      .exec((err, threads) => {
        if (err) { return next(Error(err)) }

        res.json(threads.map(thread => {
          thread.replies = thread.replies.slice(0, 3)
          return thread
        }))
      })

      
    })


    // ** DELETE ** request
    .delete((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing'})
      
    })


    // ** PUT ** request
    .put((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing'})
      
    })


  ///////////////////////////////////////////////////////////
  // Manage Thread Replies
  ///////////////////////////////////////////////////////////
  router.route('/replies/:board')

    // ** POST ** request
    .post(idVal, textVal, passVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // console.log(errors.array())
        return next(Error(errors.array()[0].msg))
      }

      const { board } = req.params
      const { delete_password, text, thread_id } = req.body

      Thread.findById(thread_id, (err, thread) => {
        if (err) {
          return next(Error(err))
        }

        

        res.redirect(`/b/${req.params.board}/${thread_id}`)

      })
    })


    // ** GET ** request
    .get((req, res, next) => {

      if (req.query.thread_id) {
        return next()
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing get without query'})
      
    })

    // ** GET ** request with query
    .get((req, res, next) => {

      console.log(req.query)
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing get with query'})
      
    })


    // ** DELETE ** request
    .delete((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing'})
      
    })


    // ** PUT ** request
    .put((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing'})
      
    })

  return router
  
}