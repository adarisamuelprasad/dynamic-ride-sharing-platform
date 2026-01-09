# Quick Fix Commands for TripLy Frontend Syntax Errors

## Note: Due to the large number of syntax errors across many files, I've prepared this comprehensive guide. You can either:
## Option A: Apply fixes manually following this guide  
## Option B: Let me know and I'll fix them file-by-file interactively

---

## FILES THAT NEED FIXING (17 total):

### 1. Navbar.jsx - Line 43 & 45
**Line 43 - FIND**:
```javascript
const [passData, setPassData] = useState({ oldPassword, newPassword, confirmPassword);
```
**REPLACE WITH**:
```javascript
const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
```

**Line 45 - FIND**:
```javascript
setPassData({ ...passData, [e.target.name]);
```
**REPLACE WITH**:
```javascript
setPassData({ ...passData, [e.target.name]: e.target.value });
```

---

###2. Register.jsx - Line 35
**FIND**:
```javascript
setForm((prev) => ({ ...prev, [key]));
```
**REPLACE WITH**:
```javascript
setForm((prev) => ({ ...prev, [key]: value }));
```

---

### 3. Dashboard.jsx - Line 16
**FIND**:
```javascript
const [search, setSearch] = useState({ source, destination, date);
```
**REPLACE WITH**:
```javascript
const [search, setSearch] = useState({ source: "", destination: "", date: "" });
```

---

### 4. Login.jsx - Line 68
**FIND**:
```javascript
console.error('Login error, error);
```
**REPLACE WITH**:
```javascript
console.error('Login error', error);
```

---

### 5. NotFound.jsx - Line 8
**FIND**:
```javascript
console.error("404 Error, location.pathname);
```
**REPLACE WITH**:
```javascript
console.error("404 Error", location.pathname);
```

---

### 6. Profile.jsx - Line 22
**FIND**:
```javascript
phone);
```
**REPLACE WITH**:
```javascript
phone: ""
});
```

---

### 7. AdminDashboard.jsx - Lines 75-81
**FIND**:
```javascript
const target = e.target e.target & {
    name: { value: string };
    phone: { value: string };
    role: { value: string };
    vehicleModel?: { value: string };
    licensePlate?: { value: string };
    capacity?: { value: string };
};
```
**REPLACE WITH**:
```javascript
const target = e.target;
const payload = {
    name: target.name.value,
    phone: target.phone.value,
    role: target.role.value,
    vehicleModel: target.vehicleModel?.value,
    licensePlate: target.licensePlate?.value,
    capacity: target.capacity?.value
};
```

---

### 8. PostRide.jsx - Line 65
**FIND**:
```javascript
vehicleId), availableSeats) || "3"
```
**REPLACE WITH**:
```javascript
vehicleId: firstVehicle.id,
            availableSeats: firstVehicle.capacity || "3"
```

---

### 9. RideHistory.jsx - Line 56-57
**FIND**:
```javascript
        ){rides.map((ride, index) => (
                    <div key={ride.id} className="animate-fade-in" style={{ animationDelay))}
```
**REPLACE WITH**:
```javascript
        ) : (
            rides.map((ride, index) => (
                <div key={ride.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
```

---

### 10. MyBookings.jsx - Line 65
**FIND**:
```javascript
        state,
            booking, bookingId);
```
**REPLACE WITH**:
```javascript
        state: {
            booking,
            bookingId: booking.id
        }
    });
```

---

### 11. DriverRequests.jsx - Line 54
**FIND**:
```javascript
        ){requests.map((booking) => (
```
**REPLACE WITH**:
```javascript
        ) : (
            requests.map((booking) => (
```

---

### 12. sonner.jsx - Lines 12-14
**FIND**:
```javascript
    classNames, description, actionButton, cancelButton,
    },
  }}
```
**REPLACE WITH**:
```javascript
    classNames: {
        toast: "",
        description: "",
        actionButton: "",
        cancelButton: ""
    }
  }}
```

---

### 13. Payment.jsx - Lines 62 & 64
**Line 62 - FIND**:
```javascript
                transactionId).toString(36).substr(2, 9), ride, bookingId, bookingDetails);
```
**REPLACE WITH**:
```javascript
                transactionId: Date.now().toString(36).substr(2, 9),
                ride,
                bookingId,
                bookingDetails
            }
        });
```

**Line 64 - FIND**:
```javascript
console.error("Payment Flow Error, err);
```
**REPLACE WITH**:
```javascript
console.error("Payment Flow Error", err);
```

---

### 14. PaymentSuccess.jsx - Line 19
**FIND**:
```javascript
const canvas = await html2canvas(elementRef.current, { scale);
```
**REPLACE WITH**:
```javascript
const canvas = await html2canvas(elementRef.current, { scale: 2 });
```

---

### 15. RideCard.jsx - Line 78
**FIND**:
```javascript
plateNumber, acAvailable, sunroofAvailable, instantBooking, maxTwoInBack, petsAllowed, smokingAllowed, imageUrl, extraImages);
```
**REPLACE WITH**:
```javascript
    model: ride.vehicle?.model || "",
    plateNumber: ride.vehicle?.plateNumber || "",
    acAvailable: ride.vehicle?.acAvailable || false,
    sunroofAvailable: ride.vehicle?.sunroofAvailable || false,
    instantBooking: ride.instantBooking || false,
    maxTwoInBack: ride.maxTwoInBack || false,
    petsAllowed: ride.petsAllowed || false,
    smokingAllowed: ride.smokingAllowed || false,
    imageUrl: ride.vehicle?.imageUrl || "",
    extraImages: ride.vehicle?.extraImages || []
  });
```

---

### 16. PaymentHistory.jsx - Line 43-44
**FIND**:
```javascript
            ){transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-red-50".toLocaleDateString()}</td>
```
**REPLACE WITH**:
```javascript
            ) : (
                transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted">
                        <td className="px-6 py-4 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
```

---

## After applying all fixes above, the app should compile successfully!

## To verify fixes worked, run:
```bash
cd triply-frontend
npm run dev
```

If you see the Vite server start without syntax errors, you're good to go!
