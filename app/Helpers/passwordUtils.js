const bcrypt = require('bcryptjs');

exports.hashPassword=(userPassword)=> {
  return bcrypt.hash(userPassword, 10);
}

exports.comparePassword=(password, hashedPassword)=> {
  return bcrypt.compare(password, hashedPassword);
}