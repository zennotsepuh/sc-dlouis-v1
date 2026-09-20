// =================================================
// BOT WA D-LOUIS V.1 - By Dlouis - Zenxy.sexx
// Full fitur: menu foto/video + audio reply
// =================================================

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { config, timezone } from './config.js';

// ==========================================
// LOGGER
// ==========================================
const logger = pino({ level: 'silent' });

// ==========================================
// DATA MENU (PERSIS KAYAK PERMINTAAN LU)
// ==========================================
const MENU_DATA = {
  GAME: [
    'asahotak', 'buylimit', 'caklontong', 'dare', 'family100', 'hint', 'math',
    'nyerah', 'redeem', 'siapakahaku', 'sloth', 'suit', 'susunkalimat',
    'susunkata', 'susunlirik', 'tebakbendera', 'tebakbom', 'tebakkata',
    'tekateki', 'tfbalance', 'tictactoe', 'truth', 'werewolf2'
  ],
  GENERAL: [
    'changelog', 'everyone', 'infobot', 'menu', 'owner', 'ping', 'resend',
    'runtime', 'sender', 'version'
  ],
  GROUP: [
    'absen', 'add', 'addwhitelist', 'afk', 'antibot', 'antidelete',
    'antigroupsw', 'antikudeta', 'antilink', 'antilinkchannel', 'antilinknokick',
    'antilinkuniversal', 'antiluar', 'antimentionsw', 'antisticker',
    'antiviewonce', 'antiwame', 'antiwamenokick', 'cekabsen', 'cekidgroup',
    'cekwarn', 'delete', 'deleteabsen', 'delwarn', 'delwhitelist', 'demote',
    'demotedetector', 'descgc', 'groupadmin', 'groupinfo', 'groupsetting',
    'hidetag', 'kick', 'kickme', 'leavegc', 'left', 'levelling', 'linkgc',
    'listwarn', 'listwhitelist', 'mulaiabsen', 'mute', 'pinmsg', 'promote',
    'promotedetector', 'refreshgroup', 'reqjoin', 'resetwarn', 'revokelink',
    'setdescgc', 'setnamegc', 'setppgc', 'setppgcpanjang', 'setwarn',
    'tagall', 'totag', 'unpinmsg', 'vote', 'warn', 'welcome'
  ],
  INFO: [
    'balance', 'cekchannel', 'cekpremium', 'infocovid', 'infogempa',
    'infounsur', 'kodebahasa', 'limit', 'listban', 'listblock', 'listgroup',
    'listpremium', 'profile', 'report', 'status', 'topglobal', 'toplocal'
  ],
  OWNER: [
    'addbalance', 'addlevel', 'addlimit', 'addpremiumgroup', 'addrespon',
    'addxp', 'anticall', 'anticallnoblock', 'antideletepc', 'autonexara',
    'autoread', 'autotype', 'ban', 'bccancel', 'bcconfirm', 'bcgchidetag',
    'bcgroup', 'bchidetag', 'bcpc', 'bcstat', 'block', 'blockpc', 'broadcast',
    'buttonmode', 'buttontojson', 'callloop', 'callplay', 'callqueue',
    'callskip', 'callstop', 'cekgroupcron', 'cekgroupsewa', 'chatgroup',
    'claimwibusoftredeem', 'cleangroupcron', 'cleangroupsewa', 'clearchat',
    'copythumbnail', 'createbutton', 'createfullbutton', 'createlist',
    'createredeem', 'createtemplate', 'createthumbnail', 'delbalance',
    'deleteredeem', 'dellevel', 'dellimit', 'delpremiumgroup', 'delrespon',
    'delxp', 'globalgamemode', 'golink', 'grabcontact', 'grouponlypremium',
    'inforedeem', 'inviteme', 'join', 'leaveall', 'leavegcbyid', 'leavenosewa',
    'levellingpc', 'listcommand', 'listgroupnosewa', 'listpremiumgroup',
    'listredeem', 'listrespon', 'mutebc', 'mutebyid', 'mycontacts', 'onlygroup',
    'onlyindo', 'onlyprem', 'pconlyprem', 'premiumgroup', 'promoteme',
    'public', 'publicbyid', 'queue', 'rawmessage', 'react', 'reactchannel',
    'refreshgroupbyid', 'resetanonymous', 'resetbalance', 'resetlevel',
    'resetlimit', 'resetpremium', 'resetresponse', 'resetxp', 'searchmessage',
    'self', 'selfbyid', 'setbio', 'setcommand', 'setdefaultweltype', 'setname',
    'setopenaikey', 'setpp', 'setpppanjang', 'setwrsuit', 'setwrttt',
    'testbutton', 'unban', 'unblock', 'unreact', 'unreactchannel', 'upres'
  ],
  RANDOM: [
    'alay', 'apakah', 'cekkhodam', 'faktaunik', 'jadian', 'kapankah',
    'katabijak', 'pantun', 'puisi', 'randomanime', 'randomnumber',
    'randomtag', 'rate', 'siapakah'
  ],
  SEARCH: [
    'alkitab', 'alquranaudio', 'artinama', 'brainly', 'ipchecker',
    'jadwalshalat', 'lirik'
  ],
  STICKER: [
    'sticker', 'stickercircle', 'stickerwm', 'takesticker', 'toimg'
  ],
  TOOLS: [
    'cekplatform', 'dbase64', 'dec', 'dhex', 'ebase64', 'ehex', 'enc',
    'fakereply', 'halah', 'hdsw', 'heleh', 'hilih', 'holoh', 'huluh',
    'kirim', 'poll', 'qrcode', 'readmore', 'readviewonce', 'shortlink',
    'swhd', 'toquickvideo', 'toviewonce', 'translate'
  ]
};

