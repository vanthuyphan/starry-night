import express from 'express';
import validate from 'express-validation';
import httpStatus from 'http-status';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user';
import passport from 'passport'; //eslint-disable-line
import config from '../../config/env';
import APIError from '../helpers/APIError';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/users/register - create new user and return corresponding user object and token */
router.route('/register').post(validate(paramValidation.createUser), userCtrl.create);

// MiddleWare.....

router.use((req, res, next) => {
  // eslint-disable-next-line
  passport.authenticate('jwt', config.passportOptions, (error, userDtls, info) => {
    if (error) {
      const err = new APIError('token not matched', httpStatus.INTERNAL_SERVER_ERROR);
      return next(err);
    } else if (userDtls) {
      req.user = userDtls;
      next();
    } else {
      const err = new APIError(`token not matched ${info}`, httpStatus.UNAUTHORIZED);
      return next(err);
    }
  })(req, res, next);
});

router
  .route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.get);

router
  .route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

export default router;
