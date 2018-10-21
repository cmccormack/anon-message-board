const router = require("express").Router()
const { body, param, query, validationResult, } = require('express-validator/check')
const { sanitizeQuery, sanitizeBody, sanitizeParam } = require('express-validator/filter')
const fetch = require('node-fetch')
const Thread = require('../models/Thread')


module.exports = () => {


  ///////////////////////////////////////////////////////////
  // View Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/:board')
    .get((req, res, next) => {
      const { board } = req.params
      res.render('board', {title: board})
      
    })

  router.route('/:board/:thread_id')
    .get((req, res, next) => {

      res.render('thread', { success: true })

    })

  return router
  
}