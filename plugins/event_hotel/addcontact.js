// addcontact.js

exports.run = {
  usage: ['addcontact', 'delcontact'],
  use: '.addcontact <number> | <name>  •  .delcontact <name>',
  category: 'miscs',
  async: async (m, { client, text, isPrefix, command, Func }) => {
    try {
      const cmd = (command || '').toLowerCase()
      let setting = global.db.setting
      if (!Array.isArray(setting.contacts)) setting.contacts = []

      // =========================
      // ADD CONTACT
      // =========================
      if (cmd === 'addcontact') {
        if (!text || !text.includes('|')) {
          return m.reply(
            `Format:\n${isPrefix}addcontact 628xxxxxxxxxx | Nama Kontak\n\n` +
            `Contoh:\n${isPrefix}addcontact 622222222 | Engineer`
          )
        }

        let [numberPart, namePart] = text.split('|')
        const number = (numberPart || '').replace(/\D+/g, '').trim()
        const name = (namePart || '').trim()

        if (!number || !name) {
          return m.reply(`Nomor atau nama tidak valid.\nGunakan format:\n${isPrefix}addcontact 628xxxxxxxxxx | Nama Kontak`)
        }

        // Cari apakah sudah ada by number atau name
        const byNumber = setting.contacts.find(c => (c.number || '') === number)
        if (byNumber) {
          byNumber.name = name
          return m.reply(`Diperbarui: *${name}* (nomor: ${number})`)
        }

        const idxByName = setting.contacts.findIndex(c => (c.name || '').toLowerCase() === name.toLowerCase())
        if (idxByName !== -1) {
          setting.contacts[idxByName].number = number
          return m.reply(`Diperbarui nomor untuk *${name}* -> ${number}`)
        }

        // Tambahkan baru
        setting.contacts.push({ name, number })

        return m.reply(
          `Berhasil menambahkan kontak:\n` +
          `• Nama  : *${name}*\n` +
          `• Nomor : *${number}*\n\n` +
          `Kontak akan tampil di *View Services* hanya sebagai nama (tanpa nomor).`
        )
      }

      // =========================
      // DELETE CONTACT
      // =========================
      if (cmd === 'delcontact') {
        const name = (text || '').trim()
        if (!name) {
          return m.reply(`Format:\n${isPrefix}delcontact <Nama Kontak>\n\nContoh:\n${isPrefix}delcontact Engineer`)
        }

        const before = setting.contacts.length
        setting.contacts = setting.contacts.filter(c => (c.name || '').toLowerCase() !== name.toLowerCase())

        if (setting.contacts.length === before) {
          return m.reply(`Kontak *${name}* tidak ditemukan.`)
        }

        return m.reply(`Berhasil menghapus kontak: *${name}*`)
      }

      return m.reply(`Gunakan:\n• ${isPrefix}addcontact <number> | <name>\n• ${isPrefix}delcontact <name>`)

    } catch (e) {
      return client.reply(m.chat, Func.jsonFormat(e), m)
    }
  },
  error: false,
  owner: true,
  cache: true,
  location: __filename
}
