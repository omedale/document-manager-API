import jwt from 'jsonwebtoken';
import { LocalStorage } from 'node-localstorage';

const localStorage = LocalStorage('./scratch');
// To verify a user token
exports.verifyToken = (req, res, next) => {
  // checking for token
  if (req.url.startsWith('/v1/users/auth')) return next();

  const token = localStorage.getItem('JSONWT');
  // decoding the token
  if (token) {
    // verifies secret and checks
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(400).json({
          message: 'Token not valid Please login'
        });
      }
      // request user detail for other routes
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401).json({
      message: 'Empty Token'
    });
  }
};