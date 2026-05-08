## Hospilink Backend API Documentation

This document lists the backend HTTP APIs exposed by the Hospilink server (Phase 3). Each section groups related endpoints with route path, HTTP method, authentication requirement, request format, and example responses.

Notes:
- Base URL (local dev): `http://localhost:3000`
- Protected endpoints require `Authorization: Bearer <token>` header
- Date/time formats: `YYYY-MM-DD` for dates, `HH:MM` for time slots, and ISO 8601 for full timestamps

---

**Authentication**

- **POST /api/auth/register**
  - Auth: none
  - Description: Register a new user (patient, hospital_admin, doctor, super_admin, etc.)
  - Request JSON:
    ```json
    {
      "email": "user@example.com",
      "password": "Secret123!",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "9876543210",
      "gender": "male",
      "role": "patient"
    }
    ```
  - Success: 201 Created
    ```json
    { "message": "User registered", "user": { "_id": "...", "email": "user@example.com" } }
    ```
  - Errors: 400 Bad Request (missing fields), 409 Conflict (email exists)

- **POST /api/auth/login**
  - Auth: none
  - Description: Authenticate user, returns JWT token
  - Request JSON:
    ```json
    { "email": "user@example.com", "password": "Secret123!" }
    ```
  - Success: 200 OK
    ```json
    { "token": "<jwt>", "user": { "_id": "...", "email": "user@example.com", "role": "patient" } }
    ```
  - Errors: 400 Bad Request, 401 Unauthorized

- **POST /api/auth/logout**
  - Auth: protected (optional cookie-based)
  - Description: Invalidate session / clear cookie
  - Success: 200 OK { "message": "Logged out" }

---

**Hospitals**

- **POST /api/hospitals/register**
  - Auth: none (public hospital registration)
  - Description: Register hospital with admin details. Generates hospitalId and admin user (inactive) and emails credentials.
  - Request JSON (example):
    ```json
    {
      "name": "Test Hospital",
      "address": { "street": "123 Main", "city": "Bangalore", "state": "KA", "zip": "560001" },
      "contact": { "phone": "9876543210", "email": "info@test.com" },
      "admin": { "firstName": "Admin", "lastName": "User", "email": "admin@test.com", "phone": "9999888877", "gender": "male", "password": "Admin123!" },
      "departments": [{ "name": "Cardiology" }]
    }
    ```
  - Success: 201 Created
    ```json
    { "message": "Hospital registration submitted for approval", "hospital": { "hospitalId": "HOSP_001", "name": "Test Hospital" }, "admin": { "email": "admin@test.com" }, "emailSent": true }
    ```
  - Errors: 400 Missing required fields

- **PUT /api/hospitals/:hospitalId/approve**
  - Auth: protected, `super_admin` only
  - Description: Approve a pending hospital registration and set hospital/admin status active
  - Request JSON: { "reviewNotes": "Approved" }
  - Success: 200 OK { "message": "Hospital approved", "hospital": { "hospitalId": "HOSP_001", "status": "active" } }
  - Errors: 404 Not Found, 403 Forbidden

