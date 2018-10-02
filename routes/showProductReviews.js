const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

const db = require('../data/mongodb')

// Blocking sleep function as in native MongoDB
global.sleep = time => {
  // Ensure that users dont accidentally dos their servers for too long
  if (time > 2000) {
    time = 2000
  }
  const stop = new Date().getTime()
  while (new Date().getTime() < stop + time) {
    ;
  }
}

module.exports = function productReviews () {
  return ({ params }, res, next) => {
    const id = params.id

    // Messure how long the query takes to find out if an there was a nosql dos attack
    const t0 = new Date().getTime()
    db.reviews.find({ '$where': 'this.product == ' + id }).then(reviews => {
      const t1 = new Date().getTime()
      if ((t1 - t0) > 2000) {
        if (utils.notSolved(challenges.noSqlCommandChallenge)) {
          utils.solve(challenges.noSqlCommandChallenge)
        }
      }
      res.json(utils.queryResultToJson(reviews))
    }, () => {
      res.status(400).json({ error: 'Wrong Params' })
    })
  }
}
