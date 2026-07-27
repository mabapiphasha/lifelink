
const API_BASE_URL = 'https://api8jqb1a1.execute-api.us-east-1.amazonaws.com/default';

export const API = {
  verifyCode: `${API_BASE_URL}/verifyDonorCode`,
  registerDonor: `${API_BASE_URL}/registerDonor`,
  getBloodRequests: `${API_BASE_URL}/getBloodRequests`,
  createBloodRequest: `${API_BASE_URL}/createBloodRequest`,
  matchDonors: `${API_BASE_URL}/matchDonors`,
  submitOrganApplication: `${API_BASE_URL}/submitOrganApplication`,
};

