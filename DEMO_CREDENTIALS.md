# Demo Credentials - Development Only

**⚠️ FOR DEVELOPMENT/DEMO PURPOSES ONLY - DO NOT USE IN PRODUCTION**

These credentials are seeded when running with the `demo` Spring profile:
```bash
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run
```

---

## Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@hvacmarketplace.com` |
| Password | `admin123` |
| Role | `ADMIN` |

**Capabilities:** Full platform access, user management, contractor management, all service requests

---

## Customer Accounts (3)

| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `customer1@hvacmarketplace.com` | `customer123` | John Doe | +1-602-555-0101 |
| `customer2@hvacmarketplace.com` | `customer123` | Jane Smith | +1-602-555-0102 |
| `customer3@hvacmarketplace.com` | `customer123` | Mike Wilson | +1-602-555-0103 |

**Capabilities:** Create service requests, view own requests, book appointments, leave reviews for completed jobs

---

## Contractor Accounts (5)

| Email | Password | Contact Name | Business Name | Phone |
|-------|----------|--------------|---------------|-------|
| `contractor1@hvacmarketplace.com` | `contractor123` | Mike Davis | Cool Air Solutions | +1-602-555-0201 |
| `contractor2@hvacmarketplace.com` | `contractor123` | Sarah Johnson | Frost Comfort Co | +1-602-555-0202 |
| `contractor3@hvacmarketplace.com` | `contractor123` | Robert Martinez | Arctic Breeze HVAC | +1-602-555-0203 |
| `contractor4@hvacmarketplace.com` | `contractor123` | Lisa Anderson | Desert Cooling Experts | +1-602-555-0204 |
| `contractor5@hvacmarketplace.com` | `contractor123` | David Thompson | Sun State HVAC | +1-602-555-0205 |

**Capabilities:** Manage profile, service areas, availability, view/accept/reject leads, manage appointments, view reviews

---

## Authentication Endpoints

All endpoints are prefixed with `/api/v1` due to `spring.mvc.servlet.path=/api/v1`

### Register Customer
```bash
POST /api/v1/auth/register/customer?firstName=John&lastName=Doe
Content-Type: application/json

{
  "email": "newcustomer@email.com",
  "password": "securepassword"
}
```

### Register Contractor
```bash
POST /api/v1/auth/register/contractor?firstName=Mike&lastName=Davis
Content-Type: application/json

{
  "email": "newcontractor@email.com",
  "password": "securepassword"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "customer1@hvacmarketplace.com",
  "password": "customer123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "id": 1,
  "email": "customer1@hvacmarketplace.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
```

### Get Current User
```bash
GET /api/v1/auth/me
Authorization: Bearer <jwt-token>
```

---

## Demo Data Summary (Phoenix, AZ Market)

### Service Requests (5)
| ID | Customer | Service | ZIP | Status |
|----|----------|---------|-----|--------|
| 1 | John Doe | AC Repair | 85016 | SCHEDULED |
| 2 | Jane Smith | AC Installation | 85020 | SCHEDULED |
| 3 | Mike Wilson | Emergency AC Repair | 85028 | COMPLETED |
| 4 | John Doe | Heating Repair | 85016 | NEW |
| 5 | Jane Smith | HVAC Maintenance | 85020 | NEW |

### Lead Assignments (6)
| Service Request | Contractor | Status | Quote |
|----------------|------------|--------|-------|
| SR1 (AC Repair) | Cool Air Solutions | ACCEPTED | $450 |
| SR1 (AC Repair) | Frost Comfort Co | REJECTED | - |
| SR2 (AC Install) | Arctic Breeze HVAC | ACCEPTED | $5,500 |
| SR2 (AC Install) | Sun State HVAC | SENT | - |
| SR3 (Emergency) | Cool Air Solutions | ACCEPTED | $350 |
| SR3 (Emergency) | Desert Cooling | SENT | - |

### Appointments (3)
| Service Request | Contractor | Status | Scheduled |
|----------------|------------|--------|-----------|
| SR1 | Cool Air Solutions | SCHEDULED | +3 days, 10:00-12:00 |
| SR2 | Arctic Breeze HVAC | SCHEDULED | +7 days, 09:00-15:00 |
| SR3 | Cool Air Solutions | COMPLETED | -1 day, 08:00-10:00 |

### Reviews (1)
| Customer | Contractor | Service Request | Rating | Comment |
|----------|------------|----------------|--------|---------|
| Mike Wilson | Cool Air Solutions | SR3 (Emergency) | 5/5 | "Excellent emergency service!" |

---

## Contractor Service Areas (Deterministic ZIP Codes)

| Contractor | ZIP Codes |
|------------|-----------|
| Cool Air Solutions | 85001, 85003, 85004, 85006, 85007, 85008 |
| Frost Comfort Co | 85009, 85012, 85013, 85014, 85015, 85016 |
| Arctic Breeze HVAC | 85017, 85018, 85019, 85020, 85021, 85022 |
| Desert Cooling Experts | 85023, 85024, 85027, 85028, 85029, 85031 |
| Sun State HVAC | 85032, 85033, 85034, 85035, 85037, 85040 |

---

## Contractor Availability

All contractors: Monday-Friday, 8:00 AM - 6:00 PM
Emergency availability: Cool Air, Frost Comfort, Arctic Breeze, Sun State = YES; Desert Cooling = NO

---

## Testing Commands

```bash
# Start with demo profile
cd back
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run

# Test authentication
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@hvacmarketplace.com","password":"customer123"}'

# Test protected endpoint (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:8081/api/v1/auth/me

# Test public endpoint (no auth needed)
curl http://localhost:8081/api/v1/contractor-profile/1
curl http://localhost:8081/api/v1/service-areas/zip/85001
```

---

## Security Notes

- All passwords are BCrypt hashed in database
- JWT tokens expire in 24 hours (configurable via `app.jwt.expiration`)
- JWT secret is configurable via `app.jwt.secret` (use env var in production)
- Public endpoints: `/api/v1/auth/**`, `GET /api/v1/contractor-profile/**`, `GET /api/v1/service-areas/zip/**`, `/h2-console/**`
- All other `/api/v1/**` endpoints require valid JWT authentication
- Role-based access enforced at controller level (`@PreAuthorize`)
- Ownership checks enforced at service layer

---

## Resetting Demo Data

To reseed demo data, restart the application with the demo profile. H2 is in-memory, so data is fresh on each startup.

```bash
cd back
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run
```