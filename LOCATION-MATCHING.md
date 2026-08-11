# Location-Based Donor Matching System

## Overview
LifeLink now implements intelligent location-based matching to ensure donors are only matched with hospitals in their city. This prevents situations where a Cape Town donor would be matched with a hospital in Nairobi.

## How It Works

### 1. Automatic Matching with Location Filter
When a hospital creates a blood request:
1. System queries all donors with matching blood type
2. **Filters donors by location** - only donors in the same city as the hospital
3. Sends email notifications to all matched donors
4. Updates the blood request with the count of matched donors

### Example:
- **Groote Schuur Hospital** (Cape Town) requests **O+** blood
- System finds all **O+** donors
- **Filters to only Cape Town donors**
- Sends emails to Cape Town donors only
- Johannesburg or Nairobi donors are NOT contacted

## Donor Profile Management

### Donors Can Update Their Location
Donors can change their location after registration:
1. Log in to donor profile
2. Click "Edit Profile" button
3. Select new location from dropdown
4. Update phone number and name if needed
5. Click "Save Changes"

### Available Locations
- Cape Town
- Johannesburg
- Nairobi
- Dublin
- Lagos
- Pretoria
- Durban
- Port Elizabeth
- Bloemfontein
- Mombasa
- Kisumu
- Cork

## Technical Implementation

### Lambda Functions

#### 1. matchDonors (Updated)
**File:** `lambda/matchDonors/index.js`

**Key Changes:**
- Fetches hospital location from Hospitals table
- Filters donors by matching location (case-insensitive)
- Sends HTML email notifications via SES
- Logs location matching for debugging

**Location Filtering Logic:**
```javascript
eligibleDonors = eligibleDonors.filter(donor => {
  const donorLocation = donor.location || '';
  const isLocationMatch = donorLocation.toLowerCase() === hospitalLocation.toLowerCase();
  return isLocationMatch;
});
```

#### 2. updateDonorProfile (New)
**File:** `lambda/updateDonorProfile/index.js`

**Features:**
- Updates donor location, phone, and name
- Validates donor exists before updating
- Returns updated donor profile
- Adds updatedAt timestamp

**API Endpoint:** `POST /default/updateDonorProfile`

**Request Body:**
```json
{
  "donorId": "donor-uuid",
  "location": "Cape Town",
  "phone": "+27 123 456 789",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "donor": { ... updated donor object ... }
}
```

### Frontend Changes

#### DonorProfile.tsx
**New Features:**
- "Edit Profile" button on profile card
- Edit profile panel with:
  - Location dropdown (12 cities)
  - Phone number input
  - Full name input
- Real-time API integration
- Success/error feedback
- Location help text: "💡 You'll only be matched with hospitals in your location"

### Database Schema

#### Donors Table
- `donorId` (String, Primary Key)
- `location` (String) - City where donor is located
- `fullName` (String)
- `email` (String)
- `phone` (String)
- `bloodType` (String)
- `status` (String) - 'active' or 'inactive'
- `updatedAt` (String, ISO timestamp)

#### Hospitals Table
- `hospitalId` (String, Primary Key)
- `hospitalName` (String)
- `location` (String) - City where hospital is located
- `email` (String)
- `contact` (String)

## Testing Scenarios

### Test Case 1: Same Location Matching ✅
**Setup:**
- Hospital: Groote Schuur (Cape Town)
- Donors: 
  - Donor A: O+, Cape Town
  - Donor B: O+, Johannesburg

**Expected Result:**
- ✅ Donor A receives email
- ❌ Donor B does NOT receive email

### Test Case 2: Multiple Locations
**Setup:**
- Hospital: Kenyatta National Hospital (Nairobi)
- Donors:
  - Donor C: B-, Nairobi
  - Donor D: B-, Cape Town
  - Donor E: B-, Lagos

**Expected Result:**
- ✅ Only Donor C receives email
- ❌ Donors D and E do NOT receive email

### Test Case 3: Donor Updates Location
**Setup:**
1. Donor originally registered in Johannesburg
2. Donor moves to Cape Town
3. Donor updates profile location to Cape Town

**Expected Result:**
- ✅ Future Cape Town hospital requests will match this donor
- ❌ Future Johannesburg hospital requests will NOT match this donor

## Email Notification Format

Matched donors receive a professional HTML email with:
- 🩸 Blood type needed
- 📍 Hospital name and location
- ⏰ Urgency status
- 🔗 Link to LifeLink portal
- 📞 Hospital contact information

**Subject:** `🩸 Urgent: Your Blood is Needed at [Hospital Name]`

## API Configuration

### Frontend API Config
**File:** `src/config/api.ts`

```typescript
export const API = {
  // ... other endpoints
  updateDonorProfile: `${API_BASE_URL}/updateDonorProfile`,
};
```

### API Gateway Routes
- **API ID:** api8jqb1a1
- **Endpoint:** https://api8jqb1a1.execute-api.us-east-1.amazonaws.com
- **New Route:** `POST /default/updateDonorProfile`

## Deployment

### Lambda Functions Deployed:
1. ✅ `matchDonors` - Updated with location filtering
2. ✅ `updateDonorProfile` - New function created

### API Gateway:
- ✅ Integration created for updateDonorProfile
- ✅ Lambda permissions configured

## Monitoring & Debugging

### CloudWatch Logs
Check these log groups:
- `/aws/lambda/matchDonors` - View matching logic and location filtering
- `/aws/lambda/updateDonorProfile` - View profile updates

### Key Logs to Monitor:
```
Hospital: [Name], Location: [City]
Found X donors with blood type [Type]
Donor [Name]: [Location] - Match: true/false
After location filter: X eligible donors in [City]
```

## Future Enhancements

### Potential Improvements:
1. **Distance-based matching** - Match donors within X km radius
2. **Multi-city hospitals** - Support for hospital chains in multiple cities
3. **Preferred hospitals** - Let donors choose preferred hospitals
4. **Location verification** - GPS-based location confirmation
5. **Regional matching** - Match within regions (e.g., Western Cape)

## Troubleshooting

### Donor Not Receiving Emails
1. Check donor's location matches hospital location
2. Verify donor status is 'active'
3. Check donor's blood type matches request
4. Confirm donor email is verified in SES

### No Donors Matched
1. Verify hospital has correct location in database
2. Check if donors exist with matching blood type
3. Ensure donors have location field populated
4. Review CloudWatch logs for filtering details

## Related Files
- `lambda/matchDonors/index.js` - Location filtering logic
- `lambda/updateDonorProfile/index.js` - Profile update logic
- `src/pages/DonorProfile.tsx` - Frontend UI
- `src/config/api.ts` - API endpoints
- `infrastructure/SES-SETUP.md` - Email configuration
