const router = require("express").Router()
const { body, query, validationResult, } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')
const Thread = require('../models/Thread')



module.exports = () => {

  ///////////////////////////////////////////////////////////
  // Validations
  ///////////////////////////////////////////////////////////
  const textVal = [
    body('text')
      .trim()
      .isLength({min: 1})
      .withMessage('text missing')
      .isAscii()
      .withMessage('text should include only valid ascii characters'),

    sanitizeBody('text').trim(),
  ]

  const passVal = [
    body('delete_password')
      .trim()
      .isLength({min: 1})
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



  ///////////////////////////////////////////////////////////
  // Manage Board Threads
  ///////////////////////////////////////////////////////////
  router.route('/threads/:board')

    // ** POST ** request
    .post(textVal, passVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
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
      .select({ reported: 0, delete_password: 0, __v: 0, board: 0 })
      .sort({'bumped_on': -1})
      .limit(10)
      .exec((err, threads) => {
        if (err) { return next(Error(err)) }

        res.json(threads.map(thread => {
          thread = thread.toObject()
          thread.replies = thread.replies.slice(0, 3)
            .map(({delete_password, reported, ...reply}) => reply)
          return thread
        }))
      })
    })


    // ** DELETE ** request
    .delete(bodyThreadIdVal, passVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      const { board } = req.params
      const { thread_id, delete_password } = req.body
      
      try {
        const thread = await Thread.findOne({_id: thread_id, board})
        if (!thread) {
          throw `thread_id ${thread_id} not found`
        }
        if (thread.delete_password !== delete_password) {
          return res.send('incorrect password')
        }

        await Thread.findByIdAndDelete(thread._id)
        res.send('success')

      } catch (err) {
        return next(Error(err))
      }
    })


    // ** PUT ** request
    .put(bodyThreadIdVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      const { thread_id } = req.body

      try {
        const thread = await Thread.findByIdAndUpdate(
          thread_id,
          { $set: { reported: true }},
          { new: true }
        )

        if (!thread) {
          throw `thread_id ${thread_id} not found`
        }

        return res.send('success')
      } catch (err) {
        return next(Error(err))
      }
      
    })


  ///////////////////////////////////////////////////////////
  // Manage Thread Replies
  ///////////////////////////////////////////////////////////
  router.route('/replies/:board')

    // ** POST ** request
    .post(bodyThreadIdVal, textVal, passVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // console.log(errors.array())
        return next(Error(errors.array()[0].msg))
      }

      const { board } = req.params
      const { delete_password, text, thread_id } = req.body
      const update = {
        $push: { replies: { text, delete_password } },
        bumped_on: new Date()
      }

      Thread.findOneAndUpdate(
        { _id: thread_id, board },
        update, {new: true}, (err, thread) => {
        if (err) {
          return next(Error(err))
        }
        if (!thread) {
          return next(Error(`thread_id ${thread_id} not found`))
        }

        res.redirect(`/b/${req.params.board}/${thread_id}`)
      })
    })


    // ** GET ** request with query thread_id
    .get(queryThreadIdVal, (req, res, next) => {
      
      const { board } = req.params
      const { thread_id } = req.query

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }


      Thread.findOne({_id: thread_id, board})
        .select({ delete_password: 0, __v: 0, reported: 0, board: 0 })
        .exec((err, thread) => {
          if (err) {
            return next(Error(err))
          }
          if (!thread) {
            return next(Error(`thread_id ${thread_id} not found`))
          }

          thread = thread.toObject()
          thread.replies = thread.replies
            .map(({delete_password, reported, ...reply}) => reply)
          res.json(thread)
        })
    })


    // ** DELETE ** request
    .delete(bodyThreadIdVal, bodyReplyIdVal, passVal, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      const { thread_id, reply_id, delete_password } = req.body

      try {
        const thread = await Thread.findOne({
          _id: thread_id,
          'replies._id': reply_id,
        })

        if (!thread) {
          throw 'thread_id or reply_id not found'
        }
        if (thread.delete_password !== delete_password) {
          return res.send('incorrect password')
        }

        await Thread.updateOne({
            _id: thread_id,
            'replies._id': reply_id
          },
          {
            'replies.$.text': '[deleted]'
          }
        )
        res.send('success')

      } catch (err) {
        return next(Error(err))
      }

      
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