// ==========================================
// HELPER
// ==========================================
const now = () => moment().tz(timezone).format('DD/MM/YYYY HH:mm:ss');
const nowShort = () => moment().tz(timezone).format('DD/MM/YYYY HH:mm');
const isOwner = (nomor) => config.ownerNumbers.some(o => nomor.includes(o.replace(/\D/g, '')));

const runtime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

const fileExists = (p) => p && fs.existsSync(p);

// ==========================================
// GENERATE MENU TEXT
// ==========================================
const generateMenuText = (pushName, senderNumber, isOwnerUser = false) => {
  let text = `${config.menuHeader}\n\n`;
  
  // Info user
  text += `╭━━━━━━━━━━━━━━━━━━━━╮\n`;
  text += `│ 👤 *Nama:* ${pushName}\n`;
  text += `│ 📱 *Nomor:* ${senderNumber}\n`;
  text += `│ 💎 *Role:* ${isOwnerUser ? '👑 Owner' : 'User'}\n`;
  text += `│ ⏰ *Waktu:* ${nowShort()}\n`;
  text += `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`;

  // Loop semua kategori
  for (const [category, commands] of Object.entries(MENU_DATA)) {
    text += `╭╾──────⪻𒆜${category}𒆜⪼──────╾╮\n`;
    for (const cmd of commands) {
      text += `┃ ${config.prefix}${cmd}\n`;
    }
    text += `╰╾──────────────────────╾╯\n`;
  }
  
  // Footer
  text += `\n${config.footer}`;
  
  return text;
};

