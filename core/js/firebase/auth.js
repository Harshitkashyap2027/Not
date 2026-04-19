// ============================================================
// lvlBase — Firebase Auth Module
// ============================================================

const LvlAuth = (() => {
  const { auth, db } = window.LvlFire;

  // Role → redirect path map
  const ROLE_ROUTES = {
    student:      '/app/student/dashboard.html',
    teacher:      '/app/teacher/dashboard.html',
    parent:       '/app/parent/dashboard.html',
    'school-admin': '/app/school-admin/dashboard.html',
    'super-admin':  '/app/super-admin/dashboard.html'
  };

  // ── Sign up with email ──
  async function signUpEmail(email, password, profileData) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: profileData.name });
    await db.collection('users').doc(cred.user.uid).set({
      uid:      cred.user.uid,
      name:     profileData.name,
      email:    cred.user.email,
      role:     profileData.role,
      schoolId: profileData.schoolId || null,
      avatar:   profileData.avatar || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status:   profileData.role === 'student' ? 'pending' : 'active'
    });
    await cred.user.sendEmailVerification();
    return cred.user;
  }

  // ── Sign in with email ──
  async function signInEmail(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return _postLogin(cred.user);
  }

  // ── Google SSO ──
  async function signInGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const cred = await auth.signInWithPopup(provider);
    const isNew = cred.additionalUserInfo.isNewUser;
    if (isNew) {
      await db.collection('users').doc(cred.user.uid).set({
        uid:      cred.user.uid,
        name:     cred.user.displayName,
        email:    cred.user.email,
        role:     'student',
        schoolId: null,
        avatar:   cred.user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status:   'pending'
      });
    }
    return _postLogin(cred.user);
  }

  // ── Magic Link ──
  async function sendMagicLink(email) {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/magic-link.html`,
      handleCodeInApp: true
    };
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    localStorage.setItem('lvl_magic_email', email);
  }

  async function completeMagicLink() {
    if (!auth.isSignInWithEmailLink(window.location.href)) return null;
    let email = localStorage.getItem('lvl_magic_email');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    const cred = await auth.signInWithEmailLink(email, window.location.href);
    localStorage.removeItem('lvl_magic_email');
    return _postLogin(cred.user);
  }

  // ── Password Reset ──
  async function sendPasswordReset(email) {
    await auth.sendPasswordResetEmail(email, {
      url: `${window.location.origin}/auth/portal-login.html`
    });
  }

  async function confirmPasswordReset(code, newPassword) {
    await auth.confirmPasswordReset(code, newPassword);
  }

  // ── Sign out ──
  async function signOut() {
    await auth.signOut();
    window.location.href = '/auth/portal-login.html';
  }

  // ── Get current user profile ──
  async function getUserProfile(uid) {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  }

  // ── Post-login: fetch role & redirect ──
  async function _postLogin(user) {
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      // New Google user — send to role selection
      window.location.href = '/auth/signup-student.html?step=role';
      return user;
    }
    if (profile.status === 'blocked') {
      await auth.signOut();
      window.location.href = '/auth/blocked.html';
      return null;
    }
    // Save to session state
    window.LvlState && window.LvlState.set('user', profile);
    localStorage.setItem('lvl_role', profile.role);
    localStorage.setItem('lvl_uid',  profile.uid);
    localStorage.setItem('lvl_school', profile.schoolId || '');
    const route = ROLE_ROUTES[profile.role] || '/auth/portal-login.html';
    window.location.href = route;
    return user;
  }

  // ── Auth guard (call on each app page) ──
  async function requireAuth(allowedRoles = []) {
    return new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(async user => {
        unsub();
        if (!user) {
          window.location.href = '/auth/portal-login.html';
          resolve(null);
          return;
        }
        const profile = await getUserProfile(user.uid);
        if (!profile) {
          window.location.href = '/auth/portal-login.html';
          resolve(null);
          return;
        }
        if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
          const route = ROLE_ROUTES[profile.role] || '/auth/portal-login.html';
          window.location.href = route;
          resolve(null);
          return;
        }
        window.LvlState && window.LvlState.set('user', profile);
        resolve(profile);
      });
    });
  }

  // ── Update profile ──
  async function updateProfile(uid, data) {
    await db.collection('users').doc(uid).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  return {
    signUpEmail, signInEmail, signInGoogle,
    sendMagicLink, completeMagicLink,
    sendPasswordReset, confirmPasswordReset,
    signOut, getUserProfile, requireAuth, updateProfile
  };
})();

window.LvlAuth = LvlAuth;
