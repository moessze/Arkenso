const toArray = (v) => Array.isArray(v) ? v : (v == null ? [] : String(v).split(',').map(s => s.trim()).filter(Boolean))
const digits = (s) => String(s || '').replace(/\D+/g, '')

exports.run = {
  usage: ['addcontact', 'delcontact'],
  use: '.addcontact <number> | <name>  •  .delcontact <name>',
  category: 'miscs',
  async: async (m, { client, text, isPrefix, command, Func, env }) => {
    try {

      global.db = global.db || {}
      if (!Array.isArray(global.db.contacts)) global.db.contacts = []

      const cmd = (command || '').toLowerCase()

      if (cmd === 'addcontact') {
        if (!text || !text.includes('|')) {
          return m.reply(
            `Format:\n${isPrefix}addcontact 628xxxxxxxxxx | Nama Kontak\n\n` +
            `Contoh:\n${isPrefix}addcontact 622222222 | Engineer`
          )
        }
        let [numberPart, namePart] = text.split('|')
        const number = digits(numberPart)
        const name = (namePart || '').trim()
        if (!number || !name) {
          return m.reply(`Nomor atau nama tidak valid.\nGunakan format:\n${isPrefix}addcontact 628xxxxxxxxxx | Nama Kontak`)
        }

        // nomor di update dari sini yh
        const byNumber = global.db.contacts.find(c => (c.number || '') === number)
        if (byNumber) {
          byNumber.name = name
          return m.reply(`Diperbarui: *${name}* (nomor: ${number})`)
        }

        // nama di update disini
        const idxByName = global.db.contacts.findIndex(c => (c.name || '').toLowerCase() === name.toLowerCase())
        if (idxByName !== -1) {
          global.db.contacts[idxByName].number = number
          return m.reply(`Diperbarui nomor untuk *${name}* -> ${number}`)
        }

        // push baru → global.db.contacts
        global.db.contacts.push({ name, number })

        return m.reply(
          `Berhasil menambahkan kontak:\n` +
          `• Nama  : *${name}*\n` +
          `• Nomor : *${number}*\n\n` +
          `Kontak akan muncul di *View Services* (judul hanya nama) dan saat ditekan akan mengirim kontak.`
        )
      }

      if (cmd === 'delcontact') {
        const name = (text || '').trim()
        if (!name) {
          return m.reply(`Format:\n${isPrefix}delcontact <Nama Kontak>\n\nContoh:\n${isPrefix}delcontact Engineer`)
        }
        const before = global.db.contacts.length
        global.db.contacts = global.db.contacts.filter(c => (c.name || '').toLowerCase() !== name.toLowerCase())
        if (global.db.contacts.length === before) {
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
