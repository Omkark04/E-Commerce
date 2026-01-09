# Google Maps API Setup Instructions

## Issue
The Google Maps JavaScript API is not activated for your API key.

## Solution

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Enable Maps JavaScript API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click on it and press "ENABLE"

3. **Also Enable (Required for full functionality):**
   - Geocoding API (for address lookup)
   - Places API (for location search)

4. **Verify API Key Restrictions:**
   - Go to "APIs & Services" → "Credentials"
   - Click on your API key
   - Under "API restrictions", select "Restrict key"
   - Add these APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API

5. **Add HTTP Referrer Restrictions:**
   - Under "Application restrictions", select "HTTP referrers"
   - Add: `http://localhost:*/*`
   - Add: `http://127.0.0.1:*/*`

## Alternative: Disable Google Maps Temporarily

If you want to test without Google Maps, you can disable the map feature:

In `AddressForm.tsx`, comment out or remove the LocationPicker component and the "Select on Map" button.

## Current Status
- ✅ API Key is set in `.env`
- ❌ Maps JavaScript API not enabled
- ❌ Geocoding API not enabled (needed for reverse geocoding)

After enabling the APIs, refresh your browser and the map should work!
