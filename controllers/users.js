const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../errors/UnauthorizedError'); // очень неудобно ограничение 1файл=1класс
const { NotFoundError } = require('../errors/NotFoundError');
const { ValidationError } = require('../errors/ValidationError');
// const { ServerError } = require('../errors/ServerError');
const { ConflictError } = require('../errors/ConflictError');
// const { serverError } = require('../errors/errorsStatus');

// const {
// notFoundError,
// serverError,
// validationError,
// conflictError,
// } = require('../errors/errorsStatus');

const getUser = (req, res, next) => {
  console.log('GetUser');
  const { id } = req.params || req.user;
  User.findById(id)
    .then((user) => {
      if (!user) {
        // return res.status(notFoundError).send({ message: 'User not found' });
        throw new NotFoundError('User not found');
      }
      return res.status(200).send(user);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        // return res.status(validationError).send({ message: 'Id is not correct' });
        const err = new ValidationError('Id is not correct');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      // const err = new ServerError('Server error');
      return next(e);
    });
};

const getUsers = (_, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
  /*     .catch(() => {
      const err = new ServerError('Server error');
      return next(err);
    }); */
/*     .catch(() => {
      res.status(serverError).send({ message: 'Server error' });
    }); */
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        // return res.status(validationError).send({ message: 'missing user data' });
        const err = new ValidationError('missing user data');
        return next(err);
      }
      if (e.code === 11000) {
        // return res.status(conflictError).send({ message: 'User already exist' });
        const err = new ConflictError('User already exist');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      // const err = new ServerError('Server error');
      return next(e);
    });
  // return res.status(200);
};

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  const { _id: id } = req.user;
  User.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true, upsert: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        // return res.status(validationError).send({ message: 'missing user data' });
        const err = new ValidationError('missing user data');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      // const err = new ServerError('Server error');
      return next(e);
    });
  // return res.status(200);
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const { _id: id } = req.user;
  User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true, upsert: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        // return res.status(validationError).send({ message: 'missing user data' });
        const err = new ValidationError('missing user data');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      return next(e);
    });
  // return res.status(200);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findone({ email }).select('+password')
    .then((user) => {
      if (!user) {
        // return Promise.reject(new UnauthorizedError('incorrect login or password'));
        const err = new UnauthorizedError('incorrect login or password');
        return next(err);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // return Promise.reject(new UnauthorizedError('incorrect login or password'));
            const err = new UnauthorizedError('incorrect login or password');
            return next(err);
          }
          return user;
          //
        });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: 3600 * 24 * 7 }); // как в ПР15 вынесем ключ в .env сделаю его сложнее
      return token;
    })
    .then((token) => {
      res.cookie('jwt', token, { maxAge: 1000 * 3600 * 24 * 7, httpOnly: true }).end();
    })
    .catch(next());
};

module.exports = {
  getUser,
  getUsers,
  // getCurrentUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
};
