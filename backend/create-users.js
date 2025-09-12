const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('./database.db');

async function createInitialUsers() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash('caad110207', 10);

    // Inserir usuários iniciais
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (email, password, role)
      VALUES (?, ?, ?)
    `);

    // Usuário Admin
    insertUser.run('admin@caad.com', hashedPassword, 'admin');
    console.log('✅ Usuário admin criado: admin@caad.com');

    // Usuário Visualizador
    insertUser.run('visual@caad.com', hashedPassword, 'viewer');
    console.log('✅ Usuário viewer criado: visual@caad.com');

    console.log('\n🎉 Usuários iniciais criados com sucesso!');
    console.log('📧 Emails: admin@caad.com e visual@caad.com');
    console.log('🔑 Senha: caad110207');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    db.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createInitialUsers();
}

module.exports = createInitialUsers;