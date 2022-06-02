const notFoundError = '404'; // централизованную обработку не делал, но скорее всего это в след работе будет.
const serverError = '500'; // статусы 200 201 остались как есть, т.к. про них в задании вроде ничего не сказано.
const validationError = '400';
const conflictError = '409';
module.exports = {
  notFoundError,
  serverError,
  validationError,
  conflictError,
};
