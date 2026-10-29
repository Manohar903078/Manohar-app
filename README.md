# Learn C Language

Run locally:  `node server.js`  → http://localhost:3000 

Real OTP e-mails (set as environment variables — never put them in code):
    SMTP_USER=learningclanguage13@gmail.com SMTP_PASS="ghkr hwbs cmvm ewca" node server.js

Deploy (Render / Railway / any Docker host): use the included Dockerfile, set SMTP_USER and SMTP_PASS in the dashboard.

Make the Android APK from the deployed URL:
 1. Open https://www.pwabuilder.com, enter your deployed https URL.
 2. Choose Android → Download package (APK / AAB). Install the APK on your phone.
