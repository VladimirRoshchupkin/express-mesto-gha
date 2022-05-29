const User = require('../models/User');

const getUser = (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(400).send({ message: 'Id is not correct' });
      }
      return res.status(500).send({ message: 'Server error' });
    });
};

const getUsers = (_, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(() => {
      res.status(500).send({ message: 'Server error' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
/*   if (!name || !about || !avatar) {
    return res.status(400).send('missing user data');
  } */

  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors).join(', ');
        return res.status(400).send({ message: `field(s): ${fields} - not correct` });
      }
      if (err.code === 11000) {
        return res.status(409).send({ message: 'User already exist' }); // на случай когда юзеры будут уникальными. взято из вебинара.
      }
      return res.status(500).send({ message: 'Server error' });
    });
  return res.status(200);
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  const { _id: id } = req.user;
  if (!name || !about) {
    return res.status(400).send('missing user data');
  }
  User.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true, upsert: true })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors).join(', ');
        return res.status(400).send({ message: `field(s): ${fields} - not correct` });
      }
      return res.status(500).send({ message: 'Server error' });
    });
  return res.status(200);
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const { _id: id } = req.user;
  if (!avatar) {
    return res.status(400).send('missing user avatar');
  }
  User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true, upsert: true })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors).join(', ');
        return res.status(400).send({ message: `field(s): ${fields} - not correct` });
      }
      return res.status(500).send({ message: 'Server error' });
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
