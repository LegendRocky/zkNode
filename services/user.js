const { queryOne, queryAll, queryCount } = require('./index')
const db = require('../db')
const User = require('../models/User')

function login({ username, password }, next) {
  const sql = `select * from admin_user where username='${username}' and password='${password}'`
  return queryOne(sql, next)
}

function findUser({ username }, next) {
  const sql = `select * from admin_user where username='${username}'`
  return queryOne(sql, next)
}

function findUsers(params, next) {
	const sql = db.resetSql(params, 'admin_user')
	const countSql = db.resetCountSql(params, 'admin_user')
	queryCount(countSql).then(response => {
		console.log(response)
	})
	return queryAll(sql, next)
}

function exists(user) {
  const { username, realname, mobile } = user
  const sql = `select * from admin_user where username='${username}' or realname='${realname}' or mobile='${mobile}'`
  return db.queryOne(sql)
}

async function listUser(p) {
  const {
    page = 1,
    pageSize = 10,
    realname,
    mobile
  }
  = p;
  const offset = (page - 1) * pageSize;
  let userSql = 'select * from admin_user'
  let where = 'where'
  realname && (where = db.andLike(where, 'realname', realname))
  mobile && (where = db.andLike(where, 'mobile', mobile))
  if ( where != 'where' ) {
    userSql = `${userSql} ${where}`
  }
  userSql = `${userSql} limit ${pageSize} offset ${offset}`
  let countSql = `select count(*) as count from admin_user`
  if (where !== 'where') {
    countSql = `${countSql} ${where}`
  }
  const list = await db.querySql(userSql)
  const count = await db.querySql(countSql)
  return { list, count: count[0].count }
}

function insertUser(user) {
  return new Promise(async (resolve, reject) => {
    try {
      if (user instanceof User) {
        const result = await exists(user)
        if (result) {
          //await removeBook(user)
          reject(new Error('用户已存在'))
        } else {
          await db.insert(user, 'admin_user')
          resolve()
        }
      } else {
        reject(new Error('添加的用户对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  login,
  findUser,
  findUsers,
  listUser,
  insertUser
}
