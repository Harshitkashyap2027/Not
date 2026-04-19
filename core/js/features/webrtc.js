// ============================================================
// lvlBase — WebRTC Arena (1v1 Battle)
// ============================================================

const LvlArena = (() => {
  const QUESTION_TIME = 20; // seconds per question

  // ── Matchmaking via RTDB ──
  async function joinQueue(schoolId, uid, name, rank) {
    const { rtdb } = window.LvlFire;
    const queueRef = rtdb.ref(`matchmaking/${schoolId}`);

    // Look for existing waiting player
    const snap = await queueRef.orderByChild('status').equalTo('waiting').limitToFirst(1).get();
    let opponent = null;
    snap.forEach(child => { opponent = { id: child.key, ...child.val() }; });

    if (opponent && opponent.uid !== uid) {
      // Match found — create match
      const matchId = `${schoolId}_${Date.now()}`;
      await window.LvlDB.Arena.createMatch(matchId, {
        status:   'countdown',
        player1:  { uid: opponent.uid, name: opponent.name, rank: opponent.rank, score: 0 },
        player2:  { uid, name, rank, score: 0 },
        schoolId, currentQ: 0, questions: []
      });
      // Remove opponent from queue
      await queueRef.child(opponent.id).remove();
      return { matchId, role: 'player2' };
    } else {
      // Join queue as waiting
      const myRef = queueRef.push();
      await myRef.set({ uid, name, rank, status: 'waiting', ts: firebase.database.ServerValue.TIMESTAMP });
      return { queueKey: myRef.key, role: 'player1', waiting: true };
    }
  }

  async function leaveQueue(schoolId, queueKey) {
    await window.LvlFire.rtdb.ref(`matchmaking/${schoolId}/${queueKey}`).remove();
  }

  function watchForMatch(schoolId, queueKey, onMatch) {
    const ref = window.LvlFire.rtdb.ref(`matchqueue/${schoolId}/${queueKey}/matchId`);
    ref.on('value', snap => {
      if (snap.val()) { ref.off(); onMatch(snap.val()); }
    });
    return () => ref.off();
  }

  // ── Battle Stage ──
  function onMatchState(matchId, callback) {
    return window.LvlDB.Arena.onMatch(matchId, callback);
  }

  async function submitAnswer(matchId, uid, questionIdx, answer, timeMs) {
    await window.LvlDB.Arena.submitAnswer(matchId, uid, questionIdx, answer, timeMs);
  }

  async function reportScore(matchId, uid, playerKey, score) {
    await window.LvlFire.rtdb.ref(`arena/${matchId}/${playerKey}/score`).set(score);
  }

  async function endBattle(matchId, winnerId) {
    await window.LvlDB.Arena.updateMatch(matchId, {
      status: 'ended',
      winnerId,
      endedAt: firebase.database.ServerValue.TIMESTAMP
    });
  }

  // ── Question Timer ──
  function createTimer(seconds, onTick, onEnd) {
    let remaining = seconds;
    const id = setInterval(() => {
      remaining--;
      onTick(remaining);
      if (remaining <= 0) { clearInterval(id); onEnd(); }
    }, 1000);
    return { stop: () => clearInterval(id) };
  }

  return {
    joinQueue, leaveQueue, watchForMatch,
    onMatchState, submitAnswer, reportScore, endBattle,
    createTimer, QUESTION_TIME
  };
})();

window.LvlArena = LvlArena;
