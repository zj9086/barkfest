const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('easterEgg', () => {
  const serveEasterEgg = require('../../routes/easterEgg')
  const challenges = require('../../data/datacache').challenges

  beforeEach(() => {
    this.res = { sendFile: sinon.spy() }
    this.req = {}
    this.save = () => ({
      then () { }
    })
  })

  it('should serve /app/private/threejs-demo.html', () => {
    serveEasterEgg()(this.req, this.res)

    expect(this.res.sendFile).to.have.been.calledWith(sinon.match(/app[/\\]private[/\\]threejs-demo\.html/))
  })

  it('should solve "easterEggLevelTwoChallenge"', () => {
    challenges.easterEggLevelTwoChallenge = { solved: false, save: this.save }

    serveEasterEgg()(this.req, this.res)

    expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true)
  })
})
