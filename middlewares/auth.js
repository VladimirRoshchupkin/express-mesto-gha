const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const auth = (req, _, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startWith('Bearer')) {
    return Promise.reject(new UnauthorizedError('authorization required'));
  }
  const token = authorization.replace('Bearer', '');
  let payload;

  try {
    payload = jwt.verify(token, 'secret-key'); // как в ПР15 вынесем ключ в .env сделаю его сложнее
  } catch (err) {
    return Promise.reject(new UnauthorizedError('authorization required'));
  }
  req.user = payload;
  next();
  return ''; // иначе eslint ругается, что нет return. Пустой return; как в вебинаре тоже вызывает ошибку.
};

module.exports = { auth };
