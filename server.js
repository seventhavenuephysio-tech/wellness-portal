async function bookSlot(therapist, time) {
    const date = cleanDateString(document.getElementById("diaryDate").value);
    const patientName = prompt(`Enter patient name for ${therapist} at ${time}:`);
    if (!patientName) return;

    const patientPhone = prompt(`Enter WhatsApp number with country code (e.g. +263771234567):`);

    try {
        const response = await fetch(API_BASE_URL + "/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ therapist, time, date, patientName, patientPhone })
        });

        if (response.ok) {
            alert(`Booking confirmed! WhatsApp reminder sent to ${patientName}.`);
            fetchAndRenderBookings();
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Booking failed: ${errorData.error || 'Server error'}`);
        }
    } catch (error) {
        console.error("Error saving booking:", error);
        alert("Server error when attempting to book.");
    }
}
