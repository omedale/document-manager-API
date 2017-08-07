/**
   * validationError: This returns validation error messages
   * @function validationError
   * @param {object} res response
   * @param {object} errors errors
   * @return {object} - returns response status and json data
   */
module.exports.validationError = (res, errors) => {
  return res.status(400).send({
    message:
    'Invalid Input, please provide appropriate input for all field',
    errors
  });
};
/**
   * verifyLimitAndOffset: Checks if the offset and limit are integer
   * @function verifyLimitAndOffset
   * @param {integer} limit limit
   * @param {integer} offset offset
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.verifyLimitAndOffset = (limit, offset, res) => {
  if (!Number.isInteger(Number(limit))
    || !Number.isInteger(Number(offset))) {
    return res.status(400).send({
      message: 'Please Set Offset and Limit as Integer'
    });
  }
};
/**
   * checkErrors: Checks form errors
   * @function checkErrors
   * @param {object} req request
   * @param {string} message message
   * @return {object} - returns response status and json data
   */
module.exports.checkErrors = (req, message) => {
  if (message === 'createdocument') {
    req.checkBody('title', 'Title is required').notEmpty();
  } else if (message === 'createuser') {
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('email', 'Email Required').notEmpty();
    req.checkBody('name', 'Name Required').notEmpty();
    req.checkBody('password', 'Password required').notEmpty();
  } else if (message === 'login') {
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
  } else if (message === 'updateuser') {
    req.checkBody('email', 'Invalid email').isEmail();
    req.checkBody('email', 'Email required').notEmpty();
  }
  const errors = req.validationErrors();
  return errors;
};
/**
   * notFound: This returns document not found error message
   * @function notFound
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.notFound = (res) => {
  return res.status(404).send({
    message: 'Document Not Found',
  });
};