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
    text: `test thread ${i+1}`,
    replies: Array(5).fill().map((v, i) => ({
      text: `test reply ${i+1}`,
      delete_password: 'password',
    }))
  }))

  Thread.insertMany(newThreads, (err, docs) => {
    if (err) { throw new Error(err) }
    test_id = docs[0]._id
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
            text: 'first thread',
            delete_password: 'password'
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
      
      test('test get request', done => {
        chai.request(server)
          .get(`/api/threads/test`)
          .end((err, res) => {
            console.log('id', test_id)
            assert.ok(res.status)
            assert.isArray(res.body)
            const doc = res.body.filter(v => v._id == test_id)[0]
            console.log(doc.replies[0])
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
            thread_id: null,
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
