const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("baileys")
const pino = require("pino")

const FIREBASE_URL = process.env.FIREBASE_URL

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("session")
const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
auth: state,
logger: pino({ level:"silent"})
})

if(!sock.authState.creds.registered){

const phoneNumber="+918788273897"

const code = await sock.requestPairingCode(phoneNumber)

console.log("PAIRING CODE:",code)

}

sock.ev.on("connection.update",(update)=>{

if(update.connection==="open"){

console.log("BOT CONNECTED")

startOTPWatcher(sock)

}

})

sock.ev.on("creds.update", saveCreds)

}

async function startOTPWatcher(sock){

setInterval(async ()=>{

const res = await fetch(`${FIREBASE_URL}/otp_requests.json`)
const data = await res.json()

if(!data) return

for(const phone in data){

const otp = data[phone].otp

await sock.sendMessage(phone+"@s.whatsapp.net",{
text:`Prince Auto Parts Warranty Login

Your OTP: ${otp}`
})

}

},10000)

}

startBot()
