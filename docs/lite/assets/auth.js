/**
 * Front-end only "auth" & routing helpers using localStorage.
 * This is purely for demo/teaching. Replace with real backend later.
 */
const STORAGE_USERS = "health_users";
const STORAGE_CURRENT_EMAIL = "health_current_email";

function _loadUsers(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_USERS) || "{}"); }catch(e){ return {}; }
}
function _saveUsers(map){
  localStorage.setItem(STORAGE_USERS, JSON.stringify(map));
}
function getCurrentEmail(){
  return localStorage.getItem(STORAGE_CURRENT_EMAIL) || null;
}
function setCurrentEmail(email){
  if(email){ localStorage.setItem(STORAGE_CURRENT_EMAIL, email); }
  else { localStorage.removeItem(STORAGE_CURRENT_EMAIL); }
}
function getUser(email){
  const map = _loadUsers();
  return map[email] || null;
}
function upsertUser(email, mutator){
  const map = _loadUsers();
  const now = new Date().toISOString();
  let user = map[email] || { email, createdAt: now, ttmCompleted: false, profiles: {} };
  if(mutator) user = mutator(user) || user;
  user.lastLoginAt = now;
  map[email] = user;
  _saveUsers(map);
  return user;
}
function requireLogin(orRedirect=true){
  const email = getCurrentEmail();
  if(!email){
    if(orRedirect){ window.location.href = "index.html"; }
    return null;
  }
  return getUser(email);
}
function routeAfterLogin(user){
  if(!user) user = requireLogin(false);
  if(!user){ window.location.href = "index.html"; return; }
  const TTM_URL = "index1.html";
  const PLATFORM_URL = "main.html"; // 確認實際路徑存在

  window.location.replace(user.ttmCompleted ? PLATFORM_URL : TTM_URL);
}
function logout(){
  setCurrentEmail(null);
  window.location.href = "index.html";
}
function markTtmCompleted(total, stage){
  const email = getCurrentEmail();
  if (!email) return false;
  upsertUser(email, u => {
    u.ttmCompleted = true;
    u.ttmResult = { total, stage, finishedAt: new Date().toISOString() };
    return u;
  });
  return true;
}
window.markTtmCompleted = markTtmCompleted; // 讓頁面可直接呼叫
