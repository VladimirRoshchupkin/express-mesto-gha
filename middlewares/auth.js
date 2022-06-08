const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const auth = (req, _, next) => {
  console.log('auth-1', req.headers.authorization, req.cookies.jwt);
  // const { authorization } = req.headers;
  // можем авторизовать и по заголовку и по кукам, в реальной скорее всего не надо,
  // но в тестовой самое то.
  const authorization = req.headers.authorization || req.cookies.jwt;
  console.log('auth-1 const=', authorization);
  if (!authorization) { // || !authorization.startWith('Bearer')
    console.log('auth-01');
    // return Promise.reject(new UnauthorizedError('authorization required'));
    const err = new UnauthorizedError('authorization required');
    return next(err);
  }
  console.log('auth-2');
  const token = authorization.replace('Bearer', '');
  let payload;
  console.log('auth-3', token);
  try {
    console.log('auth-try');
    payload = jwt.verify(token, 'secret-key'); // как в ПР15 вынесем ключ в .env сделаю его сложнее
  } catch (e) {
    console.log('auth-02', e);
    // return Promise.reject(new UnauthorizedError('authorization required'));
    const err = new UnauthorizedError('authorization required');
    return next(err);
  }
  console.log('auth-4');
  req.user = payload;
  next();
  console.log('auth-5 requser=', req.user);
  return ''; // иначе eslint ругается, что нет return. Пустой return; как в вебинаре тоже ошибка.
};

module.exports = { auth };