// ==========================================
// BOT START
// ==========================================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: [config.botName, 'Chrome', '1.0.0'],
    getMessage: async () => ({ conversation: 'D-LOUIS Bot Active' })
  });

  // ==========================================
  // CONNECTION
  // ==========================================
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('\n📱 SCAN QR CODE DI BAWAH INI:\n'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;
      console.log(chalk.red('❌ Koneksi terputus!'));
      if (shouldReconnect) {
        console.log(chalk.yellow('🔄 Reconnect...'));
        startBot();
      }
    } else if (connection === 'open') {
      console.log(chalk.green('\n✅ BOT D-LOUIS V.1 BERHASIL TERHUBUNG!'));
      console.log(chalk.cyan(`📛 Bot: ${config.botName}`));
      console.log(chalk.cyan(`👑 Owner: ${config.ownerNumbers.join(', ')}`));
      console.log(chalk.cyan(`⏰ Waktu: ${now()}\n`));
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ==========================================
  // MESSAGE HANDLER
  // ==========================================
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0].split(':')[0];
    const isGroup = from.endsWith('@g.us');
    const pushName = msg.pushName || 'Kak';
    const isOwnerUser = isOwner(senderNumber);

    // Ambil teks
    const text = msg.message.conversation
      || msg.message.extendedTextMessage?.text
      || msg.message.imageMessage?.caption
      || msg.message.videoMessage?.caption
      || '';

    if (!text) return;

    const isCommand = text.startsWith(config.prefix);
    const isReplyToBot = msg.message.extendedTextMessage?.contextInfo?.participant === sock.user?.id;
    
    console.log(chalk.gray(`[${now()}] ${pushName} (${senderNumber}) → ${text.slice(0, 50)}`));

    // ==========================================
    // AUTO REPLY AUDIO (SETIAP PESAN)
    // ==========================================
    if (config.enableAudioReply && isReplyToBot && !isCommand) {
      if (fileExists(config.media.replyAudio)) {
        try {
          await sock.sendMessage(from, {
            audio: fs.readFileSync(config.media.replyAudio),
            mimetype: 'audio/mp4',
            pttv: false
          }, { quoted: msg });
          return;
        } catch (e) {
          console.log(chalk.red('Gagal kirim audio:'), e.message);
        }
      }
    }

    if (!isCommand) return;

    const args = text.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const reply = (teks) => sock.sendMessage(from, { text: teks }, { quoted: msg });

    // ==========================================
    // .menu — KIRIM FOTO/VIDEO + AUDIO
    // ==========================================
    if (command === 'menu' || command === 'help' || command === 'start') {
      
      const menuText = generateMenuText(pushName, senderNumber, isOwnerUser);
      
      // Kirim menu sebagai media + caption
      try {
        // Pilih video atau image
        const useVideo = config.enableVideoMenu && fileExists(config.media.menuVideo);
        const useImage = !useVideo && config.enableImageMenu && fileExists(config.media.menuImage);
        
        if (useVideo) {
          // Kirim video
          await sock.sendMessage(from, {
            video: fs.readFileSync(config.media.menuVideo),
            caption: menuText,
            gifPlayback: false,
            mimetype: 'video/mp4'
          }, { quoted: msg });
        } else if (useImage) {
          // Kirim foto
          await sock.sendMessage(from, {
            image: fs.readFileSync(config.media.menuImage),
            caption: menuText,
            mimetype: 'image/jpeg'
          }, { quoted: msg });
        } else {
          // Kalo gak ada media, kirim text aja
          await reply(menuText);
        }

        // Kirim audio setelah menu (kalo ada)
        if (fileExists(config.media.menuAudio)) {
          await sock.sendMessage(from, {
            audio: fs.readFileSync(config.media.menuAudio),
            mimetype: 'audio/mp4',
            pttv: false
          }, { quoted: msg });
        }

      } catch (e) {
        console.log(chalk.red('❌ Error menu:'), e.message);
        // Fallback ke text
        await reply(menuText);
      }
    }

    // ==========================================
    // .ping
    // ==========================================
    if (command === 'ping') {
      const start = Date.now();
      const latency = Date.now() - start;
      reply(`🏓 *PONG!*\n\n⚡ Speed: ${latency}ms\n⏰ Time: ${nowShort()}\n🤖 Bot: ${config.botName}`);
    }

    // ==========================================
    // .runtime
    // ==========================================
    if (command === 'runtime') {
      const uptime = process.uptime();
      reply(`⏱️ *RUNTIME BOT*\n\n🤖 Bot: ${config.botName}\n⏰ Aktif: ${runtime(uptime)}\n📅 Sekarang: ${nowShort()}`);
    }

    // ==========================================
    // .owner
    // ==========================================
    if (command === 'owner') {
      const ownerList = config.ownerNumbers.map(o => `📞 wa.me/${o}`).join('\n');
      reply(`👑 *OWNER ${config.botName}*\n\n${ownerList}\n\n_Kontak kalo ada masalah_`);
    }

    // ==========================================
    // .infobot
    // ==========================================
    if (command === 'infobot') {
      const uptime = process.uptime();
      const infoText = `
╭━━━「 *INFO BOT* 」━━━╮
│ 🤖 Nama: ${config.botName}
│ 📛 Owner: ${config.ownerName}
│ 📱 Prefix: ${config.prefix}
│ ⏰ Runtime: ${runtime(uptime)}
│ 💾 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
│ 🖥️ Platform: ${process.platform}
│ 📅 Waktu: ${now()}
╰━━━━━━━━━━━━━━━━━━━━╯

_Powered by DanzModss_
      `.trim();
      reply(infoText);
    }

    // ==========================================
    // .sender
    // ==========================================
    if (command === 'sender') {
      reply(`📱 *PENGIRIM*\n\n👤 Nama: ${pushName}\n📞 Nomor: ${senderNumber}\n💎 Role: ${isOwnerUser ? '👑 Owner' : 'User'}\n📊 Chat: ${isGroup ? 'Grup' : 'Private'}`);
    }

    // ==========================================
    // .version
    // ==========================================
    if (command === 'version') {
      reply(`📦 *VERSION INFO*\n\n🤖 Bot: ${config.botName}\n🔢 Version: V.1\n📅 Build: ${nowShort()}\n⚡ Engine: Baileys v6.7`);
    }

    // ==========================================
    // .changelog
    // ==========================================
    if (command === 'changelog') {
      reply(`📝 *CHANGELOG*\n\n*V.1 (Latest)*\n✅ Fitur menu foto/video\n✅ Audio reply auto\n✅ Full command list\n\n_© By D - Louis - Zenxy.sexx_`);
    }

    // ==========================================
    // .everyone / .tagall
    // ==========================================
    if ((command === 'everyone' || command === 'tagall') && isGroup) {
      if (!isOwnerUser) return reply('❌ *Owner only!*');
      try {
        const groupMeta = await sock.groupMetadata(from);
        const mentions = groupMeta.participants.map(p => p.id);
        let tagText = `📢 *TAG ALL*\n\n${args.join(' ') || 'Halo semua!'}\n\n`;
        for (const m of mentions) {
          tagText += `@${m.split('@')[0]}\n`;
        }
        await sock.sendMessage(from, { text: tagText, mentions }, { quoted: msg });
      } catch (e) {
        reply('❌ Gagal tag all');
      }
    }

    // ==========================================
    // .hidetag
    // ==========================================
    if (command === 'hidetag' && isGroup) {
      if (!isOwnerUser) return reply('❌ *Owner only!*');
      try {
        const groupMeta = await sock.groupMetadata(from);
        const mentions = groupMeta.participants.map(p => p.id);
        await sock.sendMessage(from, {
          text: args.join(' ') || '👋 Halo semua!',
          mentions
        });
      } catch (e) {
        reply('❌ Gagal');
      }
    }

    // ==========================================
    // .sticker (basic)
    // ==========================================
    if (command === 'sticker' || command === 's') {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      const targetMsg = quoted || msg.message;
      const imgMsg = targetMsg?.imageMessage || targetMsg?.videoMessage;
      
      if (!imgMsg) return reply(`❌ Reply foto/video dengan caption ${config.prefix}sticker`);
      
      reply('⏳ *Membuat sticker...* (fitur butuh setup ffmpeg)');
    }

    // ==========================================
    // .totag
    // ==========================================
    if (command === 'totag') {
      reply('📌 *To Tag:* Kirim command ke semua member (fitur perlu config tambahan)');
    }

    // ==========================================
    // COMMAND GAK DIKENAL
    // ==========================================
    // Cek apakah command ada di menu
    const allCommands = Object.values(MENU_DATA).flat();
    if (allCommands.includes(command)) {
      // Command ada di menu tapi belum diimplementasi
      reply(`⚙️ *Command ${config.prefix}${command}* masih dalam pengembangan bos!\n\n_Kirim ke owner buat minta fitur ini._`);
    }

  });
}

// ==========================================
// RUN BOT
// ==========================================
console.log(chalk.cyan(`
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│   🤖 ${config.botName}    🤖
│     © Zenxy.sexx V5.0
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`));

startBot().catch(err => console.log(chalk.red('❌ Error: ', err)));

process.on('uncaughtException', (err) => {
  console.log(chalk.red('⚠️ Uncaught:'), err.message);
});
process.on('unhandledRejection', (err) => {
  console.log(chalk.red('⚠️ Unhandled:'), err);
});
