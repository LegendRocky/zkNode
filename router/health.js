const express = require('express')
const multer = require('multer')
const boom = require('boom')
const Result = require('../models/Result')
const Health = require('../models/Health')
const healthService = require('../services/health')
const { UPLOAD_PATH } = require('../utils/constant')
const { decode } = require('../utils')

const router = express.Router()

router.get('/members', function(req, res, next) {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空')))
  } else {
    healthService.getHealthList(fileName)
      .then(book => {
        new Result(book).success(res)
      })
      .catch(err => {
        console.log('/book/get', err)
        next(boom.badImplementation(err))
      })
  }
})

router.get('/list', function(req, res, next) {
  healthService.getHealthList()
    .then(list => {
      new Result(list).success(res)
    })
    .catch(err => {
      console.log('/list/get', err)
      next(boom.badImplementation(err))
    })
})

router.get('/search', function(req, res, next) {
  console.log(req.query)
  healthService.searchHealthList(req.query)
    .then(list => {
      new Result(list).success(res)
    })
    .catch(err => {
      console.log('/search/get', err)
      next(boom.badImplementation(err))
    })
})

router.post(
  '/create',
  function(req, res, next) {
    const health = new Health(null, req.body)
    console.log(health)
    healthService.insertHealthFile(health)
      .then(() => {
        new Result().success(res)
      })
      .catch(err => {
        console.log('/book/create', err)
        next(boom.badImplementation(err))
      })
  }
)

module.exports = router
