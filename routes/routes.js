

module.exports = (app) => {

  ///////////////////////////////////////////////////////////
  // Testing/Debug Middleware
  ///////////////////////////////////////////////////////////
  app.use((req, res, next) => {
    // console.debug(`DEBUG originalUrl: ${req.originalUrl}`) 
    next()
  })

  
  
  ///////////////////////////////////////////////////////////
  // API
  ///////////////////////////////////////////////////////////
  const apiRouter = require('./api')()
  const viewRouter = require('./apiview')()
  app.use("/api", apiRouter)
  app.use("/b", viewRouter)


  ///////////////////////////////////////////////////////////
  // Root Router Handler, Serves Pug rendered index
  ///////////////////////////////////////////////////////////
  app.route('/')
    .get((req, res, next) => {
      res.render('index', {
      title: app.get('title'),
      header: app.get('header')
      })
    })


  ///////////////////////////////////////////////////////////
  // 404 Not Found Handler
  ///////////////////////////////////////////////////////////
  app.use((req, res, next) => {
    res.status(404)
    .type('text')
    .send('Page Not Found');
  })


  ///////////////////////////////////////////////////////////
  // Error Handler
  ///////////////////////////////////////////////////////////
  app.use((err, req, res, next) => {
    // console.error('Error handler', err.message)

    res.send({success: false, error: err.message})
  })
}