// ============================================================
// lvlBase — Gamification Engine
// ============================================================

const LvlGame = (() => {
  const RANKS = [
    { id:'E',  label:'Iron',      minXP:0,     icon:'⚙️',  color:'#9CA3AF' },
    { id:'D',  label:'Bronze',    minXP:500,   icon:'🥉',  color:'#D97706' },
    { id:'C',  label:'Silver',    minXP:1500,  icon:'🥈',  color:'#60A5FA' },
    { id:'B',  label:'Gold',      minXP:3500,  icon:'🥇',  color:'#34D399' },
    { id:'A',  label:'Platinum',  minXP:7500,  icon:'💎',  color:'#A78BFA' },
    { id:'S',  label:'Diamond',   minXP:15000, icon:'🔥',  color:'#F87171' },
    { id:'SS', label:'Legendary', minXP:30000, icon:'👑',  color:'#FDCB6E' }
  ];

  const XP_REWARDS = {
    quest_complete:   100,
    quiz_correct:     10,
    quiz_perfect:     50,
    battle_win:       75,
    battle_lose:      15,
    daily_login:      20,
    streak_bonus:     5,    // per streak day
    assignment_submit: 30,
    assignment_graded: 20,
    help_peer:        25,
    flashcard_review: 5,
    code_submit:      40
  };

  const ACHIEVEMENTS = [
    { id:'first_quest',   name:'First Steps',      desc:'Complete your first quest',    icon:'🎯', xp:50  },
    { id:'streak_7',      name:'On Fire!',          desc:'7-day streak',                 icon:'🔥', xp:100 },
    { id:'streak_30',     name:'Month Master',      desc:'30-day streak',                icon:'🌟', xp:500 },
    { id:'rank_b',        name:'Going Places',      desc:'Reach B rank',                 icon:'🏆', xp:200 },
    { id:'rank_s',        name:'Elite',             desc:'Reach S rank',                 icon:'💎', xp:500 },
    { id:'rank_ss',       name:'Legendary',         desc:'Reach SS rank',                icon:'👑', xp:1000 },
    { id:'guild_create',  name:'Guild Master',      desc:'Create a guild',               icon:'⚔️', xp:150 },
    { id:'battle_win_10', name:'Warrior',           desc:'Win 10 arena battles',         icon:'🗡️', xp:200 },
    { id:'perfect_quiz',  name:'Perfectionist',     desc:'Get 100% on a quiz',           icon:'✨', xp:75  },
    { id:'top_10',        name:'Rising Star',       desc:'Reach top 10 leaderboard',     icon:'⭐', xp:300 }
  ];

  function getRankForXP(xp) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (xp >= r.minXP) rank = r;
      else break;
    }
    return rank;
  }

  function getNextRank(xp) {
    for (const r of RANKS) {
      if (xp < r.minXP) return r;
    }
    return null;
  }

  function getXPToNextRank(xp) {
    const next = getNextRank(xp);
    const curr = getRankForXP(xp);
    if (!next) return { progress: 100, toNext: 0, next: null };
    const progress = ((xp - curr.minXP) / (next.minXP - curr.minXP)) * 100;
    return { progress: Math.min(progress, 100), toNext: next.minXP - xp, next };
  }

  // ── Award XP ──
  async function awardXP(schoolId, uid, action, customAmount) {
    const amount = customAmount ?? XP_REWARDS[action] ?? 0;
    if (!amount) return 0;
    await window.LvlDB.Students.addXP(schoolId, uid, amount);
    // Show popup
    window.LvlUI?.showXPGain(amount);
    window.LvlUI?.toast(`+${amount} XP`, XP_REWARDS[action] ? `${action.replace(/_/g,' ')}` : '', 'xp', 3000);
    // Check for rank-up
    const student = await window.LvlDB.Students.get(schoolId, uid);
    const newRank = getRankForXP(student.xp);
    if (newRank.id !== student.rank) {
      await window.LvlDB.Students.updateRank(schoolId, uid, newRank.id);
      window.LvlUI?.celebrateLevelUp(newRank.label);
    }
    return amount;
  }

  // ── Streak ──
  async function checkAndUpdateStreak(schoolId, uid) {
    const student = await window.LvlDB.Students.get(schoolId, uid);
    if (!student) return 0;

    const today = new Date().toDateString();
    const last  = student.streakLastDate?.toDate?.()?.toDateString?.() || null;

    if (last === today) return student.streak; // Already logged today

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === yesterday ? student.streak + 1 : 1;

    await window.LvlDB.Students.updateStreak(schoolId, uid, newStreak);
    await awardXP(schoolId, uid, 'daily_login');
    if (newStreak > 1) {
      await awardXP(schoolId, uid, null, XP_REWARDS.streak_bonus * Math.min(newStreak, 30));
    }
    // Streak achievements
    if (newStreak === 7)  await unlockAchievement(schoolId, uid, 'streak_7');
    if (newStreak === 30) await unlockAchievement(schoolId, uid, 'streak_30');

    return newStreak;
  }

  // ── Achievements ──
  async function unlockAchievement(schoolId, uid, achievementId) {
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach) return;
    const student = await window.LvlDB.Students.get(schoolId, uid);
    if (student?.badges?.includes(achievementId)) return; // already unlocked

    await window.LvlDB.db.doc(`schools/${schoolId}/students/${uid}`).update({
      badges: firebase.firestore.FieldValue.arrayUnion(achievementId)
    });
    await awardXP(schoolId, uid, null, ach.xp);
    window.LvlUI?.toast(`Achievement Unlocked! ${ach.icon}`, ach.name, 'success', 5000);
  }

  // ── Loot Box ──
  const LOOT_TABLES = {
    common:    [
      { type:'xp', amount:50,  chance:0.5,  label:'50 XP' },
      { type:'xp', amount:100, chance:0.3,  label:'100 XP' },
      { type:'badge', id:'common_badge', chance:0.2, label:'Common Badge 🎖️' }
    ],
    rare:      [
      { type:'xp', amount:200, chance:0.5, label:'200 XP' },
      { type:'xp', amount:350, chance:0.3, label:'350 XP' },
      { type:'badge', id:'rare_badge', chance:0.2, label:'Rare Badge 💫' }
    ],
    epic:      [
      { type:'xp', amount:500,  chance:0.4, label:'500 XP' },
      { type:'xp', amount:750,  chance:0.35, label:'750 XP' },
      { type:'badge', id:'epic_badge', chance:0.25, label:'Epic Badge 🌟' }
    ],
    legendary: [
      { type:'xp', amount:1500, chance:0.4, label:'1500 XP' },
      { type:'xp', amount:2500, chance:0.3, label:'2500 XP' },
      { type:'badge', id:'legendary_badge', chance:0.3, label:'Legendary Badge 👑' }
    ]
  };

  function rollLootBox(rarity = 'common') {
    const table = LOOT_TABLES[rarity] || LOOT_TABLES.common;
    const roll  = Math.random();
    let cumulative = 0;
    for (const item of table) {
      cumulative += item.chance;
      if (roll < cumulative) return item;
    }
    return table[0];
  }

  async function openLootBox(schoolId, uid, rarity) {
    const reward = rollLootBox(rarity);
    if (reward.type === 'xp') {
      await awardXP(schoolId, uid, null, reward.amount);
    } else if (reward.type === 'badge') {
      await unlockAchievement(schoolId, uid, reward.id);
    }
    return reward;
  }

  // ── XP Shop ──
  const SHOP_ITEMS = [
    { id:'streak_shield', name:'Streak Shield', desc:'Protect your streak for 1 day', cost:200, icon:'🛡️' },
    { id:'xp_boost_2x',   name:'2x XP Boost',   desc:'Double XP for 1 hour',          cost:500, icon:'⚡' },
    { id:'loot_common',   name:'Common Loot Box',desc:'A common loot box',             cost:100, icon:'📦' },
    { id:'loot_rare',     name:'Rare Loot Box',  desc:'A rare loot box',               cost:300, icon:'💜' },
    { id:'loot_epic',     name:'Epic Loot Box',  desc:'An epic loot box',              cost:750, icon:'💎' },
    { id:'avatar_frame',  name:'Gold Avatar Frame',desc:'Exclusive gold frame',        cost:1000, icon:'🖼️' }
  ];

  async function buyShopItem(schoolId, uid, itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    const student = await window.LvlDB.Students.get(schoolId, uid);
    if (student.xp < item.cost) throw new Error('Not enough XP');

    await window.LvlDB.db.doc(`schools/${schoolId}/students/${uid}`).update({
      xp: firebase.firestore.FieldValue.increment(-item.cost),
      [`inventory.${itemId}`]: firebase.firestore.FieldValue.increment(1)
    });
    if (itemId.startsWith('loot_')) {
      const rarity = itemId.replace('loot_','');
      return openLootBox(schoolId, uid, rarity);
    }
    return item;
  }

  return {
    RANKS, XP_REWARDS, ACHIEVEMENTS, SHOP_ITEMS, LOOT_TABLES,
    getRankForXP, getNextRank, getXPToNextRank,
    awardXP, checkAndUpdateStreak, unlockAchievement,
    rollLootBox, openLootBox, buyShopItem
  };
})();

window.LvlGame = LvlGame;
