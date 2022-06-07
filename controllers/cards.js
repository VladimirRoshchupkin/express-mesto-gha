const Card = require('../models/Card');
// const { notFoundError, serverError, validationError } = require('../errors/errorsStatus');
const { ForbiddenError } = require('../errors/ForbiddenError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ValidationError } = require('../errors/ValidationError');

const getCards = (_, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
/*     .catch(() => {
      res.status(serverError).send({ message: 'Server error' });
    }); */
};

const createCard = (req, res, next) => {
  console.log('createCard', req.user);
  const { name, link } = req.body; // owner пока в хардкоде
  const { id: owner } = req.user; // _id==>id для ПР14
  console.log('CreateCard1');
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((e) => {
      console.log('CreateCard2');
      if (e.name === 'ValidationError') {
        // return res.status(validationError).send({ message: 'wrong card data' });
        const err = new ValidationError('wrong card data');
        console.log(err);
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      console.log(e);
      return next(e);
    });
  console.log('123456CreateCard');
};

const deleteCard = (req, res, next) => {
  const { cardId: id } = req.params;
  Card.findByIdAndRemove(id)
    .then((card) => {
      if (!card) {
        // return res.status(notFoundError).send({ message: 'card not found' });
        throw new NotFoundError('card not found');
      }
      if (card.owner !== req.user._id) {
        // return Promise.reject(new ForbiddenError('you can only delete your own cards'));
        throw new ForbiddenError('you can only delete your own cards');
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        // return res.status(validationError).send({ message: 'Id is not correct' });
        const err = new ValidationError('Id is not correct');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      return next(e);
    });
};

const likeCard = (req, res, next) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $addToSet: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        // return res.status(notFoundError).send({ message: 'card like not found' });
        throw new NotFoundError('card like not found');
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        // return res.status(validationError).send({ message: 'Card Id is not correct' });
        const err = new ValidationError('Card Id is not correct');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      return next(e);
    });
};

const dislikeCard = (req, res, next) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $pull: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        // return res.status(notFoundError).send({ message: 'card dislike not found' });
        throw new NotFoundError('card dislike not found');
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        // return res.status(validationError).send({ message: 'Card Id is not correct' });
        const err = new ValidationError('Card Id is not correct');
        return next(err);
      }
      // return res.status(serverError).send({ message: 'Server error' });
      return next(e);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
