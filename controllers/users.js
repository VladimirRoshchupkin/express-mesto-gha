const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const {
  notFoundError,
  serverError,
  validationError,
  conflictError,
} = require('../errors/errorsStatus');

const getUser = (req, res) => {
  const { id } = req.params || req.user;
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(notFoundError).send({ message: 'User not found' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(validationError).send({ message: 'Id is not correct' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
};

const getUsers = (_, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next());
/*     .catch(() => {
      res.status(serverError).send({ message: 'Server error' });
    }); */
};

const createUser = (req, res) => {
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
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(validationError).send({ message: 'missing user data' });
      }
      if (err.code === 11000) {
        return res.status(conflictError).send({ message: 'User already exist' }); // на случай когда юзеры будут уникальными. взято из вебинара.
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
  return res.status(200);
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  const { _id: id } = req.user;
  User.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true, upsert: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(validationError).send({ message: 'missing user data' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
  return res.status(200);
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const { _id: id } = req.user;
  User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true, upsert: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(validationError).send({ message: 'missing user data' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
  return res.status(200);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findone({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('incorrect login or password'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('incorrect login or password'));
          }
          return user;
          //
        });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: 3600 * 24 * 7 });
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
