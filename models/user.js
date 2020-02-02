class User {
  constructor(file, data) {
    this.createUserItem(data)
  }

  createUserItem(data) {
    this.username = data.username
    this.realname = data.realname
    this.roles = 'admin,editor'
    this.mobile = data.mobile
  }
}
module.exports = User
