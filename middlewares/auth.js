const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const auth = (req, _, next) => {
  // const { authorization } = req.headers;
  // можем авторизовать и по заголовку и по кукам, в реальной скорее всего не надо,
  // но в тестовой самое то.
  const authorization = req.headers.authorization || req.cookies.jwt;
  if (!authorization) { // || !authorization.startWith('Bearer') // с куками не нужен
    const err = new UnauthorizedError('authorization required');
    return next(err);
  }
  const token = authorization.replace('Bearer', '');
  let payload;
  try {
    payload = jwt.verify(token, 'secret-key'); // как в ПР15 вынесем ключ в .env сделаю его сложнее
  } catch (e) {
    const err = new UnauthorizedError('authorization required');
    return next(err);
  }
  req.user = payload;
  next();
  return ''; // иначе eslint ругается, что нет return. Пустой return; как в вебинаре тоже ошибка.
};

module.exports = { auth };
