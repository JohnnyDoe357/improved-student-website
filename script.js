/* ═══════════════════════════════════════════════════
   STUDENT INFORMATION PORTAL – BIT ECE
   script.js  |  Essentials of Information Technology
   ═══════════════════════════════════════════════════ */

/* ─── State ─── */
const state = {
  name: '', usn: '', dept: '', sem: '',
  dob: '', contact: '', email: '', address: '',
  cgpa: null,
  marks: [],
  attendance: [],
  achievements: [],
  placement: { placed: false, company: '', role: '', package: '', offerDate: '' }
};

/* ─── Helpers ─── */
function fmt(val, fallback = '—') { return val && val.trim() !== '' ? val : fallback; }

function saveToStorage() {
  try { localStorage.setItem('bitStudentData', JSON.stringify(state)); } catch(e) {}
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem('bitStudentData');
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch(e) {}
}

/* ═══════════════════
   PROFILE
   ═══════════════════ */
function openModal() {
  document.getElementById('inputName').value    = state.name;
  document.getElementById('inputUsn').value     = state.usn;
  document.getElementById('inputDept').value    = state.dept;
  document.getElementById('inputSem').value     = state.sem;
  document.getElementById('inputDob').value     = state.dob;
  document.getElementById('inputContact').value = state.contact;
  document.getElementById('inputEmail').value   = state.email;
  document.getElementById('inputAddress').value = state.address;
  document.getElementById('inputCgpa').value    = state.cgpa ?? '';
  document.getElementById('editModal').classList.add('open');
}
function closeModal() { document.getElementById('editModal').classList.remove('open'); }
function closeModalOutside(e) { if (e.target.id === 'editModal') closeModal(); }

function saveProfile() {
  state.name    = document.getElementById('inputName').value.trim();
  state.usn     = document.getElementById('inputUsn').value.trim();
  state.dept    = document.getElementById('inputDept').value.trim();
  state.sem     = document.getElementById('inputSem').value;
  state.dob     = document.getElementById('inputDob').value;
  state.contact = document.getElementById('inputContact').value.trim();
  state.email   = document.getElementById('inputEmail').value.trim();
  state.address = document.getElementById('inputAddress').value.trim();
  const cgpaRaw = parseFloat(document.getElementById('inputCgpa').value);
  state.cgpa    = isNaN(cgpaRaw) ? null : Math.min(10, Math.max(0, cgpaRaw));
  closeModal();
  renderProfile();
  renderCgpa();
  saveToStorage();
}

function renderProfile() {
  document.getElementById('displayName').textContent    = fmt(state.name, 'Student Name');
  document.getElementById('displayUsn').textContent     = fmt(state.usn,  '1BIxECxxx');
  const deptSem = [fmt(state.dept,'Electronics & Communication Engineering'),
                   state.sem ? state.sem + ' Semester' : 'Semester —'].join(' · ');
  document.getElementById('displayDeptSem').textContent = deptSem;
  document.getElementById('displayContact').textContent = fmt(state.contact);
  document.getElementById('displayEmail').textContent   = fmt(state.email);
  document.getElementById('displayAddress').textContent = fmt(state.address);
  if (state.dob) {
    const d = new Date(state.dob);
    document.getElementById('displayDob').textContent   = d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  } else {
    document.getElementById('displayDob').textContent   = '—';
  }
}

