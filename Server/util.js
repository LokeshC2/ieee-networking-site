function random_digits(n) {
  return Math.floor(Math.random() * 10 ** n).toString().padStart(n, "0");
}

module.exports = {
  random_digits,
};