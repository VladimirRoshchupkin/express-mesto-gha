const User = require('../models/User');
const {
  notFoundError,
  serverError,
  validationError,
  conflictError,
} = require('../errors/errorsStatus');

const getUser = (req, res) => {
  const { id } = req.params;
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

const getUsers = (_, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(() => {
      res.status(serverError).send({ message: 'Server error' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
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

module.exports = {
  getUser,
  getUsers,
  createUser,
  updateUserInfo,
  updateUserAvatar,
};
