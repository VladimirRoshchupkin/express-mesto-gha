const express = require('express');
const mongoose = require('mongoose');

const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

const { createUser, login } = require('./controllers/users');
const { auth } = require('./middlewares/auth');

mongoose.connect('mongodb://localhost:27017/mestodb');

const app = express();
const { PORT = 3000 } = process.env;

app.use(express.json());
/* app.use((req, res, next) => {
  req.user = {
    _id: '6293ac2a172acb1f34a0ba32',
  };
  next();
}); */
app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);
app.use('/users', userRouter);
app.use('/cards', cardRouter);
app.use('/', (_, res) => res.status(404).send({ message: 'Page not found' }));

app.listen(PORT, () => {});
