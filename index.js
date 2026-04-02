const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');
require('./settings'); // استدعاء إعدادات المطور يامي

const token = '8129323337:AAEXCXQgOZ89gWm3GYmqkPlI8ZSyFC8AzT0';
const adminId = '7061804635';
const tBot = new TelegramBot(token, { polling: true });

// حل مشكلة التعارض (Conflict 409) تلقائياً
tBot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
        console.log("🔄 تعارض في النسخ.. جاري إعادة التشغيل النظيف...");
        process.exit(1); // السيرفر سيعيد تشغيل نفسه بنسخة واحدة
    }
});

async function startWhatsApp(chatId, phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState('yami_session');
    
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        // تغيير الهوية إلى آيفون لتخطي الرفض النهائي
        browser: ["Safari", "iPhone", "17.4.1"],
        syncFullHistory: false
    });

    if (!sock.authState.creds.registered) {
        try {
            tBot.sendMessage(chatId, "⏳ جاري المناورة السحابية لطلب الكود...");
            // إضافة تأخير بسيط (Delay) لتجنب كشف البوت
            setTimeout(async () => {
                const code = await sock.requestPairingCode(phoneNumber.trim());
                tBot.sendMessage(chatId, `✅ تم كسر الحماية!\n\n🔥 الكود: [ ${code} ]\n\nأدخله الآن في الواتساب (الأجهزة المرتبطة).`);
            }, 5000);
        } catch (e) {
            tBot.sendMessage(chatId, "❌ واتساب رفض الطلب. انتظر 15 دقيقة ثم حاول مجدداً.");
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') tBot.sendMessage(chatId, "🚀 HELM • MD متصل الآن بحقوق يامي!");
        if (connection === 'close') {
            const reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startWhatsApp(chatId, phoneNumber);
        }
    });
}

// لوحة التحكم المحدثة
tBot.onText(/\/start/, (msg) => {
    if (msg.chat.id.toString() !== adminId) return;
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔗 ربط واتساب (هوية آيفون)', callback_data: 'pair' }],
                [{ text: '🔄 إعادة تشغيل السيرفر', callback_data: 'restart' }]
            ]
        }
    };
    tBot.sendMessage(msg.chat.id, "🛡️ مرحباً بك في نظام يامي المتطور V2.0", opts);
});

tBot.on('callback_query', (q) => {
    if (q.data === 'pair') tBot.sendMessage(q.message.chat.id, "📱 أرسل الرقم الآن:");
    if (q.data === 'restart') {
        tBot.sendMessage(q.message.chat.id, "⚙️ جاري إعادة التشغيل النظيف...");
        process.exit(1);
    }
});

tBot.on('message', (msg) => {
    if (msg.chat.id.toString() === adminId && /^\d+$/.test(msg.text)) {
        startWhatsApp(msg.chat.id, msg.text);
    }
});

console.log("🤖 نظام يامي V2.0 يعمل...");
                      
