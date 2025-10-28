// ✅ CONFIGURA TUS CLAVES DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let unsubscribeLeaderboard = null;
let currentUser = null;

auth.onAuthStateChanged(user => {
  currentUser = user;
  subscribeToLeaderboard();
});

function subscribeToLeaderboard() {
  unsubscribeLeaderboard = db.collection('users')
    .orderBy('totalPoints', 'desc')
    .limit(10)
    .onSnapshot(snapshot => {
      const leaderboardList = document.getElementById('leaderboard-list');
      leaderboardList.innerHTML = '';

      if (snapshot.empty) {
        leaderboardList.innerHTML = '<p style="text-align:center;color:#999;">Aún no hay clasificaciones.</p>';
        return;
      }

      snapshot.docs.forEach((doc, idx) => {
        const player = doc.data();
        const item = document.createElement('div');
        item.className = 'leaderboard-item';

        let rankClass = '';
        if (idx === 0) rankClass = 'gold';
        else if (idx === 1) rankClass = 'silver';
        else if (idx === 2) rankClass = 'bronze';

        const isCurrentUser = doc.id === (currentUser && currentUser.uid);
        if (isCurrentUser) {
          item.style.background = 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)';
          item.style.border = '2px solid #667eea';
        }

        const completedCount = Array.isArray(player.completedStations) ? player.completedStations.length : 0;
        const displayName = player.username || player.email || 'Usuario';

        item.innerHTML = `
          <span class="rank ${rankClass}">${idx + 1}</span>
          <span class="player-name">${displayName} ${isCurrentUser ? '(Tú)' : ''}</span>
          <span class="player-score">${player.totalPoints || 0} pts (${completedCount}/21)</span>
        `;

        leaderboardList.appendChild(item);
      });
    }, error => {
      console.error('Error cargando la clasificación:', error);
    });
}