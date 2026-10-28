# Learn C Language

Run locally:  `node server.js`  → http://localhost:3000 (demo OTP shown on screen)

Real OTP e-mails (set as environment variables — never put them in code):
    SMTP_USER=yourgmail@gmail.com SMTP_PASS="your 16 char app password" node server.js

Deploy (Render / Railway / any Docker host): use the included Dockerfile, set SMTP_USER and SMTP_PASS in the dashboard.

Make the Android APK from the deployed URL:
 1. Open https://www.pwabuilder.com, enter your deployed https URL.
 2. Choose Android → Download package (APK / AAB). Install the APK on your phone.
