const router = require("express").Router()
const { body, param, query, validationResult, } = require('express-validator/check')
const { sanitizeQuery, sanitizeBody, sanitizeParam } = require('express-validator/filter')
const fetch = require('node-fetch')
const Ticker = require('../models/Ticker')


module.exports = () => {


  ///////////////////////////////////////////////////////////
  // View Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/:board')

    // ** GET ** request
    .get((req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      res.json({success:true, message: 'testing /b/{board}'})
      
    })

  return router
  
}