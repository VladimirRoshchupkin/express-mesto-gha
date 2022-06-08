const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUser,
  getUsers,
  // getCurrentUser,
  // createUser,
  updateUserInfo,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/me', getUser);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24), // 629e52cd44dcde9a53ba512f
  }),
}), getUser);

router.get('/', getUsers);

// router.post('/', createUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserInfo);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/https?:\/\/(www\.)?[0-9a-z-.]*\.[a-z-.]{2,}([0-9a-z-._~:/?#[\]@!$&'()*+,;=])*#*$/i),
  }),
}), updateUserAvatar);

module.exports.userRouter = router;
