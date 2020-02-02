class Role {
  constructor(file, data) {
    this.createRoleItem(data)
  }

  createRoleItem(data) {
    this.name = data.name
    this.roles = data.roles
    this.owner = data.owner
    this.routes = JSON.stringify(data.routes)
  }
}
module.exports = Role