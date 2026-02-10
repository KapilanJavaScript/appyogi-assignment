import { checkKeyboardControlDAL, revokeControlDAL } from "../services/DAL/remoteKeyboardDAL.mjs";
import { CHECK_INTERVAL, CONTROL_TIMEOUT_MS } from "../utilis/constants.mjs";

const handleControlExpiry = (acquired_on) => {
    if (!acquired_on) return true; // Treat missing timestamp as expired
    const now = Date.now();
    const acquiredAt = new Date(acquired_on).getTime();
    console.log("now", now, "acquiredAt", acquiredAt, "difference", now - acquiredAt, "timeout", CONTROL_TIMEOUT_MS);
    const isExpired = (now - acquiredAt) > CONTROL_TIMEOUT_MS;

    return isExpired;
};

const checkAndRevokeControl = async (app) => {
    const control = await checkKeyboardControlDAL();
    if (!control || !control.acquired_on) return;

    const isExpired = handleControlExpiry(control?.acquired_on);
    if (isExpired) {
        await revokeControlDAL();

        const io = app.get('io');
        io.to('keyboard-room').emit('control:update', {
            acquired_by: null
        });

        console.log('Control auto-released due to idle timeout');
    }
}

// started when first user connects, stopped when last user disconnects
const startControlInterval = (app) => {
    if (app.locals.controlInterval) return; // already running
    app.locals.controlInterval = setInterval(() => checkAndRevokeControl(app), CHECK_INTERVAL);
    console.log('Control interval started');
};

const stopControlInterval = (app) => {
  if (!app.locals.controlInterval) return;

  clearInterval(app.locals.controlInterval);
  app.locals.controlInterval = null;
  console.log('Control interval stopped');
};


export {
    handleControlExpiry, 
    checkAndRevokeControl,
    startControlInterval,
    stopControlInterval
};
