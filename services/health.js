const _ = require('lodash')
const db = require('../db')
const fs = require('fs')
const Book = require('../models/Book')
const { UPLOAD_PATH } = require('../utils/constant')
const init = require('../utils/init')

function exists(book) {
  const { title, author, publisher } = book
  const sql = `select * from book where limit 0,5 title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}

async function getHealthList() {
  const healthSql = 'select * from health_members'
  const health = await db.queryAll(healthSql) 
  if (health) {
    return health
  } else {
    throw new Error('电子书不存在')
  }
}

async function searchHealthList(query) {
  const querySql = db.resetSql(query, 'health_members')
  return db.queryAll(querySql)
}

function insertHealthFile(file) {
  return new Promise(async (resolve, reject) => {
    try {
      await db.insert(file, 'health_members')
      resolve()

    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  getHealthList,
  insertHealthFile,
  searchHealthList
}
