const router = require('express').Router();
const {
  getUser,
  getUsers,
  createUser,
  updateUserInfo,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/:id', getUser);

router.get('/', getUsers);

router.post('/', createUser);

router.patch('/me', updateUserInfo);

router.patch('/me/avatar', updateUserAvatar);

module.exports.userRouter = router;