/* ─── Photo Upload ─── */
document.getElementById('photoUpload').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('photoImg');
    img.src = e.target.result;
    img.style.display = 'block';
    document.getElementById('photoPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

/* ═══════════════════
   CGPA RING
   ═══════════════════ */
function renderCgpa() {
  const cgpa = state.cgpa;
  const valueEl = document.getElementById('displayCgpa');
  const ringEl  = document.getElementById('cgpaRing');
  if (cgpa === null) {
    valueEl.textContent = '—';
    ringEl.style.strokeDashoffset = 314;
    return;
  }
  valueEl.textContent = cgpa.toFixed(2);
  const pct = cgpa / 10;
  const circumference = 314;
  ringEl.style.strokeDashoffset = circumference * (1 - pct);

  // Color by grade
  if (cgpa >= 8.5) ringEl.style.stroke = '#22c55e';
  else if (cgpa >= 7)  ringEl.style.stroke = '#14b8a6';
  else if (cgpa >= 5)  ringEl.style.stroke = '#f59e0b';
  else                 ringEl.style.stroke = '#ef4444';
}

/* ═══════════════════
   MARKS TABLE
   ═══════════════════ */
function addMarksRow() {
  const id = Date.now();
  state.marks.push({ id, sem: '', subjects: '', marks: '' });
  renderMarks();
  saveToStorage();
}
function deleteMarksRow(id) {
  state.marks = state.marks.filter(r => r.id !== id);
  renderMarks();
  saveToStorage();
}
function renderMarks() {
  const tbody = document.getElementById('marksBody');
  if (state.marks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-row">No marks added yet.</td></tr>';
    return;
  }
  tbody.innerHTML = state.marks.map(r => `
    <tr data-id="${r.id}">
      <td><input value="${r.sem}" placeholder="e.g. Sem 3" onchange="updateMark(${r.id},'sem',this.value)" /></td>
      <td><input value="${r.subjects}" placeholder="Subjects (comma-separated)" onchange="updateMark(${r.id},'subjects',this.value)" /></td>
      <td style="display:flex;align-items:center;gap:.5rem;">
        <input value="${r.marks}" placeholder="e.g. 82/100, SGPA 8.5" onchange="updateMark(${r.id},'marks',this.value)" />
        <button class="delete-row-btn" onclick="deleteMarksRow(${r.id})">🗑</button>
      </td>
    </tr>`).join('');
}
function updateMark(id, field, value) {
  const row = state.marks.find(r => r.id === id);
  if (row) { row[field] = value; saveToStorage(); }
}

/* ═══════════════════
   ATTENDANCE
   ═══════════════════ */
function addAttendanceCard() {
  const id = Date.now();
  state.attendance.push({ id, subject: 'Subject Name', attended: 0, total: 0 });
  renderAttendance();
  saveToStorage();
}
function deleteAttendanceCard(id) {
  state.attendance = state.attendance.filter(c => c.id !== id);
  renderAttendance();
  saveToStorage();
}
function updateAttendance(id, field, value) {
  const card = state.attendance.find(c => c.id === id);
  if (!card) return;
  card[field] = field === 'subject' ? value : Math.max(0, parseInt(value) || 0);
  if (field === 'total' || field === 'attended') {
    const el = document.querySelector(`[data-attid="${id}"]`);
    if (el) refreshAttCard(el, card);
  }
  saveToStorage();
}
function refreshAttCard(el, card) {
  const pct = card.total > 0 ? Math.min(100, Math.round((card.attended / card.total) * 100)) : 0;
  const fill = el.querySelector('.att-bar-fill');
  const pctEl = el.querySelector('.att-percent');
  fill.style.width = pct + '%';
  pctEl.textContent = pct + '%';
  fill.style.background = pct >= 75 ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444';
  pctEl.style.color     = pct >= 75 ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444';
  el.className = 'attendance-card ' + (pct >= 75 ? '' : pct >= 65 ? 'warning' : 'danger');
}
function renderAttendance() {
  const grid = document.getElementById('attendanceGrid');
  if (state.attendance.length === 0) { grid.innerHTML = ''; return; }
  grid.innerHTML = state.attendance.map(card => {
    const pct = card.total > 0 ? Math.min(100, Math.round((card.attended / card.total) * 100)) : 0;
    const color = pct >= 75 ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444';
    const cls   = pct >= 75 ? '' : pct >= 65 ? 'warning' : 'danger';
    return `
    <div class="attendance-card ${cls}" data-attid="${card.id}">
      <button class="att-delete" onclick="deleteAttendanceCard(${card.id})">✕</button>
      <div class="att-subject">
        <input value="${card.subject}" onchange="updateAttendance(${card.id},'subject',this.value)" />
      </div>
      <div class="att-bar-row">
        <div class="att-bar-bg">
          <div class="att-bar-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <span class="att-percent" style="color:${color}">${pct}%</span>
      </div>
      <div class="att-inputs">
        <div><label>Attended</label><input type="number" min="0" value="${card.attended}" onchange="updateAttendance(${card.id},'attended',this.value)" /></div>
        <div><label>Total</label><input type="number" min="0" value="${card.total}" onchange="updateAttendance(${card.id},'total',this.value)" /></div>
      </div>
    </div>`;
  }).join('');
}

/* ═══════════════════
   ACHIEVEMENTS
   ═══════════════════ */
const ICONS = ['🏆','🎖️','📜','🥇','🚀','💡','🎓','🌟','🔬','🤖','🏅','📡'];
function addAchievement() {
  const id = Date.now();
  const icon = ICONS[state.achievements.length % ICONS.length];
  state.achievements.push({ id, icon, title: '', desc: '', date: '' });
  renderAchievements();
  saveToStorage();
}
function deleteAchievement(id) {
  state.achievements = state.achievements.filter(a => a.id !== id);
  renderAchievements();
  saveToStorage();
}
function updateAchievement(id, field, value) {
  const ach = state.achievements.find(a => a.id === id);
  if (ach) { ach[field] = value; saveToStorage(); }
}
function renderAchievements() {
  const list = document.getElementById('achievementsList');
  if (state.achievements.length === 0) {
    list.innerHTML = '<div class="achievement-empty">No achievements added yet.</div>';
    return;
  }
  list.innerHTML = state.achievements.map(a => `
    <div class="achievement-item">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-body">
        <div class="ach-title"><input value="${a.title}" placeholder="Achievement / Certification Title" onchange="updateAchievement(${a.id},'title',this.value)" /></div>
        <div class="ach-desc"><input value="${a.desc}" placeholder="Issuing body / Description" onchange="updateAchievement(${a.id},'desc',this.value)" /></div>
        <div class="ach-date"><input type="text" value="${a.date}" placeholder="Date (e.g. March 2025)" onchange="updateAchievement(${a.id},'date',this.value)" /></div>
      </div>
      <button class="ach-delete" onclick="deleteAchievement(${a.id})">🗑</button>
    </div>`).join('');
}

/* ═══════════════════
   PLACEMENT
   ═══════════════════ */
function openPlacementModal() {
  const p = state.placement;
  document.getElementById('inputPlaced').value     = p.placed ? 'yes' : 'no';
  document.getElementById('inputCompany').value    = p.company;
  document.getElementById('inputRole').value       = p.role;
  document.getElementById('inputPackage').value    = p.package;
  document.getElementById('inputOfferDate').value  = p.offerDate;
  togglePlacementFields();
  document.getElementById('placementModal').classList.add('open');
}
function closePlacementModal() { document.getElementById('placementModal').classList.remove('open'); }
function closePlacementOutside(e) { if (e.target.id === 'placementModal') closePlacementModal(); }
function togglePlacementFields() {
  const show = document.getElementById('inputPlaced').value === 'yes';
  document.getElementById('placementFields').style.display = show ? 'block' : 'none';
}
document.getElementById('inputPlaced').addEventListener('change', togglePlacementFields);

function savePlacement() {
  const p = state.placement;
  p.placed    = document.getElementById('inputPlaced').value === 'yes';
  p.company   = document.getElementById('inputCompany').value.trim();
  p.role      = document.getElementById('inputRole').value.trim();
  p.package   = document.getElementById('inputPackage').value.trim();
  p.offerDate = document.getElementById('inputOfferDate').value;
  closePlacementModal();
  renderPlacement();
  saveToStorage();
}
function renderPlacement() {
  const p = state.placement;
  const statusEl  = document.getElementById('placementStatus');
  const detailsEl = document.getElementById('placementDetails');
  if (!p.placed) {
    statusEl.innerHTML = '<span class="status-dot status-dot--pending"></span><span>Not yet placed</span>';
    detailsEl.style.display = 'none';
  } else {
    statusEl.innerHTML = '<span class="status-dot status-dot--placed"></span><span style="color:#22c55e">Placement Confirmed 🎉</span>';
    detailsEl.style.display = 'block';
    document.getElementById('dispCompany').textContent    = fmt(p.company);
    document.getElementById('dispRole').textContent       = fmt(p.role);
    document.getElementById('dispPackage').textContent    = fmt(p.package);
    if (p.offerDate) {
      const d = new Date(p.offerDate);
      document.getElementById('dispOfferDate').textContent = d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
    } else {
      document.getElementById('dispOfferDate').textContent = '—';
    }
  }
}

/* ═══════════════════
   NAV SCROLL SPY
   ═══════════════════ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

/* Add active nav style inline */
const styleEl = document.createElement('style');
styleEl.textContent = `.nav-link.active{background:rgba(13,148,136,.25);color:#5eead4;}`;
document.head.appendChild(styleEl);

/* ═══════════════════
   INIT
   ═══════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderProfile();
  renderCgpa();
  renderMarks();
  renderAttendance();
  renderAchievements();
  renderPlacement();
  initScrollSpy();

  // Add sample data on first visit
  if (!state.name && !localStorage.getItem('bitStudentData')) {
    state.name    = 'Gurusmaran R';
    state.usn     = '1BI25EC046n
    state.dept    = 'Electronics & Communication Engineering';
    state.sem     = '2nd';
    state.contact = '+91 93800 75089';
    state.email   = 'Gurusmaranr1@gmail.com';
    state.address = 'No. 12, 3rd Cross, Rajajinagar, Bengaluru – 560010';
    state.dob     = '2007-05-03';
    state.cgpa    = 9.50;
    state.marks   = [
      { id: 1, sem: 'Sem 1', subjects: 'Math, Physics, C-Programming, EEE', marks: 'SGPA: 8.4' },
      { id: 2, sem: 'Sem 2', subjects: 'Math II, Chemistry, DSA, Electronics', marks: 'SGPA: 8.9' },
      { id: 3, sem: 'Sem 3', subjects: 'Signals, Networks, Microprocessors, VLSI', marks: 'SGPA: 8.6' },
    ];
    state.attendance = [
      { id: 1, subject: 'Analog Circuits',   attended: 42, total: 48 },
      { id: 2, subject: 'Digital Systems',   attended: 38, total: 48 },
      { id: 3, subject: 'Control Systems',   attended: 34, total: 48 },
      { id: 4, subject: 'Electromagnetic',   attended: 45, total: 48 },
    ];
    state.achievements = [
      { id: 1, icon: '🏆', title: 'IEEE Paper Presentation – 1st Prize', desc: 'IEEE ICIT National Conference, BIT Bengaluru', date: 'March 2025' },
      { id: 2, icon: '📜', title: 'NPTEL – Digital Circuits & Systems', desc: 'IIT Madras · Score: 85%', date: 'Oct 2024' },
      { id: 3, icon: '🚀', title: 'Smart India Hackathon – Finalist', desc: 'Team "CircuitBreakers" · Hardware Edition', date: 'Dec 2024' },
    ];
    renderProfile();
    renderCgpa();
    renderMarks();
    renderAttendance();
    renderAchievements();
    saveToStorage();
  }
});
