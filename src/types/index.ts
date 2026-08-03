export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyTier = 'Critical' | 'High' | 'Standard';
export type RequestStatus = 'Open' | 'Matched' | 'Fulfilled' | 'Expired';
export type DonorStatus = 'Available' | 'Cooldown' | 'Unavailable';

export type OrganType =
  | 'Kidney'
  | 'Liver'
  | 'Heart'
  | 'Lung'
  | 'Pancreas'
  | 'Intestine'
  | 'Cornea'
  | 'Skin'
  | 'Bone Marrow'
  | 'Heart Valve';

export type OrganApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Invited'
  | 'Approved'
  | 'Not Eligible';

export interface Donor {
  id: string;
  name: string;
  bloodType: BloodType;
  location: string;
  status: DonorStatus;
  lastDonation: string | null;
  totalDonations: number;
  phone: string;
  email: string;
}

export interface BloodRequest {
  id: string;
  hospitalName: string;
  bloodType: BloodType;
  urgency: UrgencyTier;
  unitsNeeded: number;
  status: RequestStatus;
  createdAt: string;
  matchedDonors: string[];
}

export interface OrganRequest {
  id: string;
  organType: OrganType;
  bloodTypeCompatibility: BloodType[];
  urgency: UrgencyTier;
  hospitalId: string;
  hospitalName: string;
  location: string;
  patientAge?: number;
  patientGender?: string;
  notes?: string;
  status: 'Open' | 'Closed';
  createdAt: string;
  applicantCount?: number;
}

export interface OrganApplication {
  id: string;
  requestId: string;
  organType: OrganType;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bloodType: BloodType;
  age: number;
  bmi?: number;
  smokingStatus: string;
  alcoholUse: string;
  existingConditions: string[];
  medications: string[];
  status: OrganApplicationStatus;
  submittedAt: string;
  updatedAt?: string;
  notes?: string;
}
