const mysql = require('mysql')
const debug = require('../utils/env').debug
const {
  host, user, password, database
} = require('./config')
const {
  isObject
} = require('../utils')

function resetSql(query, table) {
  var querySql = `SELECT * FROM \`${table}\` where`
  var limitSql = ''
  //page和limit需要转换，并剔除
  if (query.page && query.limit ) {
    var start = (query.page - 1)*query.limit
    limitSql = limitSql + ` limit ${start} , ${query.limit}`
  }
  delete query.page
  delete query.limit
  const queryLength = Object.keys(query).length
  if(queryLength>0) {
    for ( var key in query ) {
      querySql = querySql + ` ${key} like '%${query[key]}%' and`
    }
    querySql = querySql.slice(0, -4)
  }else{
    querySql = querySql.slice(0, -6)
  }
  return querySql + limitSql
}

function resetCountSql(query, table) {
  var querySql = `SELECT count(*) FROM \`${table}\` where`
  delete query.page
  delete query.limit
  const queryLength = Object.keys(query).length
  if(queryLength>0) {
    for ( var key in query ) {
      querySql = querySql + ` ${key} like '%${query[key]}%' and`
    }
    querySql = querySql.slice(0, -4)
  }else{
    querySql = querySql.slice(0, -6)
  }
  return querySql
}

function orLike(where, k, v) {
  if (where === 'where') {
    return where + ` ${k} like '%${v}%'`
  } else {
    return where + ` or ${k} like '%${v}%'`
  }
}

function andLike(where, k, v) {
  if (where === 'where') {
    return where + ` ${k} like '%${v}%'`
  } else {
    return where + ` and ${k} like '%${v}%'`
  }
}



function or(where, k, v) {
  if (where === 'where') {
    return where + ` ${k}='${v}'`
  } else {
    return where + ` or ${k}='${v}'`
  }
}

function and(where, k, v) {
  if (where === 'where') {
    return where + ` ${k}='${v}'`
  } else {
    return where + ` and ${k}='${v}'`
  }
}

function connect() {
  return mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true
  })
}

function querySql(sql) {
  const conn = connect()
  debug && console.log(sql)
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, results) => {
        if (err) {
          debug && console.log('查询失败，原因:' + JSON.stringify(err))
          reject(err)
        } else {
          debug && console.log('查询成功', JSON.stringify(results))
          resolve(results)
        }
      })
    } catch (e) {
      reject(e)
    } finally {
      conn.end()
    }
  })
}

function querySqlList(sql, onSuccess, onFail) {
  const conn = connect()
  debug && console.log(sql)
  const resultList = []
  let index = 0

  function next() {
    index++
    if (index < sql.length) {
      query()
    } else {
      conn.end()
      onSuccess && onSuccess(resultList)
    }
  }

  function query() {
    conn.query(sql[index], (err, results) => {
      if (err) {
        console.log('操作失败，原因:' + JSON.stringify(err))
        onFail && onFail()
      } else {
        // debug && console.log('操作成功', JSON.stringify(results))
        resultList.push(results)
        next()
      }
    })
  }

  query()
}

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

function queryAll(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results)
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

function queryCount(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results) {
          resolve(results)
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

function update(model, tableName, where) {
  return new Promise(((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      const entry = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          entry.push(`\`${key}\`='${model[key]}'`)
        }
      })
      if (entry.length > 0) {
        let sql = `UPDATE \`${tableName}\` SET`
        sql = `${sql} ${entry.join(',')} ${where}`
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      } else {
        reject(new Error('SQL解析失败'))
      }
    }
  }))
}

function insert(model, tableName) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      const keys = []
      const values = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          keys.push(`\`${key}\``)
          values.push(`'${model[key]}'`)
        }
      })
      console.log(keys)
      console.log(values)
      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\`(`
        const keysString = keys.join(',')
        const valuesString = values.join(',')
        sql = `${sql}${keysString}) VALUES (${valuesString})`
        console.log(sql)
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            console.log(result)
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      } else {
        reject(new Error('SQL解析失败'))
      }
    }
  })
}

module.exports = {
  connect,
  querySql,
  querySqlList,
  orLike,
  or,
  insert,
  queryOne,
  queryAll,
  andLike,
  and,
  update,
  resetSql,
  resetCountSql
}
