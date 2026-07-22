const Twilio = require('twilio'); 

// Drop your live keys right here
const client = new Twilio('AC41acc85964acbf796d75120883ba08ae', 'a519b2031b4885c5e9485bf3e11bde1a'); 

client.messages.create({ 
    body: 'Wellness Centre Reminder: Hi Matilda, this is a live test notification for your upcoming therapy session.', 
    from: 'whatsapp:+14155238886', 
    to: 'whatsapp:+263777002494' // <-- CHANGE THIS TO YOUR ACTUAL MOBILE NUMBER
})
.then(m => console.log('✅ Success! Message SID:', m.sid))
.catch(e => console.error('❌ Error:', e.message));