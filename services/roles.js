const { queryOne, queryAll, queryCount } = require('./index')
const db = require('../db')
const Role = require('../models/Role')

function exists(role) {
  const { name } = role
  const sql = `select * from roles where name='${name}'`
  return db.queryOne(sql)
}

async function listRoles(p) {
  const {
    page = 1,
    pageSize = 10,
    name,
    owner
  }
  = p;
  const offset = (page - 1) * pageSize;
  let rolesSql = 'select * from roles'
  let where = 'where'
  name && (where = db.andLike(where, 'name', name))
  owner && (where = db.andLike(where, 'owner', owner))
  if ( where != 'where' ) {
    rolesSql = `${rolesSql} ${where}`
  }
  rolesSql = `${rolesSql} limit ${pageSize} offset ${offset}`

  let countSql = `select count(*) as count from roles`
  if (where !== 'where') {
    countSql = `${countSql} ${where}`
  }
  const list = await db.querySql(rolesSql)
  list.forEach(item => {
    item.routes = JSON.parse(item.routes)
  })

  const count = await db.querySql(countSql)
  return { list, count: count[0].count }
}
async function addRole(role) {
  return new Promise(async (resolve, reject) => {
    try {
      if (role instanceof Role) {
        const result = await exists(role)
        if (result) {
          //await removeBook(user)
          reject(new Error('用户已存在'))
        } else {
          await db.insert(role, 'roles')
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

async function findRoutesByRole(p) {
  const {
    roles
  }
  = p;
  let routesSql = 'select * from roles'
  let where = 'where'
  roles && (where = db.andLike(where, 'name', roles))
  if ( where != 'where' ) {
    routesSql = `${routesSql} ${where}`
  }

  const list = await db.queryOne(routesSql)
  console.log(1111)
  const routes = JSON.parse(list.routes)
  console.log(routes)
  return {routes}
}

module.exports = {
  listRoles,
  addRole,
  findRoutesByRole
}
