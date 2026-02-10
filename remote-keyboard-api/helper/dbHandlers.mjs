import poolConnection from "../config/dbConnection.mjs";
import initDatabaseAndSchema from "../schema/keyBoardSchema.mjs";

const initDbConnection = async () => {
  try {
    // 1 create DB + schema
    await initDatabaseAndSchema();
    console.log('Database & schema ready');

    // 2 Verify runtime pool connection
    const connection = await poolConnection.getConnection();
    console.log('MySQL pool connected');
    connection.release();
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err; // let server decide how to handle
  }
}

const executeQuery = async (query, params = []) => {
  const connection = await poolConnection.getConnection();
  try {
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (err) {
    console.error('DB query failed');
    console.error('SQL:', query);
    console.error('Params:', params);
    throw err; // important
  } finally {
    connection.release();
  }
}

export {
    initDbConnection,
    executeQuery
}