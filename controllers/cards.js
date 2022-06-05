const Card = require('../models/Card');
const { notFoundError, serverError, validationError } = require('../errors/errorsStatus');
const { ForbiddenError } = require('../errors/ForbiddenError');

const getCards = (_, res) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(() => {
      res.status(serverError).send({ message: 'Server error' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body; // owner пока в хардкоде
  const { _id: owner } = req.user;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(validationError).send({ message: 'wrong card data' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
};

const deleteCard = (req, res) => {
  const { cardId: id } = req.params;
  Card.findByIdAndRemove(id)
    .then((card) => {
      if (!card) {
        return res.status(notFoundError).send({ message: 'card not found' });
      }
      if (card.owner !== req.user._id) {
        return Promise.reject(new ForbiddenError('you can only delete your own cards'));
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(validationError).send({ message: 'Id is not correct' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
};

const likeCard = (req, res) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $addToSet: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(notFoundError).send({ message: 'card like not found' });
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(validationError).send({ message: 'Card Id is not correct' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
};

const dislikeCard = (req, res) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $pull: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(notFoundError).send({ message: 'card dislike not found' });
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(validationError).send({ message: 'Card Id is not correct' });
      }
      return res.status(serverError).send({ message: 'Server error' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
