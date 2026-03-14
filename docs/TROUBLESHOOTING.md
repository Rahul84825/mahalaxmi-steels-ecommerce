# Troubleshooting

## Introduction

This document lists common operational and development issues with practical fixes.

## Quick Diagnosis Checklist

- Is backend running and reachable at `/api/health`?
- Are all required environment variables configured?
- Is MongoDB connection valid?
- Is frontend API URL pointing to the correct backend?
- Are admin-protected APIs being called with an admin token?

## SMTP Connection Errors

### Symptoms

- Email send failures in logs
- Timeouts like `ETIMEDOUT` or connection reset errors

### Possible causes

- Wrong `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS`
- Blocked SMTP port in hosting environment
- Invalid SMTP account status

### Fixes

1. Verify `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.
2. Try explicit `SMTP_PORT=2525`.
3. Confirm SMTP provider account is active.
4. Check platform outbound network restrictions.

## Email Not Received

### Symptoms

- API request succeeds but no email appears in inbox

### Possible causes

- Message delivered to spam/junk
- Invalid `EMAIL_FROM` or sender policy issues
- `ADMIN_EMAIL` missing for admin notifications

### Fixes

1. Check spam folder and provider logs.
2. Set a valid `EMAIL_FROM` address.
3. Ensure `ADMIN_EMAIL` is configured.
4. Verify SMTP provider sending limits.

## Deployment Problems

### Symptoms

- Frontend loads but API calls fail
- CORS errors in browser console
- Admin panel cannot authenticate

### Possible causes

- `VITE_API_URL` points to wrong backend
- Backend `CLIENT_URL` does not match frontend domain
- Missing environment variables in platform settings

### Fixes

1. Set `VITE_API_URL` to deployed backend URL.
2. Set backend `CLIENT_URL` and `FRONTEND_URL` to deployed frontend URL.
3. Redeploy after env variable updates.

## Environment Variable Issues

### Symptoms

- Runtime crashes during startup
- Features silently failing (email, upload, oauth)

### Possible causes

- Variable missing in production dashboard
- Typo in variable key
- `.env` loaded locally but not set remotely

### Fixes

1. Compare deployed variables with README template.
2. Check exact key names and casing.
3. Restart/redeploy service after variable changes.

## MongoDB Connection Errors

### Symptoms

- Backend exits on startup
- Logs show MongoDB connection failures

### Possible causes

- Invalid `MONGO_URI`
- Atlas IP/network restriction
- Temporary database outage

### Fixes

1. Validate URI format and credentials.
2. Allow backend host network in Atlas settings.
3. Check Atlas status and retry.

## Cloudinary Upload Failures

### Symptoms

- Product image upload fails in admin panel
- API returns upload error

### Possible causes

- Missing Cloudinary credentials
- Unsupported file type
- File larger than 5 MB

### Fixes

1. Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
2. Upload only jpg/jpeg/png/webp.
3. Keep image size under 5 MB.

## Realtime Notification Issues

### Symptoms

- New orders appear only after manual refresh
- Notification sound not playing

### Possible causes

- Socket connection blocked or wrong URL
- Browser autoplay restriction on audio
- `VITE_API_URL` misconfigured

### Fixes

1. Verify `VITE_API_URL` and backend socket CORS (`CLIENT_URL`).
2. Check browser console for socket connection errors.
3. Interact with page once to satisfy autoplay policy.

## Google Login Not Working

### Symptoms

- Google button not shown
- Login fails with auth errors

### Possible causes

- Missing `VITE_GOOGLE_CLIENT_ID` or backend `GOOGLE_CLIENT_ID`
- OAuth origin not registered in Google Cloud Console

### Fixes

1. Set both frontend and backend Google client id variables.
2. Add correct authorized origins and redirect URIs.
3. Ensure frontend and backend URLs exactly match configured values.

## Order Creation Fails for Valid Cart

### Symptoms

- Checkout returns delivery-related validation errors

### Possible causes

- Delivery location outside configured radius (20 km)
- Invalid address details/pincode

### Fixes

1. Validate address and pincode.
2. Confirm target location is inside delivery radius.
3. Check geocoding service availability if failures are inconsistent.

## Debug Commands

Useful local commands:

```bash
# backend
cd backend
npm run dev

# frontend
cd frontend
npm run dev
```

Health check endpoint:

```bash
curl http://localhost:5000/api/health
```

## Escalation

If unresolved after the above checks:

1. Capture backend logs and browser console errors.
2. Include failing endpoint, request payload, and timestamp.
3. Share environment variable keys used (never share secret values).
