import jwt from 'jsonwebtoken';
import User from '../models/user';
import config from '../../config/env';

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .error(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json({ success: true, message: 'User found', data: { user: req.user } });
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function create(req, res, next) {
  User.findOneAsync({ email: req.body.email, userType: req.body.userType })
    // eslint-disable-next-line
    .then(foundUser => {
      if (foundUser !== null) {
        return res.json({ success: false, message: 'User already exists', data: '' });
      }
      const user = new User({
        email: req.body.email,
        password: req.body.password
      });
      user
        .saveAsync()
        .then((savedUser) => {
          const returnObj = {
            success: true,
            message: '',
            data: {}
          };
          const jwtAccessToken = jwt.sign(savedUser.toJSON(), config.jwtSecret);
          returnObj.data.jwtAccessToken = `JWT ${jwtAccessToken}`;
          returnObj.data.user = savedUser;
          returnObj.message = 'User created successfully';
          res.json(returnObj);
        })
        .error(e => next(e));
    })
    .error(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.email - The username of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user; //eslint-disable-line
  user.email = req.body.email ? req.body.email : user.email;
  user.password = req.body.password ? req.body.password : req.body.password;

  user
    .saveAsync()
    .then(savedUser => res.json(savedUser))
    .error(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .error(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  console.log("Removing", req.user)
  const user = req.user; //eslint-disable-line
  if (user) {
    user
      .removeAsync()
      .then(deletedUser => res.json(deletedUser))
      .error(e => next(e));
  }

}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
