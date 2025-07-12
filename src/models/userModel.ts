export interface User {
  user_id: number;
  user_uuid: string;
  full_name: string;
  email: string;
  password: string;
  password_salt: string;
  weight: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface PublicUser {
  user_uuid: string;
  full_name: string;
  email: string;
}

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
  weight: number;
}

export interface SigninRequest {
  email: string;
  password: string;
}
