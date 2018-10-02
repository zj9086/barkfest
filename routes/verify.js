const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const jwt = require('jsonwebtoken')
const models = require('../models/index')
const cache = require('../data/datacache')
const Op = models.Sequelize.Op
const challenges = cache.challenges
const products = cache.products

exports.forgedFeedbackChallenge = () => (req, res, next) => {
  /* jshint eqeqeq:false */
  if (utils.notSolved(challenges.forgedFeedbackChallenge)) {
    const user = insecurity.authenticatedUsers.from(req)
    const userId = user && user.data ? user.data.id : undefined
    if (req.body && req.body.UserId && req.body.UserId != userId) { // eslint-disable-line eqeqeq
      utils.solve(challenges.forgedFeedbackChallenge)
    }
  }
  next()
}

exports.captchaBypassChallenge = () => (req, res, next) => {
  /* jshint eqeqeq:false */
  if (utils.notSolved(challenges.captchaBypassChallenge)) {
    if (req.app.locals.captchaReqId >= 10) {
      if ((new Date().getTime() - req.app.locals.captchaBypassReqTimes[req.app.locals.captchaReqId - 10]) <= 10000) {
        utils.solve(challenges.captchaBypassChallenge)
      }
    }
    req.app.locals.captchaBypassReqTimes[req.app.locals.captchaReqId - 1] = new Date().getTime()
    req.app.locals.captchaReqId++
  }
  next()
}

exports.accessControlChallenges = () => ({ url }, res, next) => {
  if (utils.notSolved(challenges.scoreBoardChallenge) && utils.endsWith(url, '/scoreboard.png')) {
    utils.solve(challenges.scoreBoardChallenge)
  } else if (utils.notSolved(challenges.adminSectionChallenge) && utils.endsWith(url, '/administration.png')) {
    utils.solve(challenges.adminSectionChallenge)
  } else if (utils.notSolved(challenges.tokenSaleChallenge) && utils.endsWith(url, '/tokensale.png')) {
    utils.solve(challenges.tokenSaleChallenge)
  } else if (utils.notSolved(challenges.geocitiesThemeChallenge) && utils.endsWith(url, '/microfab.gif')) {
    utils.solve(challenges.geocitiesThemeChallenge)
  } else if (utils.notSolved(challenges.extraLanguageChallenge) && utils.endsWith(url, '/tlh_AA.json')) {
    utils.solve(challenges.extraLanguageChallenge)
  } else if (utils.notSolved(challenges.retrieveBlueprintChallenge) && utils.endsWith(url, cache.retrieveBlueprintChallengeFile)) {
    utils.solve(challenges.retrieveBlueprintChallenge)
  } else if (utils.notSolved(challenges.securityPolicyChallenge) && utils.endsWith(url, '/security.txt')) {
    utils.solve(challenges.securityPolicyChallenge)
  }
  next()
}

exports.errorHandlingChallenge = () => (err, req, { statusCode }, next) => {
  if (utils.notSolved(challenges.errorHandlingChallenge) && err && (statusCode === 200 || statusCode > 401)) {
    utils.solve(challenges.errorHandlingChallenge)
  }
  next(err)
}

exports.jwtChallenges = () => (req, res, next) => {
  if (utils.notSolved(challenges.jwtTier1Challenge)) {
    jwtChallenge(challenges.jwtTier1Challenge, req, 'none', /jwtn3d@/)
  }
  if (utils.notSolved(challenges.jwtTier2Challenge)) {
    jwtChallenge(challenges.jwtTier2Challenge, req, 'HS256', /rsa_lord@/)
  }
  next()
}

function jwtChallenge (challenge, req, algorithm, email) {
  const decoded = jwt.decode(utils.jwtFrom(req), { complete: true, json: true })
  if (hasAlgorithm(decoded, algorithm) && hasEmail(decoded, email)) {
    utils.solve(challenge)
  }
}

function hasAlgorithm (token, algorithm) {
  return token && token.header && token.header.alg === algorithm
}

function hasEmail (token, email) {
  return token && token.payload && token.payload.data && token.payload.data.email && token.payload.data.email.match(email)
}

