import { handleControlExpiry } from '../helper/keyboardControlExpire.mjs';
import responseConstructor from '../helper/responseConstructer.mjs';
import { checkKeyboardControlDAL } from '../services/DAL/remoteKeyboardDAL.mjs';

export const checkKeyboardControl = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const routePath = req.route?.path; 
    console.log("routePath", routePath, "userId", userId);

    if (!userId) {
      res.locals.response = responseConstructor({
        statusCode: 400,
        status: false,
        message: 'Invalid user',
        response: null
      });
      return next();
    }

    const control = await checkKeyboardControlDAL();
    const isExpired = handleControlExpiry(control?.acquired_on);
    
    if (routePath === '/toggle/:keyId') {
      const hasValidControl =
        control &&
        control.acquired_by === Number(userId) &&
        !isExpired;

        if (!hasValidControl) {
          res.locals.response = responseConstructor({
            statusCode: 401,
            status: false,
            message: 'You must acquire control before toggling a key',
            response: null
          });
        }
    } else if (control && !isExpired) {
      res.locals.response = responseConstructor({
        statusCode: 401,
        status: false,
        message: 'Keyboard control is already acquired',
        response: null
      });
    }

    // User has valid control
    next();

  } catch (error) {
    console.error('Error in checkKeyboardControl middleware:', error);

    res.locals.response = responseConstructor({
      statusCode: 500,
      status: false,
      message: 'Failed to validate keyboard control',
      response: null
    });
    return next();
  }
};
