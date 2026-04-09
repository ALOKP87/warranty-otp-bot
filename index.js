const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require("pino")
const fetch = require("node-fetch")

const FIREBASE_URL = process.env.FIREBASE_URL
const BOT_PHONE = process.env.BOT_PHONE

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("session")
const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
auth: state,
logger: pino({ level:"silent"})
})

if(!sock.authState.creds.registered){

const pairingCode = await sock.requestPairingCode(BOT_PHONE)

console.log("PAIRING CODE:", pairingCode)

}

sock.ev.on("connection.update",(update)=>{

const { connection } = update

if(connection === "open"){

console.log("BOT CONNECTED")

startOTPWatcher(sock)

}

})

sock.ev.on("creds.update", saveCreds)

}

async function startOTPWatcher(sock){

setInterval(async ()=>{

try{

const res = await fetch(`${FIREBASE_URL}/otp_requests.json`)
const data = await res.json()

if(!data) return

for(const phone in data){

const otp = data[phone].otp

await sock.sendMessage(phone+"@s.whatsapp.net",{
text:`Prince Auto Parts Warranty Login

Your OTP: ${otp}`
})

await fetch(`${FIREBASE_URL}/otp_requests/${phone}.json`,{
method:"DELETE"
})

console.log("OTP sent to:", phone)

}

}catch(e){

console.log("Error:",e)

}

},10000)

}

startBot()
