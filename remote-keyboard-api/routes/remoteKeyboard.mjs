import express from "express";
import { acquireControl, getKeyboardState, toggleKey } from "../services/controller/remoteKeyboardController.mjs";
import { checkKeyboardControl } from "../middleware/keyboardControlHandler.mjs";

const router = express.Router();


router.get('/', getKeyboardState);
router.post('/toggle/:keyId', checkKeyboardControl, toggleKey);
router.post('/control', checkKeyboardControl, acquireControl);

export default router;