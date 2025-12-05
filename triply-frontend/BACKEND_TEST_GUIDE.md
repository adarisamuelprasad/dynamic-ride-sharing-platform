# Backend API Test Guide

## Test the Backend Directly

### 1. Check if Backend is Running
Open your browser and go to:
```
http://localhost:8080
```

You should see a Whitelabel Error Page (this is normal - it means the backend is running).

### 2. Test Login API Directly

Open a new terminal and run this command:

**Test Admin Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123!\"}"
```

**Test Passenger Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"vibha@example.com\",\"password\":\"Password123!\"}"
```

**Test Driver Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ranvitha@example.com\",\"password\":\"Password123!\"}"
```

### Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "admin@example.com",
  "role": "ROLE_ADMIN",
  "name": "Admin"
}
```

### If you get "Invalid credentials":

1. **Check Backend Logs**
   - Look for "Seeding database..." or similar messages
   - Check if users were created

2. **Restart Backend**
   - Stop the backend (Ctrl+C)
   - Start again: `mvn spring-boot:run`
   - H2 database resets on restart, users will be recreated

3. **Check H2 Console** (if enabled)
   - Go to: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:triplydb`
   - Username: `sa`
   - Password: (leave empty)
   - Run query: `SELECT * FROM USERS;`

### Common Issues:

**Issue 1: "Connection refused"**
- Backend is not running
- Start backend: `mvn spring-boot:run`

**Issue 2: "Invalid credentials"**
- Database not seeded
- Restart backend to trigger seeding

**Issue 3: "CORS error"**
- Frontend URL not in CORS whitelist
- Check `SecurityConfig.java` - should allow `http://localhost:5173`

---

## Quick Test from Frontend

1. Open browser to: http://localhost:5173
2. Click "Sign In"
3. Try these credentials:
   - Email: `admin@example.com`
   - Password: `Admin123!`

4. Open browser DevTools (F12)
5. Go to Console tab
6. Look for any error messages

---

## Troubleshooting Steps

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8080
```
Should return HTML (Whitelabel Error Page)

### Step 2: Check Backend Logs
Look for these messages in backend terminal:
```
Started TriplyBackendApplication
Tomcat started on port 8080
```

### Step 3: Test Login Endpoint
Use the curl commands above

### Step 4: Check Frontend Console
- Open DevTools (F12)
- Go to Network tab
- Try to login
- Look for the `/api/auth/login` request
- Check the response

---

## If Still Not Working

Please share:
1. Backend terminal output (last 20 lines)
2. Frontend browser console errors
3. Network tab showing the login request/response

This will help me diagnose the exact issue!
