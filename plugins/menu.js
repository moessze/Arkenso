// hotelmenu.js
const fs = require('fs')

exports.run = {
  usage: ['hotel', 'menu', 'services'],
  async: async (m, {
    client,
    text,
    isPrefix,
    command,
    setting,
    users,
    Func,
    env,
    plugins
  }) => {
    try {
      // Init storage (jangan menimpa data lama)
      global.db = global.db || {}
      global.db.contacts = Array.isArray(global.db.contacts) ? global.db.contacts : []
      global.db.setting = global.db.setting || {}
      global.db.setting.message = Array.isArray(global.db.setting.message) ? global.db.setting.message : []

      // ===== Build messageHeader (back-compatible) =====
      const local_size = fs.existsSync('./' + env.database + '.json')
        ? await Func.getSize(fs.statSync('./' + env.database + '.json').size)
        : ''
      const library = JSON.parse(require('fs').readFileSync('./package.json', 'utf-8'))
      const bakedVersion = (library.dependencies.bails
        ? library.dependencies.bails
        : (library.dependencies['@adiwajshing/baileys']
          ? '@adiwajshing/baileys'
          : library.dependencies.baileys)
      )?.replace('^', '').replace('~', '')
      const moduleName = 'HotelModule'
      const versionName = bakedVersion || 'latest'

      const template =
        (global.db.msg && String(global.db.msg)) ||
        (global.db.setting.msg && String(global.db.setting.msg)) ||
        (setting && setting.msg) ||
        'Hi +tag +greeting'

      const messageHeader = template
        .replace('+tag', `@${m.sender.replace(/@.+/g, '')}`)
        .replace('+name', m.pushName)
        .replace('+greeting', Func.greeting())
        .replace('+db', (process.env.DATABASE_URL
          ? (/mongo/.test(process.env.DATABASE_URL) ? 'Mongo'
            : /postgre/.test(process.env.DATABASE_URL) ? 'Postgres' : 'N/A')
          : `Local (${local_size})`))
        .replace('+module', moduleName)
        .replace('+version', versionName)

      // Cover untuk menu utama saja (tidak dipakai di reply teks)
      const coverMedia = Func.isUrl(setting.cover)
        ? setting.cover
        : (setting.cover ? Buffer.from(setting.cover, 'base64') : null)

      // ===== Konten teks untuk Reception (View Services) =====
      const receptionText =
`📞 *Reception Services*

Available 24/7 for your needs:
- Check-in/out
- Room changes
- Tourist information
- Taxi services
- Emergency assistance

Dial '0' from your room phone.`

      const q = (text || '').trim().toLowerCase()

      // Quick Reply → kirim kontak Reception (tetap sama)
      if (q === 'reception_contact') {
        return client.sendContact(m.chat, [{
          name: 'Reception',
          number: '6285701878915',
          about: 'Hotel Front Desk'
        }], m, {
          org: 'Grand Luxury Hotel',
          website: 'https://api.neoxr.my.id',
          email: 'contact@neoxr.my.id'
        })
      }

      // View Services → Reception Services => kirim TEKS via chat reply (tanpa gambar/link)
      if (q === 'reception') {
        const body = Func.Styles(receptionText)
        return client.reply(m.chat, body, m) // <= reply sederhana
      }

      // View Services → kontak dinamis (tetap kirim kontak)
      if (q.startsWith('contact:')) {
        const number = q.replace('contact:', '').replace(/\D+/g, '')
        const found = global.db.contacts.find(x => (x.number || '') === number)
        if (!found) return m.reply(`Kontak tidak ditemukan untuk nomor: ${number}`)
        return client.sendContact(m.chat, [{
          name: found.name || 'Contact',
          number: found.number,
          about: 'Hotel Contact'
        }], m, {
          org: 'Grand Luxury Hotel',
          website: 'https://api.neoxr.my.id',
          email: 'contact@neoxr.my.id'
        })
      }

      // View Services → pesan dinamis (kirim TEKS via chat reply, tanpa gambar/link)
      if (q.startsWith('messagei:')) {
        const idx = parseInt(q.slice('messagei:'.length), 10)
        if (isNaN(idx) || idx < 0 || idx >= global.db.setting.message.length) {
          return m.reply(`Pesan tidak ditemukan.`)
        }
        const item = global.db.setting.message[idx]
        const body = Func.Styles(item.text || '')
        return client.reply(m.chat, body, m) // <= reply sederhana
      }

      // ===== Build menu (IA message): Reception (teks), kontak (kirim contact), pesan (kirim teks)
      const rows = [{
        title: 'Reception Services',
        description: 'Front desk services and assistance',
        id: `${isPrefix}${command} reception` // kirim teks via reply
      }]

      // Kontak → tampil NAMA SAJA
      for (const c of global.db.contacts) {
        if (!c || !c.number) continue
        rows.push({
          title: (c.name || 'Contact').trim(),
          description: 'Send contact',
          id: `${isPrefix}${command} contact:${c.number}` // kirim kontak
        })
      }

      // Pesan → tampil NAMA SAJA
      for (let i = 0; i < global.db.setting.message.length; i++) {
        const item = global.db.setting.message[i]
        rows.push({
          title: (item?.name || 'Message').trim(),
          description: 'View message',
          id: `${isPrefix}${command} messagei:${i}` // kirim teks via reply
        })
      }

      const sections = [{ title: 'Hotel Services Menu', rows }]
      const buttons = [
        {
          // Quick Reply: kirim KONTAK Reception langsung
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'Reception Services',
            id: `${isPrefix}${command} reception_contact`
          })
        },
        {
          // View Services: Reception (teks), daftar kontak (kirim kontak), daftar pesan (kirim teks)
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: 'View Services',
            sections
          })
        }
      ]

      // IA menu utama tetap pakai header; media tetap boleh (tidak diminta dihapus)
      client.sendIAMessage(m.chat, buttons, m, {
        header: 'Grand Luxury Hotel',
        content: `${messageHeader}\n\nPlease select an option below:`,
        footer: global.footer || 'Tap a service for more information',
        media: coverMedia || setting.link || null
      })

    } catch (e) {
      client.reply(m.chat, Func.jsonFormat(e), m)
    }
  },
  error: false,
  cache: true,
  location: __filename
}
