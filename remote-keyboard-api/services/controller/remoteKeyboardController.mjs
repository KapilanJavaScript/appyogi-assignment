import responseConstructor from "../../helper/responseConstructer.mjs";
import { COLOR } from "../../utilis/constants.mjs";
import { acquireControlBLL, getKeyboardStateBLL, toggleKeyStateBLL } from "../BLL/remoteKeyboardBLL.mjs";

const getKeyboardState = async(req, res, next) => {
    try {
        console.log("getKeyboardState", req.headers);
        const userId = req.headers['x-user-id'];

        let response =  responseConstructor({
            statusCode: 400,
            status: false,
            message: "Bad Request",
            response: null
        });

        if(!userId){
            response = responseConstructor({
                statusCode: 401,
                status: false,
                message: 'Invalid user',
                response: null
            });
        } else {
            const keyStateResponse = await getKeyboardStateBLL(userId);
            if(keyStateResponse?.statusCode) {
                response = keyStateResponse
            }
        }
        console.log("getKeyboardState", "response", response);
        res.locals.response = response;
        next();
    } catch (error) {
        console.error("Error occurred while fetching keyboard state:", error);
        const response = responseConstructor({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            response: null
        });
        res.locals.response = response;
        next();
    }
}

const toggleKey = async (req, res, next) => {
    if(res.locals.response) return next();
    try {
        const userId = req.headers['x-user-id'];
        const { keyId } = req.params;
        const { color } = req?.body;

        let response =  responseConstructor({
            statusCode: 400,
            status: false,
            message: "Bad Request",
            response: null
        });

        const isValidColor = Object.keys(COLOR).includes(color);
        console.log("toggle condition", { keyId, userId, color, isValidColor });
        if(keyId && isValidColor && userId){
            const toggleKeyStateResponse = await toggleKeyStateBLL(Number(keyId), Number(userId), color);
            if(toggleKeyStateResponse?.statusCode){
                console.log("toggleKeyStateResponse", toggleKeyStateResponse);
                // emit socket event to update all clients about the key state change
                if(toggleKeyStateResponse?.statusCode === 200) {
                    const { key_id, color } = toggleKeyStateResponse.body.response;
                    const io = req.app.get('io');
                    io.to('keyboard-room').emit('keyboard:update', {
                        key_id,
                        color
                    });
                    io.to('keyboard-room').emit('control:update', {
                        acquired_by: null
                    });
                }

                response = toggleKeyStateResponse;
            }
        } else {
            res.locals.response = responseConstructor({
                statusCode: 400,
                status: false,
                message: 'Invalid fields',
                response: null
            });
        }

        res.locals.response = response;
        next();
    } catch (error) {
        console.error("Error occurred while toggling key:", error);
        const response = responseConstructor({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            response: null
        });
        res.locals.response = response;
        next();
    }
}

const acquireControl = async (req, res, next) => {
    if(res.locals.response) return next();
    try {
        const userId = req.headers['x-user-id'];
        let response =  responseConstructor({
            statusCode: 400,
            status: false,
            message: "Bad Request",
            response: null
        });
        console.log("acquireControl", "userId", userId);
        if(userId) {
            const acquireControlResponse = await acquireControlBLL(Number(userId));
            if(acquireControlResponse?.statusCode){
                // emit socket event to update all clients about the control change
                if(acquireControlResponse?.statusCode === 200) {
                    const io = req.app.get('io');
                    io.to('keyboard-room').emit('control:update', {
                        acquired_by: Number(userId)
                    });
                }
                response = acquireControlResponse;
            }
        } else {
            response = responseConstructor({
                statusCode: 400,
                status: false,
                message: 'Invalid user',
                response: null
            });
        }

        res.locals.response = response;
        next();
    } catch (error) {
        console.error("Error occurred while acquiring control:", error);
        const response = responseConstructor({
            statusCode: 500,
            status: false,
            message: "Internal Server Error",
            response: null
        });
        res.locals.response = response;
        next();
    }
}


export { 
    getKeyboardState,
    toggleKey,
    acquireControl
};