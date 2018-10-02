const frisby = require('frisby')

const REST_URL = 'http://localhost:3000/rest'

describe('/rest/repeat-notification', () => {
  it('GET triggers repeating notification without passing a challenge', done => {
    frisby.get(REST_URL + '/repeat-notification')
      .expect('status', 200)
      .done(done)
  })

  it('GET triggers repeating notification passing an unsolved challenge', done => {
    frisby.get(REST_URL + '/repeat-notification?challenge=Retrieve%20Blueprint')
      .expect('status', 200)
      .done(done)
  })

  it('GET triggers repeating notification passing a solved challenge', done => {
    frisby.get(REST_URL + '/repeat-notification?challenge=Error%20Handling')
      .expect('status', 200)
      .done(done)
  })
})
