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

function ReplyHandler(app) {

  if (this === undefined) {
    return new ReplyHandler()
  }
  
  /** 
   * POST a reply to a thread on a specific message board
   */
  this.postReply = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(Error(errors.array()[0].msg))
    }

    const { delete_password, text, thread_id } = req.body
    const update = {
      $push: {
        replies: {
          $each: [{text, delete_password}],
          $sort: { created_on: 1}
        } 
      },
      bumped_on: new Date()
    }

    Thread.findOneAndUpdate(
      { _id: thread_id, board: req.params.board },
      update,
      { new: true },
      (err, thread) => {
        if (err) {
          return next(Error(err))
        }
        if (!thread) {
          return next(Error(`thread_id ${thread_id} not found`))
        }

        thread = thread.toObject()
        delete thread.delete_password
        res.json({ success: true, data: thread })
      })
  }

  /** 
   * GET an entire thread with all its replies
   */
  this.getThreadWithReplies = async (req, res, next) => {

    const { board } = req.params
    const { thread_id } = req.query

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(Error(errors.array()[0].msg))
    }


    Thread.findOne({ _id: thread_id, board })
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
          .map(({ delete_password, reported, ...reply }) => reply)
        res.json(thread)
      })
  }

  /** 
   * DELETE a reply by setting `text` value to `[deleted]`
   */
  this.deleteReply = async (req, res, next) => {

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

      const reply = thread.replies.filter(r => r._id == reply_id)[0]

      if (reply.delete_password !== delete_password) {
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
  }

  /** 
   * PUT sets reported value of reply to true
   */
  this.reportReply = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(Error(errors.array()[0].msg))
    }

    const { thread_id, reply_id } = req.body

    try {
      const thread = await Thread.findOneAndUpdate(
        {
          _id: thread_id,
          'replies._id': reply_id
        },
        {
          $set: {
            'replies.$.reported': true,
          }
        },
        { new: true }
      )

      if (!thread) {
        throw 'thread_id or reply_id not found'
      }

      res.send('success')

    } catch (err) {
      return next(Error(err))
    }
  }
}

module.exports = ReplyHandler