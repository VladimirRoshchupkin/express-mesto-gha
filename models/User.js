const mongoose = require('mongoose');
const validator = require('validator');

function avatarValidator(val) { // нашел здесь https://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
  const reg = /https?:\/\/(www\.)?[0-9a-z-.]*\.[a-z-.]{2,}([0-9a-z-._~:/?#[\]@!$&'()*+,;=])*#*$/i;
  return reg.test(val);
}
const custom = [avatarValidator, 'Uh oh, {PATH} does not equal "something".'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    // required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    // required: true,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: custom, // {
    // avatarValidator,
    // message: 'avatar URL validation error',
    // }, // все делают через npm-валидатор, я сделать по заданию, чувствую опять проблемы
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: (email) => validator.isEmail(email),
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

module.exports = mongoose.model('user', userSchema);
