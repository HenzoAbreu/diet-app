export interface Patient {
  patient_id: number;
  patient_uuid: string;
  name: string;
  email: string;
  weight: number;
  height: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreatePatientRequest {
  email: string;
  name: string;
  weight: number;
  height: number;
}

export interface PublicPatient {
  patient_uuid: string;
  email: string;
  name: string;
  weight: number;
  height: number;
}

export interface UpdatePatientRequest {
  email?: string;
  name?: string;
  weight?: number;
  height?: number;
}
