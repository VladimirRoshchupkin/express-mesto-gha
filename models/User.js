const mongoose = require('mongoose');
const validator = require('validator');

function avatarValidator(val) { // нашел здесь https://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
  const reg = /https?:\/\/(www\.)?[0-9a-z-.]*\.[a-z-.]{2,}([0-9a-z-._~:/?#[\]@!$&'()*+,;=])*#*$/i; // нет в задание создать константу
  return reg.test(val);
}
const avatarValidatorWithMessage = [avatarValidator, 'avatar validation failed'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: avatarValidatorWithMessage,
    // все делают через npm-валидатор, я сделаю по заданию, чувствую опять проблемы будут))
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
