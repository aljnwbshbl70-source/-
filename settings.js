const fs = require('fs')

// --- إعدادات المطور يامي الرسمية ---
global.owner = ['966574360046'] // رقمك الأساسي
global.ownername = 'Yami Official' // اسمك كمطور
global.botname = 'HELM • MD' // اسم البوت
global.premium = ['966574360046'] // أرقام البريميوم

// --- إعدادات الحقوق (الزرف والفنش) ---
global.packname = 'Created By Yami'
global.author = 'Yami-VIP-Bot'
global.sessionName = 'session'

// --- رسائل النظام ---
global.mess = {
    success: '✅ تم التنفيذ بنجاح يا مبرمج يامي',
    admin: '⚠️ هذا الأمر خاص بالمشرفين فقط!',
    botAdmin: '⚠️ لازم ترفع البوت مشرف أولاً!',
    owner: '⚠️ هذا الأمر خاص بالمطور يامي فقط',
    group: '⚠️ الميزة هذه تشتغل في المجموعات بس!',
    private: '⚠️ الميزة هذه تشتغل في الخاص بس!',
    wait: '⏳ جاري المعالجة سحابياً...',
    endLimit: 'انتهى حدك اليومي، انتظر 12 ساعة.'
}

// تحديث تلقائي للملف لو عدلت عليه
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`Update ${__filename}`)
	delete require.cache[file]
	require(file)
})

console.log("✅ إعدادات المطور يامي محملة سحابياً 24 ساعة")
             
