const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

exports.sendDailyReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const now = new Date();

    const snapshot = await db.collection('users').get();

    const sends = [];

    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      if (!user.token || !user.reminderTime || !user.timezone) return;

      try {
        const [hour] = user.reminderTime.split(':').map(Number);

        const userNow = new Date(now.toLocaleString('en-US', { timeZone: user.timezone }));
        const userHour = userNow.getHours();

        if (userHour === hour) {
          const message = {
            token: user.token,
            notification: {
              title: 'Daily Focus',
              body: "Your goals are waiting. What will you get done today?"
            },
            webpush: {
              notification: {
                icon: 'https://makareni38-cyber.github.io/daily-focus/icon-192.png',
              },
              fcmOptions: {
                link: 'https://makareni38-cyber.github.io/daily-focus/'
              }
            }
          };
          sends.push(
            messaging.send(message).catch(err => {
              console.error('Failed:', err.message);
            })
          );
        }
      } catch (e) {
        console.error('Error:', e.message);
      }
    });

    await Promise.all(sends);
    console.log(`Sent ${sends.length} reminders.`);
    return null;
  });
