const API_BASE_URL = 'https://api8jqb1a1.execute-api.us-east-1.amazonaws.com/default';

export const API = {
  verifyCode: `${API_BASE_URL}/verifyDonorCode`,
  registerDonor: `${API_BASE_URL}/registerDonor`,
  getBloodRequests: `${API_BASE_URL}/getBloodRequests`,
  createBloodRequest: `${API_BASE_URL}/createBloodRequest`,
  matchDonors: `${API_BASE_URL}/matchDonors`,
  submitOrganApplication: `${API_BASE_URL}/submitOrganApplication`,
  hospitalLogin: `${API_BASE_URL}/hospitalLogin`,

  // Organ request endpoints
  createOrganRequest: `${API_BASE_URL}/createOrganRequest`,
  getOrganRequests: `${API_BASE_URL}/getOrganRequests`,
  getOrganApplicationsByHospital: `${API_BASE_URL}/getOrganApplicationsByHospital`,
  updateOrganApplicationStatus: `${API_BASE_URL}/updateOrganApplicationStatus`,

  // Donor-facing application tracking
  getOrganApplicationsByDonor: `${API_BASE_URL}/getOrganApplicationsByDonor`,

  // OTP
  sendOtp: `${API_BASE_URL}/sendOtp`,
  verifyOtp: `${API_BASE_URL}/verifyOtp`,

  // Donor profile
  updateDonorProfile: `${API_BASE_URL}/updateDonorProfile`,
  getDonorByEmail: `${API_BASE_URL}/getDonorByEmail`,

  // Donor blood request responses
  getDonorBloodRequests: `${API_BASE_URL}/getDonorBloodRequests`,
  respondToBloodRequest: `${API_BASE_URL}/respondToBloodRequest`,
};
