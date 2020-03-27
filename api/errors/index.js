function notFound(req, res, next) {
  res.status(404).send('Not found')
}

function production(err, req, res, next) {
  console.error('\nError:\n', err)
  res.status(500).send({message: 'Internal server error'})
}

process.on('unhandledRejection', (reason, p) => {
  // I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
  throw reason;
});

process.on('uncaughtException', (err) => {
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed
  console.error('\nError:\n', err)
});

module.exports.notFound = notFound
module.exports.production = production
