/* jslint node: true */
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'username', 'password', { // lgtm [js/hardcoded-credentials]
  dialect: 'sqlite',
  storage: 'data/juiceshop.sqlite',
  logging: false,
  operatorsAliases: false
})
const db = {}

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
