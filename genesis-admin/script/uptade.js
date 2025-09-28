const { MongoClient } = require('mongodb');

async function fixScoreIndex() {
  const uri = 'mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority'; // Update if using Atlas or custom URI
  const dbName = 'genesis2025';

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const scores = db.collection('scores');

    // 🔥 Drop the old index
    try {
      await scores.dropIndex('team_1_event_1_judge_1');
      console.log('✅ Old index dropped');
    } catch (err) {
      console.warn('⚠️ Old index not found or already removed');
    }

    // ✅ Create the new index
    await scores.createIndex(
      { team: 1, event: 1, judge: 1, round: 1, participant: 1 },
      { unique: true }
    );
    console.log('✅ New index created: team+event+judge+round+participant');
  } catch (err) {
    console.error('❌ Failed to update index:', err);
  } finally {
    await client.close();
  }
}

fixScoreIndex();