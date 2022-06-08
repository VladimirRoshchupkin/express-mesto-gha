const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../errors/UnauthorizedError'); // очень неудобно ограничение 1файл=1класс
const { NotFoundError } = require('../errors/NotFoundError');
const { ValidationError } = require('../errors/ValidationError');
const { ConflictError } = require('../errors/ConflictError');

const getUser = (req, res, next) => {
  const id = req.params.id || req.user._id; // и текущего и любого получим
  User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return res.status(200).send(user);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        const err = new ValidationError('Id is not correct');
        return next(err);
      }
      return next(e);
    });
};

const getUsers = (_, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
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
    .then((user) => { // что-то не выходит просто удалить поле password из объекта
      res.status(201).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user.id,
      });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new ValidationError('missing user data');
        return next(err);
      }
      if (e.code === 11000) {
        const err = new ConflictError('User already exist');
        return next(err);
      }
      return next(e);
    });
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
        const err = new ValidationError('missing user data');
        return next(err);
      }
      return next(e);
    });
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
        const err = new ValidationError('missing user data');
        return next(err);
      }
      return next(e);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const err = new UnauthorizedError('incorrect login or password1');
        return next(err);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const err = new UnauthorizedError('incorrect login or password2');
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
      res.cookie('jwt', token, { maxAge: 1000 * 3600 * 24 * 7, httpOnly: true }).send({ message: 'Касячный тест, куки не срабатывают без JSON-объекта' });
    })
    .catch((err) => {
      next(err);
      return '';
    });
};

module.exports = {
  getUser,
  getUsers,
  // getCurrentUser, зачем он, если пользователь и текущий- п-ль одинаковый запрос
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
};
