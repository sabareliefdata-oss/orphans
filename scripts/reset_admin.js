const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://sabareliefdata_db_user:4sd1nIgOlqjWiO7s@translation.zsqhe3y.mongodb.net/one_nation?retryWrites=true&w=majority&appName=translation';

const adminPassword = 'ON@Admin#9482$Yemen';
const reviewerPassword = 'ON@Review#7315*Scripts';

async function resetPasswords() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { dbName: 'one_nation' });

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPassword, salt);
  const reviewerHash = await bcrypt.hash(reviewerPassword, salt);

  await mongoose.connection.db.collection('users').updateOne(
    { role: 'admin' },
    { $set: { password_hash: adminHash } }
  );

  await mongoose.connection.db.collection('users').updateOne(
    { role: 'reviewer' },
    { $set: { password_hash: reviewerHash } }
  );

  console.log('Updated admin password hash successfully!');

  // Verify
  const admin = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
  const isMatch = await bcrypt.compare(adminPassword, admin.password_hash);
  console.log('Verification: bcrypt.compare for admin with ON@Admin#9482$Yemen =', isMatch);

  process.exit(0);
}

resetPasswords().catch(err => {
  console.error('Error resetting passwords:', err);
  process.exit(1);
});
