function randomDigits(digits) {
  return Math.floor(Math.random() * Math.pow(10, digits)).toString()
}

module.exports = {
  randomDigits,
};