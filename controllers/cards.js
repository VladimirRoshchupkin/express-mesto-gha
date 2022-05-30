const Card = require('../models/Card');

const getCards = (_, res) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(() => {
      res.status(500).send({ message: 'Server error' });
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
        return res.status(400).send({ message: 'wrong card data' });
      }
      return res.status(500).send({ message: 'Server error' });
    });
};

const deleteCard = (req, res) => {
  const { cardId: id } = req.params;
  // Card.deleteOne({ _id: id })
  Card.findByIdAndRemove(id)
    .then((card) => {
      if (!card) {
        console.log('!card')
        return res.status(404).send({ message: 'card not found' });
      }
      console.log('card')
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(400).send({ message: 'Id is not correct' });
      }
      return res.status(500).send({ message: 'Server error' });
    });
};

const likeCard = (req, res) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  // console.log('likeId', id , req.params)
  Card.findByIdAndUpdate(id, { $addToSet: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'card like not found' });
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(400).send({ message: 'Card Id is not correct' });
      }
      return res.status(500).send({ message: 'Server error' });
    });
};

const dislikeCard = (req, res) => {
  const { cardId: id } = req.params;
  const { _id: owner } = req.user;
  Card.findByIdAndUpdate(id, { $pull: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'card dislike not found' });
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(400).send({ message: 'Card Id is not correct' });
      }
      return res.status(500).send({ message: 'Server error' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
