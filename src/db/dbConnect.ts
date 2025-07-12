import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const createPool = () =>
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

let pool: mysql.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};
