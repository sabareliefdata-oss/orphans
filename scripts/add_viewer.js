const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const uri = 'mongodb+srv://sabareliefdata_db_user:4sd1nIgOlqjWiO7s@translation.zsqhe3y.mongodb.net/one_nation?retryWrites=true&w=majority&appName=translation';

async function addViewer() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { dbName: 'one_nation' });

  const salt = await bcrypt.genSalt(10);
  const viewerHash = await bcrypt.hash('ON@View#8264*Access', salt);

  await mongoose.connection.db.collection('users').updateOne(
    { username: 'viewer' },
    {
      $set: {
        id: uuidv4(),
        username: 'viewer',
        password_hash: viewerHash,
        name: 'Viewer / Auditor',
        role: 'viewer',
        created_at: new Date()
      }
    },
    { upsert: true }
  );

  console.log('Viewer user successfully added in MongoDB Atlas!');

  const users = await mongoose.connection.db.collection('users').find().toArray();
  console.log('All Users in DB:');
  for (const u of users) {
    console.log(`- Username: ${u.username} | Role: ${u.role} | Name: ${u.name}`);
  }

  process.exit(0);
}

addViewer().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
