import express from 'express';
import validate from 'express-validation';
import httpStatus from 'http-status';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth';
import passport from 'passport'; //eslint-disable-line
import config from '../../config/env';
import APIError from '../helpers/APIError';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login').post(validate(paramValidation.login), authCtrl.login);

/**
 * Middleware for protected routes. All protected routes need token in the header in the form Authorization: JWT token
 */
router.use((req, res, next) => {
  // eslint-disable-next-line
  passport.authenticate('jwt', config.passportOptions, (error, userDtls, info) => {
    if (error) {
      const err = new APIError('token not matched', httpStatus.UNAUTHORIZED);
      return next(err);
    } else if (userDtls) {
      req.user = userDtls;
      next();
    } else {
      const err = new APIError(`token not matched and error msg ${info}`, httpStatus.UNAUTHORIZED);
      return next(err);
    }
  })(req, res, next);
});

/** Get /api/auth/logout */
router.route('/logout').get(authCtrl.logout);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
// router.route('/random-number')
//   .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);

export default router;
