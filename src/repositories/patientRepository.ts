import { getPool } from "../db/dbConnect";
import { Patient } from "../models/patient";

export const createPatient = async (
  patient_uuid: string,
  email: string,
  name: string,
  height: number,
  weight: number,
) => {
  const pool = getPool();
  const query =
    "INSERT INTO tb_patient(patient_uuid, email, name, height, weight) VALUES (?,?,?,?,?)";

  const [result] = await pool.query(query, [
    patient_uuid,
    email,
    name,
    height,
    weight,
  ]);
};

export const getAllPatients = async (): Promise<Patient[]> => {
  const pool = getPool();
  const query =
    "SELECT patient_id, patient_uuid, email, name, height, weight FROM tb_patient WHERE deleted_at IS NULL";

  const [rows] = await pool.query(query);

  return rows as Patient[];
};

export const getPatientByUuid = async (
  patient_uuid: string,
): Promise<Patient | null> => {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT patient_id, patient_uuid, email, name, weight, height, created_at, updated_at, deleted_at FROM tb_patient WHERE patient_uuid = ? AND deleted_at IS NULL",
    [patient_uuid],
  );
  return (rows as any[])[0] || null;
};

export const getPatientByEmail = async (
  email: string,
): Promise<Patient | null> => {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT patient_id, patient_uuid, email, name, weight, height, created_at, updated_at, deleted_at FROM tb_patient WHERE email = ? AND deleted_at IS NULL",
    [email],
  );
  return (rows as any[])[0] || null;
};

export const updatePatient = async (
  patient_uuid: string,
  updates: Partial<Pick<Patient, "email" | "name" | "height" | "weight">>,
): Promise<void> => {
  const pool = getPool();
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return;

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const query = `UPDATE tb_patient SET ${setClause} WHERE patient_uuid = ?;`;

  await pool.query(query, [...values, patient_uuid]);
};

export const deletePatient = async (patient_uuid: string): Promise<void> => {
  const pool = getPool();
  const query = `UPDATE tb_patient SET deleted_at = NOW() WHERE patient_uuid = ?;`;

  await pool.query(query, patient_uuid);
};
