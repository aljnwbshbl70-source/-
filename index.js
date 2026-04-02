const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');

// بياناتك اللي عطيتني إياها
const token = '8129323337:AAEXCXQgOZ89gWm3GYmqkPlI8ZSyFC8AzT0';
const adminId = '7061804635';
const tBot = new TelegramBot(token, { polling: true });

async function startWhatsApp(chatId, phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState('yami_session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "121.0.6167.160"]
    });

    if (!sock.authState.creds.registered) {
        try {
            tBot.sendMessage(chatId, "⏳ جاري استخراج كود الربط من سيرفرات واتساب...");
            const code = await sock.requestPairingCode(phoneNumber.trim());
            tBot.sendMessage(chatId, `✅ تم استخراج كود الربط بنجاح!\n\n🔥 الكود هو: [ ${code} ]\n\nأدخله الآن في الواتساب (الأجهزة المرتبطة).`);
        } catch (e) {
            tBot.sendMessage(chatId, "❌ خطأ: تأكد من الرقم (مثال: 966574360046)");
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') tBot.sendMessage(chatId, "🚀 بوت HELM MD شغال الآن سحابياً!");
    });
}

// لوحة تحكم تليجرام
tBot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== adminId) return; // حماية للبوت
    const opts = {
        reply_markup: {
            inline_keyboard: [[{ text: '🔗 ربط واتساب جديد', callback_data: 'pair' }]]
        }
    };
    tBot.sendMessage(msg.chat.id, "🛠️ لوحة تحكم يامي الرسمية\nاضغط على الزر للبدء:", opts);
});

tBot.on('callback_query', (q) => {
    if (q.data === 'pair') tBot.sendMessage(q.message.chat.id, "📱 أرسل الرقم الآن مع مفتاح الدولة:");
});

tBot.on('message', (msg) => {
    if (msg.chat.id.toString() === adminId && /^\d+$/.test(msg.text)) {
        startWhatsApp(msg.chat.id, msg.text);
    }
});

console.log("🤖 نظام التحكم السحابي يعمل...");
