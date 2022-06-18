const express = require('express');
const mongoose = require('mongoose');
const { errors, celebrate, Joi } = require('celebrate');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { NotFoundError } = require('./errors/NotFoundError');

const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

const { createUser, login } = require('./controllers/users');
const { auth } = require('./middlewares/auth');

// mongoose.connect('mongodb://127.0.0.1:27017/mestodb'); //на память о проблемах с подключением
mongoose.connect('mongodb://localhost:27017/mestodb');
// mongoose.connect('mongodb://localhost:27017/mestodb', { family: 4 });
// mongoose.connect('mongodb://127.0.0.1:27017/mestodb', { family: 4 });

const app = express();
app.use(cookieParser());
const { PORT = 3000 } = process.env;
app.use(helmet());
app.use(express.json());
/* app.use((req, res, next) => { //на память
  req.user = {
    _id: '6293ac2a172acb1f34a0ba32',
  };
  next();
}); */
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/https?:\/\/(www\.)?[0-9a-z-.]*\.[a-z-.]{2,}([0-9a-z-._~:/?#[\]@!$&'()*+,;=])*#*$/i), // нет в задание создать константу
  }),
}), createUser);
app.use(auth);
app.use('/users', userRouter);
app.use('/cards', cardRouter);
// app.use('/', (_, res) => res.status(404).send({ message: 'Page not found' }));
app.use('/', () => {
  throw new NotFoundError('Page not found');
});
app.use(errors());

app.use((err, _req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'server Error' : message });
  next(); // чтобы не ругался ESLint На неиспользуемый next
});
app.listen(PORT, () => {});