- **GET /api/hospitals/**
  - Auth: protected, `super_admin` only
  - Description: List hospitals (supports filters/pagination)

Refer to the hospital controller for additional admin actions: reject, suspend via `PUT /api/hospitals/:hospitalId/reject` and `PUT /api/hospitals/:hospitalId/suspend`.

---

**Doctors**

- **POST /api/doctors/hospitals/:hospitalId/doctors/add**
  - Auth: protected, `hospital_admin` only
  - Description: Add a new doctor to the hospital. Generates temp password and sends onboarding email.
  - Request JSON (example):
    ```json
    {
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "email": "dr1@test.com",
      "phone": "9876543210",
      "specialization": "Cardiology",
      "department": "Cardiology",
      "licenseNumber": "LIC001234",
      "yearsOfExperience": 10
    }
    ```
  - Success: 201 Created
    ```json
    { "message": "Doctor added", "doctor": { "_id": "...", "email": "dr1@test.com", "hospitalId": "HOSP_001" } }
    ```
  - Errors: 400 Bad Request, 409 Conflict (email exists)

- **GET /api/doctors/hospitals/:hospitalId/doctors**
  - Auth: protected (hospital_admin or higher)
  - Description: List all doctors for a hospital

- **GET /api/doctors/profile**
  - Auth: protected (doctor)
  - Description: Get current doctor profile, availability, blockedDates, onBreak status

- **PUT /api/doctors/availability**
  - Auth: protected (doctor)
  - Description: Update weekly schedule or consultation duration/fee
  - Request JSON (example):
    ```json
    {
      "weeklySchedule": {
        "monday": { "available": true, "start": "09:00", "end": "17:00" },
        "tuesday": { "available": true, "start": "09:00", "end": "17:00" }
      },
      "consultationDuration": 30,
      "consultationFee": 300
    }
    ```

- **POST /api/doctors/leave**
  - Auth: protected (doctor)
  - Description: Add blocked date range (leave) and trigger auto-cancel of conflicting appointments
  - Request JSON: { "startDate": "2026-05-20", "endDate": "2026-05-25", "reason": "Annual leave", "autoCancel": true }

- **POST /api/doctors/break/start** and **POST /api/doctors/break/end**
  - Auth: protected (doctor)
  - Description: Start/End dynamic on-break periods. Starts with `{ "breakEnd": "2026-05-11T11:00:00Z", "reason": "Emergency" }`

---

**Appointments**

- **GET /api/appointments/search-doctors?hospitalId=&specialization=&q=**
  - Auth: none (public)
  - Description: Search doctors in a hospital (filters: specialization, name query)
  - Success: 200 OK { "count": 1, "doctors": [ { "_id": "...", "name": "Dr. Rajesh Kumar", "specialization": "Cardiology" } ] }

- **GET /api/appointments/available-slots?doctorId=&startDate=&daysAhead=**
  - Auth: none (public)
  - Description: Returns available slots per date for the given doctor for the next N days. Uses `calculateAvailableSlots` under the hood.
  - Query params:
    - `doctorId` (required)
    - `startDate` (YYYY-MM-DD) (required)
    - `daysAhead` (optional, default 7)
  - Success: 200 OK
    ```json
    {
      "slots": {
        "2026-05-11": [ "09:00", "09:30", "10:00" ],
        "2026-05-12": [ "09:00", "09:30" ]
      }
    }
    ```

- **POST /api/appointments/book**
  - Auth: protected (patient)
  - Description: Book an appointment. Server validates slot availability (race-safe) and creates appointment snapshot.
  - Request JSON (example):
    ```json
    {
      "doctorId": "<id>",
      "hospitalId": "HOSP_001",
      "appointmentDate": "2026-05-11T09:00:00Z",
      "timeSlot": "09:00",
      "appointmentType": "consultation",
      "reason": "Checkup"
    }
    ```
  - Success: 201 Created
    ```json
    { "message": "Appointment booked", "appointment": { "appointmentId": "APT_HOSP_010_20260511_0900", "status": "scheduled" } }
    ```
  - Errors: 400 Bad Request, 409 Conflict (slot already taken), 422 Unprocessable Entity (invalid date)

- **DELETE /api/appointments/:appointmentId**
  - Auth: protected (patient or doctor)
  - Description: Cancel an appointment. Accepts body `{ "reason": "Cancelled by patient" }`. Frees the slot and notifies involved parties.
  - Success: 200 OK { "message": "Appointment cancelled", "appointment": { "_id": "...", "status": "cancelled" } }

- **GET /api/appointments/my-appointments**
  - Auth: protected
  - Description: Returns appointments for the authenticated user (doctor or patient)

- **GET /api/appointments/doctor/:doctorId/schedule?date=YYYY-MM-DD**
  - Auth: protected (doctor or hospital_admin)
  - Description: Get the doctor's appointments for a given date

---

**Email / Notifications**

- Email delivery is handled by `email.service` (Gmail OAuth2 with SMTP fallback). Typical emails sent:
  - Hospital admin credentials
  - Doctor onboarding credentials
  - Appointment confirmation (to patient and doctor)
  - Appointment cancellation notices

---

Notes & Implementation Details
- Appointment ID format: `APT_{HOSP}_{YYYYMMDD}_{HHMM}`
- Time slots use `HH:MM` 24-hour format. Appointment durations are in minutes (default 30).
- Availability engine respects `weeklySchedule`, dynamic `onBreak`, and `blockedDates`.
- Slot generation uses buffer minutes between appointments and excludes slots that cannot fully contain appointment duration.

If you want, I can convert this to OpenAPI (Swagger) YAML next, or expand each endpoint with full request/response JSON schemas and example payloads.
