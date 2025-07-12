import {
  CreatePatientRequest,
  Patient,
  UpdatePatientRequest,
} from "../models/patient";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import * as patientRepo from "../repositories/patientRepository";

const PatientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  height: z.number().nonnegative(),
  weight: z.number().nonnegative(),
});

const UpdatePatientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  height: z.number().nonnegative().optional(),
  weight: z.number().nonnegative().optional(),
});

export const createPatientService = async (
  patientData: CreatePatientRequest,
): Promise<Patient> => {
  const input = {
    name: patientData.name,
    email: patientData.email,
    height: patientData.height,
    weight: patientData.weight,
  };

  // validation
  const parsed = PatientSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid user data!", parsed.error.flatten());
  }

  // generate pateint uuid
  const patient_uuid = uuidv4();

  // create patient
  await patientRepo.createPatient(
    patient_uuid,
    parsed.data.email,
    parsed.data.name,
    parsed.data.height,
    parsed.data.weight,
  );

  // get created patient
  const createdPatient = await patientRepo.getPatientByEmail(parsed.data.email);
  if (!createdPatient) {
    throw new InternalServerError("Failed to register patient!");
  }

  return createdPatient;
};

export const updatePatientService = async (
  patient_uuid: string,
  updates: UpdatePatientRequest,
): Promise<Patient> => {
  const input = {
    name: updates.name,
    email: updates.email,
    height: updates.height,
    weight: updates.weight,
  };

  const patient = await patientRepo.getPatientByUuid(patient_uuid);
  if (!patient) {
    throw new NotFoundError("Patient not found!");
  }

  // parse
  const parsed = UpdatePatientSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("Invalid user data", parsed.error.flatten());
  }

  if (updates.email && updates.email !== patient.email) {
    const emailExists = await patientRepo.getPatientByEmail(updates.email);
    if (emailExists) {
      throw new BadRequestError("The new email already exists!");
    }
  }

  await patientRepo.updatePatient(patient.patient_uuid, updates);

  const updatedPatient = await patientRepo.getPatientByUuid(patient_uuid);
  if (!updatedPatient) {
    throw new InternalServerError("Failed to update patient");
  }

  return updatedPatient;
};

export const getAllPatientsService = async (): Promise<Patient[]> => {
  const patients = await patientRepo.getAllPatients();
  if (!patients) {
    throw new NotFoundError("Patients not found!");
  }
  return patients;
};

export const getPatientByUuidService = async (
  patient_uuid: string,
): Promise<Patient | null> => {
  const patient = patientRepo.getPatientByUuid(patient_uuid);
  if (!patient) {
    throw new NotFoundError(`Patient with uuid ${patient_uuid} not found!`);
  }

  return patient;
};

export const deletePatientService = async (
  patient_uuid: string,
): Promise<void> => {
  const patient = await patientRepo.getPatientByUuid(patient_uuid);
  if (!patient) {
    throw new NotFoundError(`Patient with uuid ${patient_uuid}" not found!`);
  }
  await patientRepo.deletePatient(patient_uuid);
};
