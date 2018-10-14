/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Thread = require('../models/Thread')

chai.use(chaiHttp);

before(done => {
  Thread.deleteMany({})
    .exec((err) => {
      if (err) { throw new Error(err) }
      console.log('Deleted all documents in threads collection')
      done()
    })
})

let test_id
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
            assert.equal(res.body.error, 'Text missing')
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
    });
    
    suite('GET', function() {
      
      let test_doc
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
            test_doc = res.body[0]
            thread_id = test_doc._id
            done()
          })
      })
    });
    
    suite('DELETE', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('new reply with valid body', done => {
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id,
          })
          .end(err => {
            assert.ok()
            done()
          })
      })
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
