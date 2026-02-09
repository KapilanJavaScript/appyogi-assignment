import { executeQuery } from "../../helper/dbHandlers.mjs";

const getKeyboardStateDAL = async () => {
    const query = "SELECT key_id, is_lit, lit_by, color FROM keyboard_keys ORDER BY key_id ASC";
    const result = await executeQuery(query);
    return result;
};

const checkKeyboardControlDAL = async (userId) => {
    const query = `
      SELECT acquired_by, acquired_on
      FROM keyboard_control
      WHERE id = 1
    `;
    const [result] = await executeQuery(query);
    return result;
};

const getCurrentKeyStateDAL = async (keyId) => {
    const query = `
        SELECT is_lit
        FROM keyboard_keys
        WHERE key_id = ?
    `;
    const [result] = await executeQuery(query, [keyId]);
    return result;
};

const toggleKeyStateDAL = async (payload) => {
    const { key_id, is_lit, lit_by, color } = payload;
    const query = `
        UPDATE keyboard_keys
        SET is_lit = ?, lit_by = ?, color = ?
        WHERE key_id = ?
    `;

    const result = await executeQuery(query, [
        is_lit,
        lit_by,
        color,
        key_id
    ]);
    return result;
};

const acquireControlDAL = async (userId) => {
    const query = `
        UPDATE keyboard_control
        SET acquired_by = ?, acquired_on = NOW()
        WHERE id = 1
    `;

    const result = await executeQuery(query, [userId]);
    return result;
};

const revokeControlDAL = async () => {
    const query = `
        UPDATE keyboard_control
        SET acquired_by = NULL, acquired_on = NULL
        WHERE id = 1
    `;

    const result = await executeQuery(query);
    return result;
};

export {
    getKeyboardStateDAL,
    checkKeyboardControlDAL,
    acquireControlDAL,
    toggleKeyStateDAL,
    getCurrentKeyStateDAL,
    revokeControlDAL
};