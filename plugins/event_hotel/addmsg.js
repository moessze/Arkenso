const toArray = (v) => Array.isArray(v) ? v : (v == null ? [] : String(v).split(',').map(s => s.trim()).filter(Boolean))
const digits = (s) => String(s || '').replace(/\D+/g, '')

exports.run = {
  usage: ['addmsg', 'delmsg'],
  use: '.addmsg <nama> | <pesan>  •  .delmsg <nama>',
  category: 'miscs',
  async: async (m, { client, text, isPrefix, command, Func, env }) => {
    try {
      // init db
      global.db = global.db || {}
      global.db.setting = global.db.setting || {}
      if (!Array.isArray(global.db.setting.message)) global.db.setting.message = []

      const cmd = (command || '').toLowerCase()

      // ========== ADD ==========
      if (cmd === 'addmsg') {
        if (!text || !text.includes('|')) {
          return m.reply(
            `Format:\n${isPrefix}addmsg <nama> | <pesan>\n\n` +
            `Contoh:\n${isPrefix}addmsg Website Hotel | Nih website guech renkamoe.my.id`
          )
        }
        let [namePart, msgPart] = text.split('|')
        const name = (namePart || '').trim()
        const msg  = (msgPart  || '').trim()
        if (!name || !msg) {
          return m.reply(`Nama atau pesan tidak valid.\nGunakan format:\n${isPrefix}addmsg <nama> | <pesan>`)
        }

        const idx = global.db.setting.message.findIndex(x => (x.name || '').toLowerCase() === name.toLowerCase())
        if (idx !== -1) {
          global.db.setting.message[idx].text = msg
          return m.reply(`Pesan untuk *${name}* berhasil diperbarui.`)
        }

        global.db.setting.message.push({ name, text: msg })
        return m.reply(
          `Berhasil menambahkan pesan:\n` +
          `• Nama  : *${name}*\n` +
          `• Pesan : ${msg.length > 120 ? (msg.slice(0, 120) + '...') : msg}\n\n` +
          `Item akan tampil di *View Services* (judul hanya nama) dan saat ditekan akan mengirim teks biasa.`
        )
      }

      // ========== DELETE ==========
      if (cmd === 'delmsg') {
        const name = (text || '').trim()
        if (!name) {
          return m.reply(`Format:\n${isPrefix}delmsg <Nama>\n\nContoh:\n${isPrefix}delmsg Website Hotel`)
        }
        const before = global.db.setting.message.length
        global.db.setting.message = global.db.setting.message.filter(
          x => (x.name || '').toLowerCase() !== name.toLowerCase()
        )
        if (global.db.setting.message.length === before) {
          return m.reply(`Pesan *${name}* tidak ditemukan.`)
        }
        return m.reply(`Berhasil menghapus pesan: *${name}*`)
      }

      // fallback
      return m.reply(`Gunakan:\n• ${isPrefix}addmsg <nama> | <pesan>\n• ${isPrefix}delmsg <nama>`)

    } catch (e) {
      return client.reply(m.chat, Func.jsonFormat(e), m)
    }
  },
  error: false,
  cache: true,
  owner: true,
  location: __filename
}
