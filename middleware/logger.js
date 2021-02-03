const logger = (req, res, next) => {

  console.log('===========> Cookies ');
  console.log( req.cookies)

  console.log(
    `${req.method} ${req.protocol}://${req.host}${req.originalUrl}`.green
  );
  next();
};

module.exports = logger;
