// addmsg.js
// .addmsg <nama> | <pesan>
// .delmsg <nama>
// .listmsg     (opsional untuk cek isi)

exports.run = {
  usage: ['addmsg', 'delmsg', 'listmsg'],
  use: '.addmsg <nama> | <pesan>  •  .delmsg <nama>  •  .listmsg',
  category: 'miscs',
  async: async (m, { client, text, isPrefix, command, Func }) => {
    try {
      // Inisialisasi storage
      global.db = global.db || {}
      global.db.setting = global.db.setting || {}
      if (!Array.isArray(global.db.setting.message)) global.db.setting.message = []

      const cmd = (command || '').toLowerCase()

      if (cmd === 'addmsg') {
        if (!text || !text.includes('|')) {
          return m.reply(
            `Format:\n` +
            `${isPrefix}addmsg <nama> | <pesan>\n\n` +
            `Contoh:\n${isPrefix}addmsg Website Hotel | Nih website guech r enk a m o e . m y . i d`
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
          `Item ini akan tampil di *View Services* sebagai nama (tanpa nomor) dan saat ditekan akan mengirim teks.`
        )
      }

      if (cmd === 'delmsg') {
        const name = (text || '').trim()
        if (!name) return m.reply(`Format:\n${isPrefix}delmsg <nama>\nContoh:\n${isPrefix}delmsg Website Hotel`)

        const before = global.db.setting.message.length
        global.db.setting.message = global.db.setting.message.filter(
          x => (x.name || '').toLowerCase() !== name.toLowerCase()
        )
        if (global.db.setting.message.length === before) {
          return m.reply(`Pesan *${name}* tidak ditemukan.`)
        }
        return m.reply(`Berhasil menghapus pesan: *${name}*`)
      }

      if (cmd === 'listmsg') {
        if (!global.db.setting.message.length) return m.reply('Belum ada pesan yang tersimpan.')
        const lines = global.db.setting.message.map((x, i) => `• ${i+1}. *${x.name}*`)
        return m.reply(`Daftar pesan tersimpan:\n${lines.join('\n')}\n\nGunakan *${isPrefix}delmsg <nama>* untuk menghapus.`)
      }

      return m.reply(
        `Gunakan:\n` +
        `• ${isPrefix}addmsg <nama> | <pesan>\n` +
        `• ${isPrefix}delmsg <nama>\n` +
        `• ${isPrefix}listmsg`
      )
    } catch (e) {
      return client.reply(m.chat, Func.jsonFormat(e), m)
    }
  },
  error: false,
  owner: true,
  cache: true,
  location: __filename
}