exports.databaseRelatedChallenges = () => (req, res, next) => {
  if (utils.notSolved(challenges.changeProductChallenge) && products.osaft) {
    changeProductChallenge(products.osaft)
  }
  if (utils.notSolved(challenges.feedbackChallenge)) {
    feedbackChallenge()
  }
  if (utils.notSolved(challenges.knownVulnerableComponentChallenge)) {
    knownVulnerableComponentChallenge()
  }
  if (utils.notSolved(challenges.weirdCryptoChallenge)) {
    weirdCryptoChallenge()
  }
  if (utils.notSolved(challenges.typosquattingNpmChallenge)) {
    typosquattingNpmChallenge()
  }
  if (utils.notSolved(challenges.typosquattingBowerChallenge)) {
    typosquattingBowerChallenge()
  }
  if (utils.notSolved(challenges.hiddenImageChallenge)) {
    hiddenImageChallenge()
  }
  if (utils.notSolved(challenges.supplyChainAttackChallenge)) {
    supplyChainAttackChallenge()
  }
  next()
}

function changeProductChallenge (osaft) {
  osaft.reload().then(() => {
    if (!utils.contains(osaft.description, 'https://www.owasp.org/index.php/O-Saft')) {
      if (utils.contains(osaft.description, '<a href="http://kimminich.de" target="_blank">More...</a>')) {
        utils.solve(challenges.changeProductChallenge)
      }
    }
  })
}

function feedbackChallenge () {
  models.Feedback.findAndCountAll({ where: { rating: 5 } }).then(({ count }) => {
    if (count === 0) {
      utils.solve(challenges.feedbackChallenge)
    }
  })
}

function knownVulnerableComponentChallenge () {
  models.Feedback.findAndCountAll({
    where: {
      comment: {
        [Op.or]: knownVulnerableComponents()
      }
    }
  }).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.knownVulnerableComponentChallenge)
    }
  })
  models.Complaint.findAndCountAll({
    where: {
      message: {
        [Op.or]: knownVulnerableComponents()
      }
    }
  }).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.knownVulnerableComponentChallenge)
    }
  })
}

function knownVulnerableComponents () {
  return [
    {
      [Op.and]: [
        { [Op.like]: '%sanitize-html%' },
        { [Op.like]: '%1.4.2%' }
      ]
    },
    {
      [Op.and]: [
        { [Op.like]: '%express-jwt%' },
        { [Op.like]: '%0.1.3%' }
      ]
    }
  ]
}

function weirdCryptoChallenge () {
  models.Feedback.findAndCountAll({
    where: {
      comment: {
        [Op.or]: weirdCryptos()
      }
    }
  }).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.weirdCryptoChallenge)
    }
  })
  models.Complaint.findAndCountAll({
    where: {
      message: {
        [Op.or]: weirdCryptos()
      }
    }
  }).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.weirdCryptoChallenge)
    }
  })
}

function weirdCryptos () {
  return [
    { [Op.like]: '%z85%' },
    { [Op.like]: '%base85%' },
    { [Op.like]: '%hashids%' },
    { [Op.like]: '%md5%' },
    { [Op.like]: '%base64%' }
  ]
}

function typosquattingNpmChallenge () {
  models.Feedback.findAndCountAll({ where: { comment: { [Op.like]: '%epilogue-js%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.typosquattingNpmChallenge)
    }
  })
  models.Complaint.findAndCountAll({ where: { message: { [Op.like]: '%epilogue-js%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.typosquattingNpmChallenge)
    }
  })
}

function typosquattingBowerChallenge () {
  models.Feedback.findAndCountAll({ where: { comment: { [Op.like]: '%angular-tooltipp%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.typosquattingBowerChallenge)
    }
  })
  models.Complaint.findAndCountAll({ where: { message: { [Op.like]: '%angular-tooltipp%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.typosquattingBowerChallenge)
    }
  })
}

function hiddenImageChallenge () {
  models.Feedback.findAndCountAll({ where: { comment: { [Op.like]: '%pickle rick%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.hiddenImageChallenge)
    }
  })
  models.Complaint.findAndCountAll({ where: { message: { [Op.like]: '%pickle rick%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.hiddenImageChallenge)
    }
  })
}

function supplyChainAttackChallenge () { // TODO Extend to also pass for given CVE once one has been assigned (otherwise remove CVE mention from challenge description)
  models.Feedback.findAndCountAll({ where: { comment: { [Op.like]: '%https://github.com/eslint/eslint-scope/issues/39%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.supplyChainAttackChallenge)
    }
  })
  models.Complaint.findAndCountAll({ where: { message: { [Op.like]: '%https://github.com/eslint/eslint-scope/issues/39%' } } }
  ).then(({ count }) => {
    if (count > 0) {
      utils.solve(challenges.supplyChainAttackChallenge)
    }
  })
}
