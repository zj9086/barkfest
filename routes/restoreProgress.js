const Hashids = require('hashids')
const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
const challenges = require('../data/datacache').challenges
const utils = require('../lib/utils')

module.exports = function restoreProgress () {
  return ({ params }, res) => {
    const continueCode = params.continueCode
    const ids = hashids.decode(continueCode)
    if (utils.notSolved(challenges.continueCodeChallenge) && ids.length === 1 && ids[ 0 ] === 99) {
      utils.solve(challenges.continueCodeChallenge)
      res.end()
    } else if (ids.length > 0) {
      for (const name in challenges) {
        if (challenges.hasOwnProperty(name)) {
          if (ids.includes(challenges[ name ].id)) {
            utils.solve(challenges[ name ], true)
          }
        }
      }
      res.end()
    } else {
      res.status(404).send('Invalid continue code.')
    }
  }
}
