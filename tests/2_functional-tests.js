/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')
const Thread = require('../models/Thread')

chai.use(chaiHttp)

before(done => {
  Thread.deleteMany({})
    .exec((err) => {
      if (err) { throw new Error(err) }
      console.log('Deleted all documents in threads collection')
      done()
    })
})

const fake_id = '111111111111111111111111'
let test_doc
let gen_doc
let gen_docs
before(done => {
  const newThreads = Array(20).fill().map((v,i) => ({
    board: 'test',
    delete_password: 'password',
    text: `auto-generated thread ${i+1}`,
    replies: Array(5).fill().map((v, i) => ({
      text: `auto-generated reply ${i+1}`,
      delete_password: 'password',
    }))
  }))

  Thread.insertMany(newThreads, (err, docs) => {
    if (err) { throw new Error(err) }
    gen_doc = docs[0]
    gen_docs = docs
    console.log('Inserted multiple test Thread documents to DB')
    done()
  })
})


suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('new thread with no param or body', done => {
        chai.request(server)
          .post(`/api/threads`)
          .end((err, res) => {
            assert.ok(res.status)
            assert.equal(res.text, 'Page Not Found')
            done()
          })
      })

      test('new thread with no body', done => {
        chai.request(server)
          .post(`/api/threads/test`)
          .send({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, 'text missing')
            done()
          })
      })

      test('new thread with valid body', done => {
        chai.request(server)
          .post(`/api/threads/test`)
          .send({
            text: 'first test-generated thread',
            delete_password: 'password',
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.equal(
              res.redirects[0].split('/b/')[1],
              'test',
              'should be redirected to `/b/test`'
            )
            done()
          })
      })
    })
    
    suite('GET', function() {
      
      test('test get request for `test` board threads', done => {
        chai.request(server)
          .get(`/api/threads/test`)
          .end((err, res) => {
            assert.ok(res.status)
            assert.isArray(res.body)
            assert.equal(res.body.length, 10, 'GET request should return only 10 items')
            assert.isAbove(
              new Date(res.body[0].bumped_on).getTime(),
              new Date(res.body[1].bumped_on).getTime(),
              'First item in response array should be most recently bumped document'
            )
            assert.equal(res.body[0].text, 'first test-generated thread')
            assert.notProperty(res.body[0], 'delete_password', 'delete_password should not be a property of Thread')
            assert.notProperty(res.body[0], 'reported', 'reported should not be a property of Thread')
            assert.isArray(res.body[1].replies, 'Thread replies should be of type Array')
            assert.isAtMost(res.body[1].replies.length, 3, 'replies array should only contain a max of 3 items')
            assert.notProperty(res.body[1].replies[0], 'delete_password', 'delete_password should not be a property of replies')
            assert.notProperty(res.body[1].replies[0], 'reported', 'reported should not be a property of replies')
            test_doc = res.body[0]
            done()
          })
      })
    })
    
    suite('DELETE', function() {
      
      test('test delete request with no body', done => {
        chai.request(server)
          .delete(`/api/threads/test`)
          .send({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, 'thread_id should be a valid MongoID')
            done()
          })
      })

      test('test delete request with non-existent thread_id', done => {
        chai.request(server)
          .delete(`/api/threads/test`)
          .send({thread_id: fake_id, delete_password: 'password'})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, `thread_id ${fake_id} not found`)
            done()
          })
      })

      test('test delete request with invalid delete_password', done => {
        chai.request(server)
          .delete(`/api/threads/test`)
          .send({
            thread_id: gen_doc._id.toString(),
            delete_password: 'wordpass'
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res, 'text', 'Response must include `text` property')
            assert.equal(res.text, 'incorrect password')
            done()
          })
        })
        
      test('test delete request with valid body', done => {
        chai.request(server)
        .delete(`/api/threads/test`)
        .send({
          thread_id: gen_doc._id.toString(),
          delete_password: 'password'
        })
        .end((err, res) => {
          assert.ok(res.status)
          assert.property(res, 'text', 'Response must include `text` property')
          assert.equal(res.text, 'success')
          gen_doc = gen_docs[1]
          done()
        })
      })


    })
    
    suite('PUT', function() {
      
      test('request with empty body', done => {
        chai.request(server)
        .put(`/api/threads/test`)
        .send({})
        .end((err, res) => {
          assert.ok(res.status)
          assert.property(res.body, 'success', "response must include 'success' property")
          assert.property(res.body, 'error', "response must include 'error' property")
          assert.isFalse(res.body.success)
          assert.equal(res.body.error, `thread_id should be a valid MongoID`)
          done()
        })
      })

      test('request with invalid thread_id', done => {
        chai.request(server)
        .put(`/api/threads/test`)
        .send({thread_id: fake_id})
        .end((err, res) => {
          assert.ok(res.status)
          assert.property(res.body, 'success', "response must include 'success' property")
          assert.property(res.body, 'error', "response must include 'error' property")
          assert.isFalse(res.body.success)
          assert.equal(res.body.error, `thread_id ${fake_id} not found`)
          done()
        })
      })

      test('request with valid thread_id', done => {
        chai.request(server)
        .put(`/api/threads/test`)
        .send({thread_id: gen_doc._id.toString()})
        .end((err, res) => {
          assert.ok(res.status)
          assert.property(res, 'text', "response must include 'text' property")
          assert.equal(res.text, 'success')
          done()
        })
      })

    })
    

  })
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('new reply missing body', done => {
        chai.request(server)
          .post('/api/replies/test')
          .send({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success')
            assert.property(res.body, 'error')
            assert.isFalse(res.body.success, 'Reponse success should be false')
            assert.equal(res.body.error, 'thread_id should be a valid MongoID')
            done()
          })
      })

      test('new reply with non-existent thread_id', done => {
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id: fake_id,
            delete_password: 'password',
            text: 'first reply'
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success')
            assert.property(res.body, 'error')
            assert.isFalse(res.body.success, 'Reponse success should be false')
            assert.equal(res.body.error, `thread_id ${fake_id} not found`)
            done()
          })
      })

      test('new reply valid body', done => {
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id: test_doc._id,
            delete_password: 'password',
            text: 'first test-generated reply'
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.equal(
              res.redirects[0].split('/b/')[1],
              `test/${test_doc._id}`,
              `should be redirected to \`/b/test${test_doc._id}\``
            )
            done()
          })
      })
      
    })
    
    suite('GET', function() {

      test('get request with missing thread_id', done => {
        chai.request(server)
          .get('/api/replies/test')
          .query({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success')
            assert.property(res.body, 'error')
            assert.isFalse(res.body.success, 'Reponse success should be false')
            assert.equal(res.body.error, 'thread_id should be a valid MongoID')
            done()
          })
      })

      test('get request with non-existent thread_id', done => {
        chai.request(server)
          .get('/api/replies/test')
          .query({thread_id: fake_id})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success')
            assert.property(res.body, 'error')
            assert.isFalse(res.body.success, 'Reponse success should be false')
            assert.equal(res.body.error, `thread_id ${fake_id} not found`)
            done()
          })
      })

      test('get request with valid thread_id', done => {
        chai.request(server)
          .get('/api/replies/test')
          .query({ thread_id: gen_docs[1]._id.toString() })
          .end((err, res) => {
            assert.ok(res.status)
            assert.isObject(res.body)
            assert.property(res.body, '_id', 'Response must include _id mongoID')
            assert.property(res.body, 'text', 'Response must include text')
            assert.property(res.body, 'created_on', 'Response must include created_on date')
            assert.property(res.body, 'bumped_on', 'Response must include bumped_on date')
            assert.property(res.body, 'replies', 'Response must include replies array')
            assert.isArray(res.body.replies, 'replies value must be an array')
            assert.property(res.body.replies[0], 'created_on')
            assert.property(res.body.replies[0], '_id')
            assert.property(res.body.replies[0], 'text')
            assert.notProperty(res.body.replies[0], 'delete_password')
            assert.notProperty(res.body.replies[0], 'reported')
            done()
          })
      })

    })
    
    suite('PUT', function() {
      
      test('request with no body', done => {
        chai.request(server)
          .put(`/api/replies/test`)
          .send({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, 'thread_id should be a valid MongoID')
            done()
          })
      })

      test('request with non-existent thread_id or reply_id', done => {
        chai.request(server)
          .put(`/api/replies/test`)
          .send({
            thread_id: fake_id,
            reply_id: fake_id,
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, 'thread_id or reply_id not found')
            done()
          })
      })

      test('request with valid body', done => {
        chai.request(server)
          .put(`/api/replies/test`)
          .send({
            thread_id: gen_doc._id.toString(),
            reply_id: gen_doc.replies[0]._id.toString(),
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res, 'text', "response must include 'text' property")
            assert.equal(res.text, 'success')
            done()
          })
      })

      test('validate reply reported was changed to true', done => {
        Thread.findOne({ 'replies._id': gen_doc.replies[0]._id.toString() },
          (err, thread) => {
            assert.isNull(err, 'Error occured querying DB')
            assert.exists(thread, `reply_id doesn't exist in DB`)
            assert.isTrue(thread.replies[0].reported)
            done()
          })
      })

    })
    
    suite('DELETE', function() {
      
      test('request with no body', done => {
  
        chai.request(server)
          .delete(`/api/replies/test`)
          .send({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, 'thread_id should be a valid MongoID')
            done()
          })
      })

      test('request with non-existent thread_id or reply_id', done => {
        chai.request(server)
          .delete(`/api/replies/test`)
          .send({
            thread_id: fake_id,
            reply_id: fake_id,
            delete_password: 'password'
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', "response must include 'success' property")
            assert.property(res.body, 'error', "response must include 'error' property")
            assert.isFalse(res.body.success)
            assert.equal(res.body.error, 'thread_id or reply_id not found')
            done()
          })
      })

      test('request with invalid delete_password', done => {
        chai.request(server)
          .delete(`/api/replies/test`)
          .send({
            thread_id: gen_doc._id.toString(),
            reply_id: gen_doc.replies[0]._id.toString(),
            delete_password: 'wordpass'
          })
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res, 'text', 'Response must include `text` property')
            assert.equal(res.text, 'incorrect password')
            done()
          })
        })
        
      test('request with valid body', done => {
        chai.request(server)
        .delete(`/api/replies/test`)
        .send({
          thread_id: gen_doc._id.toString(),
          reply_id: gen_doc.replies[0]._id.toString(),
          delete_password: 'password'
        })
        .end(async(err, res) => {
          assert.ok(res.status)
          assert.property(res, 'text', 'Response must include `text` property')
          assert.equal(res.text, 'success')
          done()
        })
      })

      test('validate text was deleted', done => {
        Thread.findOne({'replies._id': gen_doc.replies[0]._id.toString()},
        (err, thread) => {
          assert.isNull(err, 'Error occured querying DB')
          assert.exists(thread, `reply_id doesn't exist`)
          assert.equal(thread.replies[0].text, '[deleted]')
          done()
        })
      })

    })
    
  })

})
