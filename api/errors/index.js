function notFound(req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
}


function production(err, req, res, next) {
  res.status(err.status || 500)
  res.json({message: err.message})
}

process.on('unhandledRejection', (reason, p) => {
  // I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
  throw reason;
});

process.on('uncaughtException', (error) => {
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed
  production(error)
});

module.exports.notFound = notFound
module.exports.production = production
