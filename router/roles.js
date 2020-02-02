const express = require('express')
const boom = require('boom')
const Result = require('../models/Result')
const rolesService = require('../services/roles')
const querystring = require('querystring')
const Role = require('../models/Role')

const router = express.Router()

router.get('/list', function(req, res, next) {
  rolesService.listRoles(req.query)
    .then(({ list, count }) => {
      new Result(
        list,
        '获取权限列表成功',
        {
          total: count || 0
        }
      ).success(res)
    })
    .catch(err => {
      console.log('/roles/list', err)
      next(boom.badImplementation(err))
    })
})

router.post('/role', function(req, res, next) {
  const list = JSON.stringify(req.body)

  const role = new Role(null, req.body)

  rolesService.addRole(role)
      .then(() => {
        new Result("添加权限成功").success(res)
      })
      .catch(err => {
        console.log('/role/add', err)
        next(boom.badImplementation(err))
      })

  new Result(
    list,
    '获取权限列表成功'
  ).success(res)
})

router.get('/routesByRole', function(req, res, next) {
  console.log(123123)
  console.log(req.query)
  rolesService.findRoutesByRole(req.query)
    .then(({routes}) => {
      new Result(routes, "查找权限路由成功").success(res)
      })
      .catch(err => {
        console.log('/role/routesByRole', err)
        next(boom.badImplementation(err))
    })

})

module.exports = router
