const router = require("express").Router()
const { query, validationResult, } = require('express-validator/check')
const { sanitizeQuery } = require('express-validator/filter')
const fetch = require('node-fetch')
const Ticker = require('../models/Ticker')


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
  const parseQuery = (req, res, next) => {

    if (!req.query.stock) {
      return next(Error('Must include valid stock in request'))
    }

    if (typeof req.query.stock === 'string') {
      req.query.stock = [req.query.stock]
    }

    next()
  }


  const stock_ticker_validation = [
    query('stock')
      .isArray()
      .withMessage('stock query must be an array')
      .custom(q => q.length >= 1)
      .withMessage('Must include valid stock in query')
      .custom(q => q.length <= 2)
      .withMessage('Maximum of two stocks permitted')
      .custom(q => (
        q.length === 1 
          || q.length === 2
          && q[0].toLowerCase() !== q[1].toLowerCase())
      )
      .withMessage('Stocks symbols must be unique when comparing'),

    query('stock.*')
      .isLength({ min: 4, max: 5 })
      .withMessage('Stock Ticker invalid, should be four or five characters')
      .isAscii()
      .withMessage('Stock Ticker should include only valid ascii characters'),

    sanitizeQuery('stock.*').trim(),
  ]



  ///////////////////////////////////////////////////////////
  // Manage Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/threads/:board')

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