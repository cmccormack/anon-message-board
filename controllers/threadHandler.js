'use strict'

const { validationResult, } = require('express-validator/check')
const app = require('express')()
const {
  textVal,
  passVal,
  bodyThreadIdVal,
  bodyReplyIdVal,
  queryThreadIdVal
} = require('../controllers/validations')
const Thread = require('../models/Thread')

function ThreadHandler(app) {

  if (this === undefined) {
    return new ThreadHandler()
  }

  /** 
   * POST a new thread to a specific message board
   */
  this.postThread = async (req, res, next) => {

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
        thread = thread.toObject()
        delete thread.delete_password
        res.json({ success: true, data: thread })
      })
  }

  /** 
   * GET an array of the most recent 10 bumped threads on the board with
   * only the most recent 3 replies from `/api/threads/{board}`
   */
  this.getRecentThreads = async (req, res, next) => {

    const { board } = req.params

    Thread.find({ board })
      .select({ reported: 0, delete_password: 0, __v: 0, board: 0 })
      .sort({ 'bumped_on': -1 })
      .limit(10)
      .exec((err, threads) => {
        if (err) { return next(Error(err)) }

        res.json(threads.map(thread => {
          thread = thread.toObject()
          thread.replyCount = thread.replies.length
          thread.replies = thread.replies.slice(0, 3)
            .map(({ delete_password, reported, ...reply }) => reply)
          return thread
        }))
      })

  }

  /** 
   * DELETE a thread completely
   */
  this.deleteThread = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(Error(errors.array()[0].msg))
    }

    const { board } = req.params
    const { thread_id, delete_password } = req.body

    try {
      const thread = await Thread.findOne({ _id: thread_id, board })
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
  }

  /** 
   * PUT sets reported value of thread to true
   */
  this.reportThread = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(Error(errors.array()[0].msg))
    }

    const { thread_id } = req.body

    try {
      const thread = await Thread.findByIdAndUpdate(
        thread_id,
        { $set: { reported: true } },
        { new: true }
      )

      if (!thread) {
        throw `thread_id ${thread_id} not found`
      }

      return res.send('success')
    } catch (err) {
      return next(Error(err))
    }
  }
}

module.exports = ThreadHandler