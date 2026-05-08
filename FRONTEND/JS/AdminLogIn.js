// ── DEMO ACCOUNTS ──
const ACCOUNTS = {
  'superadmin@kb.ph': { id:'KB-SA-001', role:'superadmin', name:'Maria Santos', temp:false, pwd:'Admin@2024' },
  'KB-SA-001':        { id:'KB-SA-001', role:'superadmin', name:'Maria Santos', temp:false, pwd:'Admin@2024' },
  'admin@kb.ph':      { id:'KB-AD-002', role:'admin',      name:'Jose Reyes',   temp:false, pwd:'Admin@2024' },
  'KB-AD-002':        { id:'KB-AD-002', role:'admin',      name:'Jose Reyes',   temp:false, pwd:'Admin@2024' },
  'ngo@kb.ph':        { id:'KB-NG-003', role:'ngo',        name:'UpSkills+ Inc',temp:false, pwd:'Admin@2024' },
  'KB-NG-003':        { id:'KB-NG-003', role:'ngo',        name:'UpSkills+ Inc',temp:false, pwd:'Admin@2024' },
  'newuser@kb.ph':    { id:'KB-NG-004', role:'ngo',        name:'BYSMP Foundation',temp:true, pwd:'Temp1234!' },
};

let attempts = 0;
const MAX_ATTEMPTS = 5;
let currentUser = null;
let lockTimer = null;

// ── PASSWORD TOGGLE ──
function togglePwd(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ── ATTEMPT DOTS ──
function renderAttemptBar() {
  const bar = document.getElementById('attemptBar');
  bar.innerHTML = '';
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d = document.createElement('div');
    d.className = 'attempt-dot' + (i < attempts ? ' used' : '');
    bar.appendChild(d);
  }
}

// ── LOGIN ATTEMPT ──
function attemptLogin() {
  const id  = document.getElementById('loginId').value.trim();
  const pwd = document.getElementById('loginPwd').value;

  clearMsg('msgArea');

  if (!id || !pwd) { showMsg('msgArea','error','Please enter your email/ID and password.'); return; }

  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    const account = ACCOUNTS[id];
    if (!account || account.pwd !== pwd) {
      attempts++;
      renderAttemptBar();
      if (attempts >= MAX_ATTEMPTS) {
        showStep('stepLocked');
        startLockTimer(300);
        return;
      }
      const left = MAX_ATTEMPTS - attempts;
      showMsg('msgArea','error',`Invalid credentials. ${left} attempt${left!==1?'s':''} remaining.`);
    } else {
      attempts = 0;
      currentUser = account;
      if (account.temp) {
        showStep('stepChangePassword');
      } else {
        goToDashboard(account.role);
      }
    }
  }, 900);
}

// ── LOCK TIMER ──
function startLockTimer(seconds) {
  let s = seconds;
  lockTimer = setInterval(() => {
    s--;
    const m = Math.floor(s/60), sec = s%60;
    document.getElementById('lockTimer').textContent = `Retry in: ${m}:${sec.toString().padStart(2,'0')}`;
    if (s <= 0) {
      clearInterval(lockTimer);
      attempts = 0;
      showStep('stepLogin');
      renderAttemptBar();
    }
  }, 1000);
}

// ── FIRST-TIME PASSWORD ──
function submitNewPassword() {
  const np = document.getElementById('newPwd').value;
  const cp = document.getElementById('confirmPwd').value;
  if (np.length < 8) { showMsg('msgArea2','error','Password must be at least 8 characters.'); return; }
  if (np !== cp) { showMsg('msgArea2','error','Passwords do not match.'); return; }
  if (!/[A-Z]/.test(np)||!/[0-9]/.test(np)||!/[^A-Za-z0-9]/.test(np)) {
    showMsg('msgArea2','warn','Password must include uppercase, number, and special character.');
    return;
  }
  showStep('stepSecurityQ');
}

// ── SECURITY SETUP DONE ──
function finishSetup() { goToDashboard(currentUser.role); }

// ── GO TO DASHBOARD ──
function goToDashboard(role) {
  // Store the full user object so the dashboard can read it
  sessionStorage.setItem('kb_user', JSON.stringify(currentUser));
  sessionStorage.setItem('kb_auth', 'true');
  window.location.href = 'AdminDashboard.html';
}

// ── STRENGTH METER ──
function checkStrength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  const colors = ['','#d94f4f','#d4821a','#4a9cc7','#2e9e6e'];
  const labels = ['','Weak','Fair','Good','Strong'];
  for (let i=1;i<=4;i++){
    document.getElementById('sb'+i).style.background = i<=s ? colors[s] : 'rgba(255,255,255,0.1)';
  }
  document.getElementById('strengthLabel').textContent = v ? labels[s] : '';
  document.getElementById('strengthLabel').style.color = colors[s];
}

// ── HELPERS ──
function showStep(id) {
  ['stepLogin','stepLocked','stepChangePassword','stepSecurityQ','stepForgot'].forEach(s=>{
    const el = document.getElementById(s);
    if (el) el.style.display = s===id ? 'block' : 'none';
  });
}
function showForgotPassword() { showStep('stepForgot'); }
function showMsg(area, type, text) {
  const icons = { error:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', warn:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', success:'<polyline points="20 6 9 17 4 12"/>' };
  document.getElementById(area).innerHTML = `<div class="msg-box msg-${type}"><svg viewBox="0 0 24 24">${icons[type]||''}</svg>${text}</div>`;
}
function clearMsg(area) { document.getElementById(area).innerHTML = ''; }
function setLoading(on) {
  document.getElementById('loginSpinner').style.display = on ? 'block' : 'none';
  document.getElementById('loginBtnText').textContent = on ? 'Signing In…' : 'Sign In';
  document.getElementById('loginBtn').disabled = on;
}
function showMsg2(area, type, text) {
  const el = document.getElementById(area);
  if (el) el.innerHTML = `<div class="msg-box msg-${type}">${text}</div>`;
}

// ── ENTER KEY ──
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const step = document.getElementById('stepLogin');
    if (step && step.style.display !== 'none') attemptLogin();
  }
});

// ── INIT ──
renderAttemptBar();
// Pre-fill hint
document.getElementById('loginId').placeholder = 'Try: admin@kb.ph or KB-SA-001';