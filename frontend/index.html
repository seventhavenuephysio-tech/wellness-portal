<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Wellness Centre</title>
    <style>
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background-color: #f8fafc; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .container { width: 100%; max-width: 1400px; display: flex; flex-direction: column; gap: 16px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px; }
        .header h2 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .booked-badge { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
        .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
        @media (max-width: 900px) { .app-grid { grid-template-columns: 1fr; } }
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .practitioner-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .practitioner-name { font-weight: bold; font-size: 1.1rem; color: #0f172a; }
        .practitioner-role { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
        .slot-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .slot-card.booked { background: #f0fdf4; border-color: #bbf7d0; }
        .slot-time { font-weight: 600; font-size: 0.95rem; color: #1e293b; }
        .btn { padding: 6px 14px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .btn-book { background: #047857; color: white; }
        .btn-cancel { background: #ef4444; color: white; margin-left: 6px; }
        .btn-remind { background: #10b981; color: white; }
        .patient-info { font-size: 0.85rem; color: #475569; margin-top: 4px; display: flex; flex-direction: column; gap: 2px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>The Wellness Centre</h2>
        <div class="booked-badge"><span id="totalBookedCount">0</span> Booked</div>
    </div>
    <div id="app" class="app-grid"></div>
</div>
<script>
    localStorage.removeItem("saved_therapist_schedules");

    const therapists = [
        { name: "Chido", role: "Physiotherapist", slots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        { name: "Mispar", role: "Physiotherapist", slots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        { name: "Tinotenda", role: "Physiotherapist", slots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] }
    ];

    let bookingsList = [];

    function updateBookingCount() {
        document.getElementById("totalBookedCount").textContent = bookingsList.length;
    }

    async function loadSlots() {
        try {
            const res = await fetch("/api/bookings");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) bookingsList = data;
            }
        } catch (e) {}
        renderColumns(therapists);
    }

    async function bookSlot(practitioner, slot) {
        const name = prompt("Enter Patient Name:");
        if (!name) return;
        const phone = prompt("Enter Phone Number:") || "";
        const booking = { practitioner, therapist: practitioner, slot, time: slot, name, phone };
        
        bookingsList.push(booking);
        renderColumns(therapists);

        try {
            await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function cancelBooking(practitioner, slot) {
        if (!confirm("Cancel booking at " + slot + " for " + practitioner + "?")) return;
        bookingsList = bookingsList.filter(b => !(
            (b.practitioner === practitioner || b.therapist === practitioner) &&
            (b.slot === slot || b.time === slot)
        ));
        renderColumns(therapists);

        try {
            await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ practitioner, slot })
            });
        } catch (err) {
            console.error(err);
        }
    }

    function renderColumns(data) {
        updateBookingCount();
        const app = document.getElementById("app");
        app.innerHTML = "";
        data.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            let slotsHTML = "";
            p.slots.forEach(slot => {
                const booking = bookingsList.find(b => 
                    (b.practitioner === p.name || b.therapist === p.name) && 
                    (b.slot === slot || b.time === slot)
                );
                if (booking) {
                    slotsHTML += `
                        <div class="slot-card booked">
                            <div>
                                <div class="slot-time">${slot}</div>
                                <div class="patient-info">
                                    <span><strong>👤 ${booking.name}</strong></span>
                                    ${booking.phone ? `<span>📱 ${booking.phone}</span>` : ''}
                                </div>
                            </div>
                            <div>
                                <button class="btn btn-remind">Remind</button>
                                <button class="btn btn-cancel" onclick="cancelBooking('${p.name}', '${slot}')">Cancel</button>
                            </div>
                        </div>`;
                } else {
                    slotsHTML += `
                        <div class="slot-card">
                            <div class="slot-time">${slot}</div>
                            <button class="btn btn-book" onclick="bookSlot('${p.name}', '${slot}')">+ Book</button>
                        </div>`;
                }
            });
            card.innerHTML = `
                <div class="practitioner-header">
                    <span class="practitioner-name">${p.name}</span>
                    <span class="practitioner-role">${p.role}</span>
                </div>
                ${slotsHTML}`;
            app.appendChild(card);
        });
    }

    loadSlots();
    setInterval(loadSlots, 3000);
</script>
</body>
</html>
