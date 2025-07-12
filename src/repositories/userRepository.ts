import { getPool } from "../db/dbConnect";
import { User } from "../models/userModel";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const createUser = async (
  full_name: string,
  uuid: string,
  email: string,
  password: string,
  password_salt: string,
): Promise<User | null> => {
  const pool = getPool();
  const query = `
  INSERT INTO tb_user (full_name, user_uuid, email, password, password_salt)
  VALUES (? ,? ,? ,? ,?)`;

  const [result] = await pool.execute<ResultSetHeader>(query, [
    full_name,
    uuid,
    email,
    password,
    password_salt,
  ]);

  if (!result || result.affectedRows === 0) {
    return null;
  }
  // Return inserted user
  const [rows] = await pool.execute<User[] & RowDataPacket[]>(
    "SELECT full_name, email FROM tb_user WHERE user_id = ? AND deleted_at IS NULL;",
    [result.insertId],
  );
  return rows[0] || null;
};

export const updateUser = async (
  user_uuid: string,
  updates: Partial<Pick<User, "email" | "full_name">>,
): Promise<User> => {
  const pool = getPool();

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const query = `UPDATE tb_user SET ${setClause} WHERE user_uuid = ? AND deleted_at IS NULL`;

  const [rows] = await pool.execute(query, [...values, user_uuid]);

  return (rows as any[])[0] || null;
};
export const deleteUser = async (user_uuid: string): Promise<void> => {
  const pool = getPool();
  const query = `UPDATE tb_user SET deleted_at = NOW() WHERE user_uuid = ?`; // soft delete
  // const query = `DELETE FROM tb_user WHERE uuid = ?`;  HARD DELETE
  await pool.execute(query, [user_uuid]);
};

export const getUserByUuid = async (uuid: string): Promise<User | null> => {
  const pool = getPool();
  const query = `SELECT user_uuid, full_name, email FROM tb_user WHERE user_uuid = ? AND deleted_at IS NULL;`;

  const [rows] = await pool.query(query, uuid);
  return (rows as any[])[0] || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const pool = getPool();
  const query = `SELECT user_uuid, user_id, full_name, email, password, password_salt from tb_user WHERE email = ? AND deleted_at IS NULL;`;

  const [rows] = await pool.query(query, email);
  return (rows as any[])[0] || null;
};

export const getAll = async (): Promise<User[]> => {
  const pool = getPool();
  const query = `SELECT user_uuid, full_name, email FROM tb_user WHERE deleted_at IS NULL;`;

  const [rows] = await pool.query(query);

  const users = rows as User[];
  return users;
};
