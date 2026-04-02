const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startYamiVip() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "121.0.6167.160"]
    });

    // --- نظام معالجة الرسائل والأوامر ---
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = getContentType(msg.message);
        const body = type === 'conversation' ? msg.message.conversation : 
                     type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';
        const prefix = '.'; // الرمز قبل الأمر
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';

        // --- قائمة الأوامر الخارقة ---
        if (command === 'يامي' || command === 'yami') {
            await sock.sendMessage(from, { text: '🛡️ *HELM MD - DEV: YAMI OFFICIAL*\n\nالبوت يعمل الآن بأعلى كفاءة سحابية.\nالحقوق محفوظة للمطور يامي.' });
        }

        if (command === 'ping' || command === 'بنج') {
            const start = Date.now();
            await sock.sendMessage(from, { text: '🚀 جاري قياس السرعة...' });
            const end = Date.now();
            await sock.sendMessage(from, { text: `⚡ السرعة: ${end - start}ms` });
        }

        if (command === 'broadcast' || command === 'اذاعة') {
            // كود الإرسال للكل يوضع هنا
        }
    });

    sock.ev.on('creds.update', saveCreds);
    // (بقية كود الاتصال اللي استخدمناه سابقاً)
}
startYamiVip();
