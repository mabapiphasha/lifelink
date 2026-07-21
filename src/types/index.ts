export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyTier = 'Critical' | 'High' | 'Standard';
export type RequestStatus = 'Open' | 'Matched' | 'Fulfilled' | 'Expired';
export type DonorStatus = 'Available' | 'Cooldown' | 'Unavailable';

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
  organType: string;
  bloodTypeCompatibility: BloodType[];
  urgency: UrgencyTier;
  hospitalId: string;
  hospitalName: string;
  location: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

export interface OrganApplication {
  id: string;
  requestId: string;
  donorId: string;
  status: 'Applied' | 'Under Review' | 'Invited' | 'Approved' | 'Not Eligible';
  submittedAt: string;
}
