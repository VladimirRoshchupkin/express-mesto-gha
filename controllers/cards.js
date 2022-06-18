const Card = require('../models/Card');
const { ForbiddenError } = require('../errors/ForbiddenError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ValidationError } = require('../errors/ValidationError');

const getCards = (_, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const { _id: owner } = req.user;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const err = new ValidationError('wrong card data');
        return next(err);
      }
      return next(e);
    });
};

const deleteCard = (req, res, next) => {
  const { cardId: id } = req.params;
  // Card.findByIdAndRemove(id) Cделал не 100% по предлагаемому примеру, но вроде выходит аналогично
  Card.findById(id) // только ищем, не удаляем
    .then((card) => {
      if (!card) {
        throw new NotFoundError('card not found');
      }
      if (card.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('you can only delete your own cards');
      }
      // только если карточка найдена и мы создатель - тогда удаляем.
      // по некорректному айди упадём сразу в catch и тоже отловим ошибку
      return Card.remove()
        .then(res.status(200).send(card));
      // return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        const err = new ValidationError('Id is not correct');
        return next(err);
      }
      return next(e);
    });
};

const likeCard = (req, res, next) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $addToSet: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('card like not found');
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        const err = new ValidationError('Card Id is not correct');
        return next(err);
      }
      return next(e);
    });
};

const dislikeCard = (req, res, next) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $pull: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('card dislike not found');
      }
      return res.status(200).send(card);
    })
    .catch((e) => {
      if (e.kind === 'ObjectId') {
        const err = new ValidationError('Card Id is not correct');
        return next(err);
      }
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
