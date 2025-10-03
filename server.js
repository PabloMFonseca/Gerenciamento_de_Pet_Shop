
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'amigo_fiel.db');
const SCHEMA_FILE = path.join(__dirname, 'db.sql');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));



const dbExists = fs.existsSync(DB_FILE);
const db = new sqlite3.Database(DB_FILE, (err) => {
  if(err) return console.error(err);
  console.log('Conectado ao SQLite.');
  if(!dbExists){
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
    db.exec(schema, (e) => {
      if(e) console.error('Erro ao criar schema:', e);
      else console.log('Schema criado com sucesso.');
    });
  }
});



app.post('/api/register', (req, res) => {
  const { dono, pet } = req.body || {};
  if(!dono || !pet){
    return res.status(400).json({ error: 'Dados do dono e pet são obrigatórios.'});
  }


  const requiredDono = ['nome_completo','cpf','email','telefone','endereco'];
  const requiredPet = ['nome_pet','especie','raca','data_nascimento'];
  for(const f of requiredDono){
    if(!dono[f]) return res.status(400).json({ error: 'Campo dono.'+f+' obrigatório.'});
  }
  for(const f of requiredPet){
    if(!pet[f]) return res.status(400).json({ error: 'Campo pet.'+f+' obrigatório.'});
  }

  db.serialize(() => {
    db.run(`INSERT INTO dono (nome_completo, cpf, email, telefone, endereco)
            VALUES (?,?,?,?,?)`,
      [dono.nome_completo, dono.cpf, dono.email, dono.telefone, dono.endereco],
      function(err){
        if(err){
          console.error(err);
          return res.status(500).json({ error: 'Erro ao inserir dono.'});
        }
        const ownerId = this.lastID;
        db.run(`INSERT INTO pet (id_dono, nome_pet, especie, raca, data_nascimento, observacoes)
                VALUES (?,?,?,?,?,?)`,
          [ownerId, pet.nome_pet, pet.especie, pet.raca, pet.data_nascimento, pet.observacoes || null],
          function(err2){
            if(err2){
              console.error(err2);
              return res.status(500).json({ error: 'Erro ao inserir pet.'});
            }
            return res.json({ success: true, ownerId, petId: this.lastID });
          });
      });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta', PORT));
