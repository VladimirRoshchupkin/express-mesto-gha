const router = require('express').Router();
const { getUser, getUsers, createUser } = require('../controllers/users');

router.get('/:id', getUser);

router.get('/', getUsers);

router.post('/', createUser);

module.exports.userRouter = router;
