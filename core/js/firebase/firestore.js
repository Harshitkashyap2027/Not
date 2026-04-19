// ============================================================
// lvlBase — Firestore Module
// ============================================================

const LvlDB = (() => {
  const { db, rtdb } = window.LvlFire;
  const FS = firebase.firestore;

  // ── Generic Helpers ──
  const col  = path => db.collection(path);
  const doc  = path => db.doc(path);
  const tsNow = () => FS.FieldValue.serverTimestamp();
  const increment = n => FS.FieldValue.increment(n);
  const arrayUnion = (...v) => FS.FieldValue.arrayUnion(...v);
  const arrayRemove = (...v) => FS.FieldValue.arrayRemove(...v);

  async function getDoc(path) {
    const snap = await doc(path).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }
  async function setDoc(path, data) {
    await doc(path).set({ ...data, updatedAt: tsNow() }, { merge: true });
  }
  async function addDoc(colPath, data) {
    const ref = await col(colPath).add({ ...data, createdAt: tsNow() });
    return ref.id;
  }
  async function updateDoc(path, data) {
    await doc(path).update({ ...data, updatedAt: tsNow() });
  }
  async function deleteDoc(path) {
    await doc(path).delete();
  }
  async function queryCol(colPath, filters = [], orderBy = null, lim = null) {
    let q = col(colPath);
    filters.forEach(([field, op, val]) => { q = q.where(field, op, val); });
    if (orderBy) q = q.orderBy(orderBy[0], orderBy[1] || 'asc');
    if (lim)     q = q.limit(lim);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // ── School-scoped helpers ──
  function schoolPath(schoolId, sub) { return `schools/${schoolId}/${sub}`; }

  async function getSchoolDoc(schoolId, sub) {
    return getDoc(`schools/${schoolId}/${sub}`);
  }

  // ── User ──
  const Users = {
    get: uid => getDoc(`users/${uid}`),
    update: (uid, data) => updateDoc(`users/${uid}`, data),
    setOnline: (uid, online) => updateDoc(`users/${uid}`, { online, lastSeen: tsNow() }),
    getBySchool: (schoolId, role) => queryCol('users',
      [['schoolId','==',schoolId], ['role','==',role]], ['name','asc'])
  };

  // ── Student (game data) ──
  const Students = {
    get: (schoolId, uid) => getDoc(`schools/${schoolId}/students/${uid}`),
    init: (schoolId, uid, data = {}) => setDoc(`schools/${schoolId}/students/${uid}`, {
      xp: 0, rank: 'E', streak: 0, streakLastDate: null,
      totalQuests: 0, totalBattles: 0, wins: 0,
      badges: [], guildId: null, ...data
    }),
    addXP: (schoolId, uid, amount) =>
      doc(`schools/${schoolId}/students/${uid}`).update({ xp: increment(amount) }),
    updateRank: (schoolId, uid, rank) =>
      doc(`schools/${schoolId}/students/${uid}`).update({ rank }),
    updateStreak: (schoolId, uid, streak) =>
      doc(`schools/${schoolId}/students/${uid}`).update({
        streak,
        streakLastDate: tsNow()
      }),
    leaderboard: (schoolId, lim = 20) =>
      queryCol(`schools/${schoolId}/students`, [], ['xp','desc'], lim)
  };

  // ── Classes ──
  const Classes = {
    getAll: schoolId => queryCol(`schools/${schoolId}/classes`),
    get:    (schoolId, classId) => getDoc(`schools/${schoolId}/classes/${classId}`),
    create: (schoolId, data) => addDoc(`schools/${schoolId}/classes`, data),
    update: (schoolId, classId, data) => updateDoc(`schools/${schoolId}/classes/${classId}`, data),
    delete: (schoolId, classId) => deleteDoc(`schools/${schoolId}/classes/${classId}`),
    addStudent: (schoolId, classId, uid) =>
      doc(`schools/${schoolId}/classes/${classId}`).update({ students: arrayUnion(uid) }),
    removeStudent: (schoolId, classId, uid) =>
      doc(`schools/${schoolId}/classes/${classId}`).update({ students: arrayRemove(uid) })
  };

  // ── Quizzes ──
  const Quizzes = {
    getAll: (schoolId, classId) => queryCol(`schools/${schoolId}/classes/${classId}/quizzes`),
    create: (schoolId, classId, data) =>
      addDoc(`schools/${schoolId}/classes/${classId}/quizzes`, { ...data, status: 'active' }),
    get:    (schoolId, classId, quizId) =>
      getDoc(`schools/${schoolId}/classes/${classId}/quizzes/${quizId}`),
    submitAttempt: (schoolId, classId, quizId, uid, result) =>
      addDoc(`schools/${schoolId}/classes/${classId}/quizzes/${quizId}/attempts`, {
        uid, ...result, submittedAt: tsNow()
      })
  };

  // ── Assignments ──
  const Assignments = {
    getAll: (schoolId, classId) =>
      queryCol(`schools/${schoolId}/classes/${classId}/assignments`),
    create: (schoolId, classId, data) =>
      addDoc(`schools/${schoolId}/classes/${classId}/assignments`, data),
    submit: (schoolId, classId, assignId, uid, submission) =>
      setDoc(`schools/${schoolId}/classes/${classId}/assignments/${assignId}/submissions/${uid}`,
        { uid, ...submission, submittedAt: tsNow() })
  };

  // ── Guilds ──
  const Guilds = {
    getAll: schoolId => queryCol(`schools/${schoolId}/guilds`),
    get:    (schoolId, guildId) => getDoc(`schools/${schoolId}/guilds/${guildId}`),
    create: (schoolId, data) => addDoc(`schools/${schoolId}/guilds`, { ...data, xp: 0, members: [] }),
    join:   (schoolId, guildId, uid) =>
      doc(`schools/${schoolId}/guilds/${guildId}`).update({ members: arrayUnion(uid) }),
    leave:  (schoolId, guildId, uid) =>
      doc(`schools/${schoolId}/guilds/${guildId}`).update({ members: arrayRemove(uid) }),
    addXP:  (schoolId, guildId, amount) =>
      doc(`schools/${schoolId}/guilds/${guildId}`).update({ xp: increment(amount) })
  };

  // ── Announcements ──
  const Announcements = {
    getAll: (schoolId, lim = 20) =>
      queryCol(`schools/${schoolId}/announcements`, [], ['createdAt','desc'], lim),
    create: (schoolId, data) =>
      addDoc(`schools/${schoolId}/announcements`, data)
  };

  // ── Attendance ──
  const Attendance = {
    mark: (schoolId, classId, date, records) =>
      setDoc(`schools/${schoolId}/classes/${classId}/attendance/${date}`, {
        records, markedAt: tsNow()
      }),
    getForDate: (schoolId, classId, date) =>
      getDoc(`schools/${schoolId}/classes/${classId}/attendance/${date}`),
    getStudentSummary: (schoolId, classId, uid) =>
      queryCol(`schools/${schoolId}/classes/${classId}/attendance`,
        [[`records.${uid}`, '==', true]])
  };

  // ── Chats (Firestore + RTDB) ──
  const Chats = {
    // Send message via RTDB for real-time
    sendMessage: (schoolId, roomId, msg) => {
      const ref = rtdb.ref(`chats/${schoolId}/${roomId}/messages`).push();
      return ref.set({ ...msg, timestamp: firebase.database.ServerValue.TIMESTAMP });
    },
    // Listen to messages
    onMessages: (schoolId, roomId, callback) => {
      const ref = rtdb.ref(`chats/${schoolId}/${roomId}/messages`)
        .orderByChild('timestamp').limitToLast(50);
      ref.on('value', snap => {
        const msgs = [];
        snap.forEach(child => msgs.push({ id: child.key, ...child.val() }));
        callback(msgs);
      });
      return () => ref.off();
    },
    // Create room metadata in Firestore
    createRoom: (schoolId, data) =>
      addDoc(`schools/${schoolId}/chatRooms`, data),
    getRooms: (schoolId, uid) =>
      queryCol(`schools/${schoolId}/chatRooms`,
        [['members', 'array-contains', uid]])
  };

  // ── Arena (RTDB) ──
  const Arena = {
    createMatch: (matchId, data) =>
      rtdb.ref(`arena/${matchId}`).set({ ...data, createdAt: firebase.database.ServerValue.TIMESTAMP }),
    updateMatch: (matchId, data) =>
      rtdb.ref(`arena/${matchId}`).update(data),
    onMatch: (matchId, callback) => {
      const ref = rtdb.ref(`arena/${matchId}`);
      ref.on('value', snap => callback(snap.val()));
      return () => ref.off();
    },
    submitAnswer: (matchId, uid, questionIdx, answer, timeMs) =>
      rtdb.ref(`arena/${matchId}/answers/${uid}/${questionIdx}`).set({ answer, timeMs }),
    endMatch: matchId =>
      rtdb.ref(`arena/${matchId}`).update({ status: 'ended', endedAt: firebase.database.ServerValue.TIMESTAMP })
  };

  // ── Reports / Analytics ──
  const Reports = {
    getSchoolStats: async schoolId => {
      const [students, teachers, classes] = await Promise.all([
        queryCol('users', [['schoolId','==',schoolId],['role','==','student']]),
        queryCol('users', [['schoolId','==',schoolId],['role','==','teacher']]),
        queryCol(`schools/${schoolId}/classes`)
      ]);
      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses:  classes.length
      };
    }
  };

  // ── Realtime listeners ──
  function onUserXP(schoolId, uid, callback) {
    return doc(`schools/${schoolId}/students/${uid}`)
      .onSnapshot(snap => snap.exists && callback(snap.data().xp));
  }

  return {
    // Primitives
    getDoc, setDoc, addDoc, updateDoc, deleteDoc, queryCol,
    // Helpers
    tsNow, increment, arrayUnion, arrayRemove,
    // Domain
    Users, Students, Classes, Quizzes, Assignments,
    Guilds, Announcements, Attendance, Chats, Arena, Reports,
    // Listeners
    onUserXP
  };
})();

window.LvlDB = LvlDB;
