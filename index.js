const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const pino = require('pino')

const FIREBASE_URL = process.env.FIREBASE_URL

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState('session')
const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
auth: state,
logger: pino({ level: "silent" })
})

sock.ev.on("connection.update",(update)=>{

if(update.qr){

console.log("SCAN QR")
qrcode.generate(update.qr,{small:true})

}

})

sock.ev.on("creds.update",saveCreds)

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
