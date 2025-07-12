import express from "express";
import {
  createPatientController,
  deletePatientController,
  getAllPatientsController,
  getPatientByUuidController,
  updatePatientController,
} from "../controllers/patientController";

const router = express.Router();

router.post("/", createPatientController); //create patient
router.get("/", getAllPatientsController); //create patient
router.get("/:patient_uuid", getPatientByUuidController); //create patient
router.put("/:patient_uuid", updatePatientController); //create patient
router.delete("/:patient_uuid", deletePatientController); //create patient

export default router;
