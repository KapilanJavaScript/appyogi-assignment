import { handleControlExpiry } from "../../helper/keyboardControlExpire.mjs";
import responseConstructor from "../../helper/responseConstructer.mjs";
import { COLOR } from "../../utilis/constants.mjs";
import { 
    acquireControlDAL,
    checkKeyboardControlDAL,
    getCurrentKeyStateDAL,
    getKeyboardStateDAL,
    revokeControlDAL,
    toggleKeyStateDAL 
} from "../DAL/remoteKeyboardDAL.mjs";


const getKeyboardStateBLL = async () => {
    const [keyBoardStateResult, userKeyboardControlResult] = await Promise.all([
        getKeyboardStateDAL(),
        checkKeyboardControlDAL() 
    ]);
    console.log("getKeyboardStateBLL", keyBoardStateResult);
    if(keyBoardStateResult && Array.isArray(keyBoardStateResult)) {
        const isExpired = handleControlExpiry(userKeyboardControlResult?.acquired_on);
        console.log("isExpired", isExpired, "userKeyboardControlResult", userKeyboardControlResult);

        return responseConstructor({
            statusCode: 200,
            status: true,
            message: "Keyboard state fetched successfully",
            response: {
                keys: keyBoardStateResult,
                keyboardControl: isExpired ? null : userKeyboardControlResult?.acquired_by
            }
        });
    }

    return responseConstructor({
        statusCode: 400,
        status: false,
        message: "Failed to fetch keyboard state",
        response: null
    });
};

const toggleKeyStateBLL = async (keyId, userId, color, req) => {
    const colorCode = COLOR[color] || COLOR.white; // Default to white if color is invalid

    const currentKeyState = await getCurrentKeyStateDAL(keyId);

    const isLit = currentKeyState?.is_lit ? 0 : 1; // Toggle state
    const payload = {
        key_id: keyId,
        lit_by: isLit ? userId : null,
        color: isLit ? colorCode : COLOR.white,
        is_lit: isLit
    };

    const updateResponse = await toggleKeyStateDAL(payload);
    if(updateResponse?.affectedRows) {
        await revokeControlDAL(); // Revoke control after toggling
        return responseConstructor({
            statusCode: 200,
            status: true,
            message: "Key state toggled successfully",
            response: payload
        });
    }

    return responseConstructor({
        statusCode: 400,
        status: false,
        message: "Failed to toggle key state",
        response: null
    });
}

const acquireControlBLL = async (userId) => {
    const control = await acquireControlDAL(userId);
    if(control?.affectedRows) {
        return responseConstructor({
            statusCode: 200,
            status: true,
            message: "Control acquired successfully",
            response: control
        });
    }

    return responseConstructor({
        statusCode: 400,
        status: false,
        message: "Failed to acquire control",
        response: null
    });
}

export { getKeyboardStateBLL, toggleKeyStateBLL, acquireControlBLL };