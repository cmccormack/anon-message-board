const router = require("express").Router()
const { body, param, query, validationResult, } = require('express-validator/check')
const { sanitizeQuery, sanitizeBody, sanitizeParam } = require('express-validator/filter')
const fetch = require('node-fetch')
const Thread = require('../models/Thread')


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



  ///////////////////////////////////////////////////////////
  // Manage Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/threads/:board')

    // ** POST ** request
    .post(textVal, passVal, (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // console.log(errors.array())
        return next(Error(errors.array()[0].msg))
      }

      const { board } = req.params
      const { delete_password, text } = req.body
      console.log(board, delete_password, text)

      res.redirect(`/b/${req.params.board}`)
      // res.json({success:true, message: 'testing'})

      })


    // ** GET ** request
    .get((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing'})
      
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
    .post((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing'})

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