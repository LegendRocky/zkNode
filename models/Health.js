class Health {
  constructor(file, data) {
    this.createHealthItem(data)
  }

  createHealthItem(data) {
    this.name = data.name
    this.age = data.age
    this.sex = data.sex
    this.mobile = data.mobile
    this.IDnum = data.IDnum
    this.address = data.address
    this.inquiryDepartment = data.inquiryDepartment
    this.inquiryItems = data.inquiryItems
    this.inquiryDoctor = data.inquiryDoctor
    this.channel = data.channel
  }
}
module.exports = Health
