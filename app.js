const express = require('express');
const mongoose = require('mongoose');

const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

mongoose.connect('mongodb://localhost:27017/mestodb');

const app = express();
const { PORT = 3000 } = process.env;

app.use(express.json());
app.use((req, res, next) => { // res не меняю на _ т.к. это код из задания
  req.user = {
    _id: '6293ac2a172acb1f34a0ba32',
  };
  next();
});
app.use('/users', userRouter);
app.use('/cards', cardRouter);

/* app.use('/', (req, res) => {
  console.log('слушаем слэш');
  res.status(200).send({ message: 'ok' });
}); */

app.listen(PORT, () => {});
