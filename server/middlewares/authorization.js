import LocalStorage from 'node-localstorage';
import jwt from 'jsonwebtoken';

const localStorage = LocalStorage('./scratch');
// To verify a user token
exports.verifyToken = (req, res, next) => {
  // checking for token
  if (req.url.startsWith('/auth')) return next();

  const token = localStorage.getItem('JSONWT');
  // decoding the token
  if (token) {
    // verifies secret and checks
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.json({
          message: 'Token not valid Please login'
        });
      }
      // request user detail for other routes
      req.decoded = decoded;
      next();
    });
  } else {
    return res.json({
      message: 'Empty Token'
    });
  }
};