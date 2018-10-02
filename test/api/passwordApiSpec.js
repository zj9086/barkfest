const frisby = require('frisby')
const config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }

describe('/rest/user/change-password', () => {
  it('GET password change for newly created user with recognized token as cookie', done => {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'kuni@be.rt',
        password: 'kunigunde'
      }
    })
      .expect('status', 201)
      .then(() => frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'kuni@be.rt',
          password: 'kunigunde'
        }
      })
        .expect('status', 200)
        .then(({ json }) => frisby.get(REST_URL + '/user/change-password?current=kunigunde&new=foo&repeat=foo', {
          headers: { 'Cookie': 'token=' + json.authentication.token }
        })
          .expect('status', 200)))
      .done(done)
  })

  it('GET password change for newly created user with recognized token as cookie in double-quotes', done => {
    frisby.post(API_URL + '/Users', {
      headers: jsonHeader,
      body: {
        email: 'kuni@gun.de',
        password: 'kunibert'
      }
    })
      .expect('status', 201)
      .then(() => frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'kuni@gun.de',
          password: 'kunibert'
        }
      })
        .expect('status', 200)
        .then(({ json }) => frisby.get(REST_URL + '/user/change-password?current=kunibert&new=foo&repeat=foo', {
          headers: { 'Cookie': 'token=%22' + json.authentication.token + '%22' }
        })
          .expect('status', 200)))
      .done(done)
  })

  it('GET password change with passing wrong current password', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        password: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .then(({ json }) => frisby.get(REST_URL + '/user/change-password?current=definetely_wrong&new=blubb&repeat=blubb', {
        headers: { 'Cookie': 'token=' + json.authentication.token }
      })
        .expect('status', 401)
        .expect('bodyContains', 'Current password is not correct'))
      .done(done)
  })

  it('GET password change without passing any passwords', done => {
    frisby.get(REST_URL + '/user/change-password')
      .expect('status', 401)
      .expect('bodyContains', 'Password cannot be empty')
      .done(done)
  })

  it('GET password change with passing wrong repeated password', done => {
    frisby.get(REST_URL + '/user/change-password?new=foo&repeat=bar')
      .expect('status', 401)
      .expect('bodyContains', 'New and repeated password do not match')
      .done(done)
  })

  it('GET password change without passing an authorization token', done => {
    frisby.get(REST_URL + '/user/change-password?new=foo&repeat=foo')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })

  it('GET password change with passing unrecognized authorization cookie', done => {
    frisby.get(REST_URL + '/user/change-password?new=foo&repeat=foo', { headers: { 'Cookie': 'token=unknown' } })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })

  it('GET password change for Bender without current password using CSRF', done => {
    frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'bender@' + config.get('application.domain'),
        password: 'OhG0dPlease1nsertLiquor!'
      }
    })
      .expect('status', 200)
      .then(({ json }) => frisby.get(REST_URL + '/user/change-password?new=slurmCl4ssic&repeat=slurmCl4ssic', {
        headers: { 'Cookie': 'token=' + json.authentication.token }
      })
        .expect('status', 200)).done(done)
  })
})

describe('/rest/user/reset-password', () => {
  it('POST password reset for Jim with correct answer to his security question', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        answer: 'Samuel',
        new: 'ncc-1701',
        repeat: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .done(done)
  })

  it('POST password reset for Bender with correct answer to his security question', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'bender@' + config.get('application.domain'),
        answer: 'Stop\'n\'Drop',
        new: 'OhG0dPlease1nsertLiquor!',
        repeat: 'OhG0dPlease1nsertLiquor!'
      }
    })
      .expect('status', 200)
      .done(done)
  })

  it('POST password reset for Bjoern with correct answer to his security question', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        answer: 'West-2082',
        new: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==',
        repeat: 'YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ=='
      }
    })
      .expect('status', 200)
      .done(done)
  })

  it('POST password reset for Morty with correct answer to his security question', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'morty@' + config.get('application.domain'),
        answer: '5N0wb41L',
        new: 'iBurri3dMySe1fInTheB4ckyard!',
        repeat: 'iBurri3dMySe1fInTheB4ckyard!'
      }
    })
      .expect('status', 200)
      .done(done)
  })

  it('POST password reset with wrong answer to security question', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        answer: '25436',
        new: '12345',
        repeat: '12345'
      }
    })
      .expect('status', 401)
      .expect('bodyContains', 'Wrong answer to security question.')
      .done(done)
  })

  it('POST password reset without any data is blocked', done => {
    frisby.post(REST_URL + '/user/reset-password')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })

  it('POST password reset without new password throws a 401 error', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        answer: 'W-2082',
        repeat: '12345'
      }
    })
      .expect('status', 401)
      .expect('bodyContains', 'Password cannot be empty.')
      .done(done)
  })

  it('POST password reset with mismatching passwords throws a 401 error', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        answer: 'W-2082',
        new: '12345',
        repeat: '1234_'
      }
    })
      .expect('status', 401)
      .expect('bodyContains', 'New and repeated password do not match.')
      .done(done)
  })

  it('POST password reset with no email address throws a 412 error', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      header: jsonHeader,
      body: {
        answer: 'W-2082',
        new: 'abcdef',
        repeat: 'abcdef'
      }
    })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })

  it('POST password reset with no answer to the security question throws a 412 error', done => {
    frisby.post(REST_URL + '/user/reset-password', {
      header: jsonHeader,
      body: {
        email: 'bjoern.kimminich@googlemail.com',
        new: 'abcdef',
        repeat: 'abcdef'
      }
    })
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'Error: Blocked illegal activity')
      .done(done)
  })
})
