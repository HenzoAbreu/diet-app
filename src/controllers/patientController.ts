import { Request, Response, NextFunction } from "express";
import {
  CreatePatientRequest,
  Patient,
  PublicPatient,
  UpdatePatientRequest,
} from "../models/patient";
import {
  createPatientService,
  getPatientByUuidService,
  getAllPatientsService,
  updatePatientService,
  deletePatientService,
} from "../services/patientService";
import { BadRequestError } from "../utils/errors";

const toPublicPatient = (patient: any): PublicPatient => ({
  patient_uuid: patient.patient_uuid,
  email: patient.email,
  name: patient.full_name,
  weight: patient.weight,
  height: patient.height,
});

export const createPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const patientData: CreatePatientRequest = req.body;

  try {
    const patient = await createPatientService(patientData);

    res.status(201).json({ success: true, data: toPublicPatient(patient) });
  } catch (err) {
    next(err);
  }
};

export const getAllPatientsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patients = await getAllPatientsService();
    const publicPatient = patients.map(toPublicPatient);
    res.status(200).json({ success: true, data: publicPatient });
  } catch (err) {
    next(err);
  }
};

export const getPatientByUuidController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { patient_uuid } = req.params;
  if (!patient_uuid) {
    throw new BadRequestError("Please provide a valid patient UUID!");
  }

  try {
    const patient = await getPatientByUuidService(patient_uuid);
    res.status(200).json({ success: true, data: toPublicPatient(patient) });
  } catch (err) {
    next(err);
  }
};

export const updatePatientController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { patient_uuid } = req.params;
  const updates: UpdatePatientRequest = req.body;
  if (!patient_uuid) {
    throw new BadRequestError("Please insert patient UUID");
  }

  try {
    const updatedPatient = await updatePatientService(patient_uuid, updates);
    res
      .status(204)
      .json({ success: true, data: toPublicPatient(updatedPatient) });
  } catch (err) {
    next(err);
  }
};

export const deletePatientController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { patient_uuid } = req.params;
  if (!patient_uuid) {
    throw new BadRequestError("Please insert patient UUID");
  }
  try {
    await deletePatientService(patient_uuid);
    res.status(200).json("Patient deleted successfully!");
  } catch (err) {
    next(err);
  }
};
