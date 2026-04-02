const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const TelegramBot = require('node-telegram-bot-api');
const pino = require('pino');
const express = require('express');
require('./settings');

// --- إرضاء سيرفر ريندر (البورت الوهمي) ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Yami Bot is Online! 🛡️'));
app.listen(port, () => console.log(`✅ السيرفر الوهمي يعمل على منفذ: ${port}`));

// --- إعدادات التليجرام ---
const token = '8129323337:AAEXCXQgOZ89gWm3GYmqkPlI8ZSyFC8AzT0';
const adminId = '7061804635';
const tBot = new TelegramBot(token, { polling: true });

// حل مشكلة التعارض (Conflict 409) تلقائياً
tBot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
        console.log("🔄 تعارض نسخ.. جاري إعادة التشغيل النظيف...");
        process.exit(1);
    }
});

async function startWhatsApp(chatId, phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState('yami_session');
    
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        // هوية آيفون لتخطي الرفض
        browser: ["Safari", "iPhone", "17.4.1"],
        syncFullHistory: false
    });

    if (!sock.authState.creds.registered) {
        try {
            tBot.sendMessage(chatId, "⏳ جاري المناورة السحابية لطلب الكود من واتساب...");
            setTimeout(async () => {
                const code = await sock.requestPairingCode(phoneNumber.trim());
                tBot.sendMessage(chatId, `✅ تم كسر الحماية بنجاح!\n\n🔥 الكود الخاص بك: [ ${code} ]\n\nأدخله الآن في واتساب (الأجهزة المرتبطة).`);
            }, 6000);
        } catch (e) {
            tBot.sendMessage(chatId, "❌ واتساب رفض الطلب حالياً. يرجى الانتظار 15 دقيقة.");
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            tBot.sendMessage(chatId, "🚀 مبروك يا يامي! البوت متصل الآن وشغال سحابياً.");
        }
        if (connection === 'close') {
            const reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startWhatsApp(chatId, phoneNumber);
        }
    });
}

// --- لوحة تحكم تليجرام ---
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
    tBot.sendMessage(msg.chat.id, "🛡️ نظام يامي المتطور V3.0\nالحالة: مستقر وجاهز للربط.", opts);
});

tBot.on('callback_query', (q) => {
    if (q.data === 'pair') tBot.sendMessage(q.message.chat.id, "📱 أرسل الرقم مع مفتاح الدولة (مثال: 4915511812468):");
    if (q.data === 'restart') {
        tBot.sendMessage(q.message.chat.id, "⚙️ جاري إعادة التشغيل النظيف لسيرفر ريندر...");
        process.exit(1);
    }
});

tBot.on('message', (msg) => {
    if (msg.chat.id.toString() === adminId && /^\d+$/.test(msg.text)) {
        startWhatsApp(msg.chat.id, msg.text);
    }
});

console.log("🤖 نظام يامي V3.0 قيد التشغيل...");

