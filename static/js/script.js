/**
 * script.js — KneeBot Platform
 * Modules: chatbot AJAX, full chatbot, bubble chatbot, assessment form,
 *          recovery dashboard, Chart.js charts, voice input, milestones,
 *          counter animation, hamburger nav.
 */

/* ============================================================
   UTILITY
   ============================================================ */

/**
 * POST JSON to a URL and return parsed response.
 */
async function postJSON(url, data) {
  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Format the current time as HH:MM.
 */
function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ============================================================
   HAMBURGER NAVIGATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu   = document.getElementById('navMenu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
});

/* ============================================================
   COUNTER ANIMATION (Homepage stats)
   ============================================================ */
function animateCounters() {
  const el = document.getElementById('counterA');
  if (!el) return;
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString() + '+';
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

/* ============================================================
   MINI BUBBLE CHATBOT (Homepage)
   ============================================================ */
function initBubbleChat(inputId, sendBtnId, messagesId) {
  const input     = document.getElementById(inputId);
  const sendBtn   = document.getElementById(sendBtnId);
  const messages  = document.getElementById(messagesId);
  if (!input || !sendBtn || !messages) return;

  async function sendBubbleMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Append user bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'bubble-msg user-bubble';
    userDiv.textContent = text;
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;

    try {
      const data = await postJSON('/api/chat', { message: text });
      const botDiv = document.createElement('div');
      botDiv.className = 'bubble-msg bot-bubble';
      botDiv.innerHTML = data.response;
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
    } catch {
      const errDiv = document.createElement('div');
      errDiv.className = 'bubble-msg bot-bubble';
      errDiv.textContent = '⚠️ Could not connect. Please try the full chat.';
      messages.appendChild(errDiv);
    }
  }

  sendBtn.addEventListener('click', sendBubbleMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBubbleMessage();
  });
}

/* ============================================================
   FULL CHATBOT PAGE
   ============================================================ */
function initFullChat({
  inputId, sendBtnId, containerId, typingId,
  chipsClass, voiceBtnId, clearBtnId,
  emergencyId, emergencyCloseId, charCounterId,
}) {
  const input         = document.getElementById(inputId);
  const sendBtn       = document.getElementById(sendBtnId);
  const container     = document.getElementById(containerId);
  const typing        = document.getElementById(typingId);
  const voiceBtn      = document.getElementById(voiceBtnId);
  const clearBtn      = document.getElementById(clearBtnId);
  const emergency     = document.getElementById(emergencyId);
  const emergClose    = document.getElementById(emergencyCloseId);
  const charCounter   = document.getElementById(charCounterId);
  const chips         = document.querySelectorAll(`.${chipsClass}`);

  if (!input || !sendBtn || !container) return;

  // Ensure typing indicator is hidden on init
  if (typing) typing.hidden = true;

  // Handle Query Parameters for specific start states
  const urlParams = new URLSearchParams(window.location.search);
  const startIntent = urlParams.get('intent');
  const startVoice = urlParams.get('voice');

  if (startIntent === 'emergency') {
    input.value = 'emergency warning signs';
    sendMessage();
  } else if (startVoice === 'true') {
    setTimeout(() => {
      if (voiceBtn) voiceBtn.click();
    }, 500);
  }

  // ── Char counter ──────────────────────────────────────────
  input.addEventListener('input', () => {
    const len = input.value.length;
    if (charCounter) charCounter.textContent = `${len}/500`;
    // Auto-grow textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // ── Send helpers ─────────────────────────────────────────
  function appendMessage(role, html) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;
    wrapper.innerHTML = `
      <div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
      <div class="message-bubble">
        ${html}
        <span class="message-time">${nowTime()}</span>
      </div>`;
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) {
        input.value = ''; // Clear whitespace-only
        return;
    }

    input.value = '';
    input.style.height = 'auto';
    if (charCounter) charCounter.textContent = '0/500';

    appendMessage('user', escapeHtml(text));
    sendBtn.disabled = true;

    // Show typing indicator
    if (typing) typing.hidden = false;
    container.scrollTop = container.scrollHeight;

    try {
      const data = await postJSON('/api/chat', { message: text });

      // Hide typing
      if (typing) typing.hidden = true;
      appendMessage('bot', data.response);

      // Emergency
      if (data.emergency && emergency) {
        emergency.hidden = false;
      }
    } catch {
      if (typing) typing.hidden = true;
      appendMessage('bot', '⚠️ Sorry, I could not connect to the server. Please try again.');
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Suggested chips
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.q;
      input.dispatchEvent(new Event('input'));
      sendMessage();
    });
  });

  // Clear chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Keep only the first welcome message
      const msgs = container.querySelectorAll('.message');
      msgs.forEach((m, i) => { if (i > 0) m.remove(); });
    });
  }

  // Emergency dismiss
  if (emergClose && emergency) {
    emergClose.addEventListener('click', () => { 
      emergency.hidden = true;
      emergency.style.display = 'none';
    });
  }

  // ── Voice Input (Web Speech API) ─────────────────────────
  if (voiceBtn) {
    setupVoiceHelper(voiceBtn, (transcript) => {
      input.value = transcript;
      input.dispatchEvent(new Event('input'));
      sendMessage();
    });
  }

  // Scroll to bottom on load
  container.scrollTop = container.scrollHeight;
}

/**
 * Reusable Voice Interaction Helper
 */
function setupVoiceHelper(btn, onResult) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (btn) {
      btn.title = 'Voice not supported in this browser';
      btn.style.opacity = '0.4';
    }
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    btn.textContent = '🔴';
    btn.classList.add('listening');
    btn.title = 'Listening...';
  };
  recognition.onend = () => {
    btn.textContent = '🎙️';
    btn.classList.remove('listening');
    btn.title = 'Voice input';
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };
  recognition.onerror = () => {
    btn.textContent = '🎙️';
    btn.classList.remove('listening');
  };

  btn.addEventListener('click', () => {
    try { recognition.start(); } catch {}
  });
}

/**
 * Hook up voice triggers for multiple elements (Bubble chat, Dashboard notes)
 */
function initGlobalVoiceTriggers() {
  // Bubble chat voice
  const bubbleVoice = document.getElementById('bubbleVoice');
  const bubbleInput = document.getElementById('bubbleInput');
  const bubbleSend  = document.getElementById('bubbleSend');
  if (bubbleVoice && bubbleInput) {
    setupVoiceHelper(bubbleVoice, (transcript) => {
      bubbleInput.value = transcript;
      bubbleSend?.click();
    });
  }

  // Dashboard notes voice
  const notesVoice = document.getElementById('notesVoiceBtn');
  const notesInput = document.getElementById('logNotes');
  if (notesVoice && notesInput) {
    setupVoiceHelper(notesVoice, (transcript) => {
      const prev = notesInput.value.trim();
      notesInput.value = prev ? `${prev} ${transcript}` : transcript;
    });
  }
}

/* ============================================================
   HTML ESCAPE UTILITY
   ============================================================ */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/* ============================================================
   ASSESSMENT FORM
   ============================================================ */
function initAssessment() {
  const form = document.getElementById('assessmentForm');
  if (!form) return;

  // ── BMI live calculation ──────────────────────────────────
  const weightIn  = document.getElementById('weight');
  const heightIn  = document.getElementById('height');
  const bmiVal    = document.getElementById('bmiValue');
  const bmiCat    = document.getElementById('bmiCategory');
  const bmiPtr    = document.getElementById('bmiPointer');

  function updateBMI() {
    const w = parseFloat(weightIn?.value);
    const h = parseFloat(heightIn?.value);
    if (!w || !h || h <= 0) {
      if (bmiVal) bmiVal.textContent = '—';
      if (bmiCat) bmiCat.textContent = 'Enter height & weight';
      return;
    }
    const bmi = w / ((h / 100) ** 2);
    const rounded = bmi.toFixed(1);
    if (bmiVal) bmiVal.textContent = rounded;

    let cat = '', pct = 0;
    if      (bmi < 18.5) { cat = 'Underweight';       pct = (bmi / 18.5) * 10; }
    else if (bmi < 25)   { cat = 'Healthy Weight ✅';  pct = 10 + ((bmi-18.5)/6.5)*20; }
    else if (bmi < 30)   { cat = 'Overweight ⚠️';     pct = 30 + ((bmi-25)/5)*20; }
    else if (bmi < 35)   { cat = 'Obese Class I 🔴';   pct = 50 + ((bmi-30)/5)*20; }
    else if (bmi < 40)   { cat = 'Obese Class II 🔴';  pct = 70 + ((bmi-35)/5)*15; }
    else                  { cat = 'Morbidly Obese 🚨';  pct = 90; }

    if (bmiCat) bmiCat.textContent = cat;
    if (bmiPtr) bmiPtr.style.marginLeft = `${Math.min(pct, 95)}%`;
  }

  weightIn?.addEventListener('input', updateBMI);
  heightIn?.addEventListener('input', updateBMI);

  // ── Slider live values ────────────────────────────────────
  function bindSlider(sliderId, valId) {
    const slider = document.getElementById(sliderId);
    const valEl  = document.getElementById(valId);
    if (!slider || !valEl) return;

    function update() {
      const val = slider.value;
      valEl.textContent = val;
      const pct = (val / slider.max) * 100;
      slider.style.background = `linear-gradient(90deg, var(--clr-primary) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
      slider.setAttribute('aria-valuenow', val);
    }
    slider.addEventListener('input', update);
    update();
  }
  bindSlider('painSlider', 'painVal');
  bindSlider('mobilitySlider', 'mobilityVal');

  // ── Multi-step navigation ─────────────────────────────────
  let currentStep = 1;

  function showStep(n) {
    [1, 2, 3, 4].forEach((i) => {
      const stepEl    = document.getElementById(`formStep${i}`);
      const indicator = document.getElementById(`step-ind-${i}`);
      if (stepEl) {
        stepEl.classList.toggle('active', i === n);
      }
      if (indicator) {
        indicator.classList.toggle('active', i === n);
        if (i < n) indicator.classList.add('completed');
      }
    });
    const step4 = document.getElementById('formStep4');
    if (step4) step4.classList.toggle('active', n === 4);
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('step1Next')?.addEventListener('click', () => {
    const age = document.getElementById('age')?.value;
    const w   = document.getElementById('weight')?.value;
    const h   = document.getElementById('height')?.value;
    if (!age || !w || !h) {
      alert('Please fill in Age, Weight, and Height.');
      return;
    }
    showStep(2);
  });

  document.getElementById('step2Back')?.addEventListener('click', () => showStep(1));
  document.getElementById('step2Next')?.addEventListener('click', () => showStep(3));
  document.getElementById('step3Back')?.addEventListener('click', () => showStep(2));
  document.getElementById('retakeBtn')?.addEventListener('click', () => {
    form.reset();
    showStep(1);
    updateBMI();
    bindSlider('painSlider', 'painVal');
    bindSlider('mobilitySlider', 'mobilityVal');
  });

  // ── Form Submission ───────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn  = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner    = document.getElementById('submitSpinner');

    if (submitText) submitText.hidden = true;
    if (spinner)    spinner.hidden    = false;
    if (submitBtn)  submitBtn.disabled = true;

    const conditions = [...document.querySelectorAll('input[name="conditions"]:checked')]
      .map(cb => cb.value)
      .filter(v => v !== 'none');

    try {
      const result = await postJSON('/api/submit-assessment', {
        age:            parseInt(document.getElementById('age').value),
        weight_kg:      parseFloat(document.getElementById('weight').value),
        height_cm:      parseFloat(document.getElementById('height').value),
        pain_level:     parseInt(document.getElementById('painSlider').value),
        mobility_score: parseInt(document.getElementById('mobilitySlider').value),
        conditions,
      });

      // Populate results
      document.getElementById('resBMI').textContent    = result.bmi;
      document.getElementById('resBMICat').textContent = result.bmi_category;
      document.getElementById('resScore').textContent  = result.readiness_score;

      const riskEl  = document.getElementById('resRisk');
      const riskSub = document.getElementById('resRiskSub');
      if (riskEl) riskEl.textContent = result.risk_level.toUpperCase();
      if (riskSub) {
        const msgs = { low: 'Good candidate for surgery', moderate: 'Optimisation recommended', high: 'Significant preparation required' };
        riskSub.textContent = msgs[result.risk_level] || '';
      }

      // Animate gauge
      const arc = document.getElementById('gaugeArc');
      const gaugeText = document.getElementById('gaugeText');
      if (arc && gaugeText) {
        const circumference = 267;
        const offset = circumference - (result.readiness_score / 100) * circumference;
        arc.style.transition = 'stroke-dashoffset 1s ease';
        arc.style.strokeDashoffset = offset;
        gaugeText.textContent = result.readiness_score;
      }

      // Recommendations
      const recList = document.getElementById('recList');
      if (recList) {
        recList.innerHTML = '';
        result.recommendations.forEach((rec, i) => {
          const li = document.createElement('li');
          li.textContent = rec;
          li.style.animationDelay = `${i * 0.05}s`;
          recList.appendChild(li);
        });
      }

      showStep(4);
    } catch (err) {
      console.error('Assessment submission error:', err);
      // Fallback if no specific UI element exists
      const recList = document.getElementById('recList');
      if (recList) recList.innerHTML = '<li style="color:var(--clr-danger)">⚠️ Error submitting assessment. Please try again.</li>';
    } finally {
      if (submitText) submitText.hidden = false;
      if (spinner)    spinner.hidden    = true;
      if (submitBtn)  submitBtn.disabled = false;
    }
  });
}

/* ============================================================
   RECOVERY DASHBOARD
   ============================================================ */
function initDashboard() {
  if (!document.querySelector('.dashboard-page')) return;

  // ── Slider bindings ───────────────────────────────────────
  bindDashSlider('logPain',     'logPainVal');
  bindDashSlider('logSwelling', 'logSwellingVal');

  function bindDashSlider(id, valId) {
    const slider = document.getElementById(id);
    const valEl  = document.getElementById(valId);
    if (!slider || !valEl) return;
    function update() {
      valEl.textContent = slider.value;
      const pct = (slider.value / slider.max) * 100;
      slider.style.background = `linear-gradient(90deg, var(--clr-primary) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
    }
    slider.addEventListener('input', update);
    update();
  }

  // ── Medications toggle ────────────────────────────────────
  let medsTaken = true;
  document.getElementById('medYes')?.addEventListener('click', () => {
    medsTaken = true;
    document.getElementById('medYes')?.classList.add('active');
    document.getElementById('medNo')?.classList.remove('active');
    document.getElementById('medYes')?.setAttribute('aria-pressed', 'true');
    document.getElementById('medNo')?.setAttribute('aria-pressed', 'false');
  });
  document.getElementById('medNo')?.addEventListener('click', () => {
    medsTaken = false;
    document.getElementById('medNo')?.classList.add('active');
    document.getElementById('medYes')?.classList.remove('active');
    document.getElementById('medYes')?.setAttribute('aria-pressed', 'false');
    document.getElementById('medNo')?.setAttribute('aria-pressed', 'true');
  });

  // ── Recovery Log Form ─────────────────────────────────────
  const logForm = document.getElementById('recoveryLogForm');
  logForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn  = document.getElementById('logSubmitBtn');
    const submitText = document.getElementById('logSubmitText');
    const spinner    = document.getElementById('logSpinner');
    const toast      = document.getElementById('logSuccessToast');

    if (submitText) submitText.hidden = true;
    if (spinner)    spinner.hidden    = false;
    if (submitBtn)  submitBtn.disabled = true;

    const payload = {
      day_number:        parseInt(document.getElementById('dayNumber')?.value || '1'),
      pain_level:        parseInt(document.getElementById('logPain')?.value || '0'),
      swelling_level:    parseInt(document.getElementById('logSwelling')?.value || '0'),
      walking_distance_m:parseFloat(document.getElementById('walkingDist')?.value || '0'),
      exercises_done:    parseInt(document.getElementById('exercisesDone')?.value || '0'),
      medications_taken: medsTaken,
      notes:             document.getElementById('logNotes')?.value?.trim() || '',
    };

    try {
      const result = await postJSON('/api/log-recovery', payload);

      // Emergency
      if (result.emergency) {
        const banner = document.getElementById('dashEmergencyBanner');
        if (banner) banner.hidden = false;
      }

      // Slow recovery
      if (result.slow_recovery_alert) {
        const slowBanner = document.getElementById('slowRecoveryBanner');
        if (slowBanner) slowBanner.hidden = false;
      }

      // AI Prediction
      if (result.prediction) {
        const predBanner = document.getElementById('predictionBanner');
        const predText   = document.getElementById('predictionText');
        const predDays   = document.getElementById('predictionDays');
        if (predBanner) predBanner.hidden = false;
        if (predText)   predText.innerHTML = result.prediction.message;
        if (predDays)   predDays.textContent = result.prediction.estimated_days_to_full_recovery;
      }

      // Update milestones
      updateMilestones(payload.day_number);

      // Toast
      if (toast) {
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 3000);
      }

      // Reload charts
      await loadRecoveryCharts();

      // Reset form
      logForm.reset();
      bindDashSlider('logSwelling', 'logSwellingVal');

    } catch (err) {
      console.error('Log save error:', err);
    } finally {
      if (submitText) submitText.hidden = false;
      if (spinner)    spinner.hidden = true;
      if (submitBtn)  submitBtn.disabled = false;
    }
  });

  // ── Emergency banners close ───────────────────────────────
  document.getElementById('dashEmergencyClose')?.addEventListener('click', () => {
    const b = document.getElementById('dashEmergencyBanner');
    if (b) { b.hidden = true; b.style.display = 'none'; }
  });
  document.getElementById('slowRecoveryClose')?.addEventListener('click', () => {
    const b = document.getElementById('slowRecoveryBanner');
    if (b) { b.hidden = true; b.style.display = 'none'; }
  });

  // ── Load charts on page load ──────────────────────────────
  loadRecoveryCharts();
}

/* ── Chart.js instances ──────────────────────────────────────── */
let painChart, walkChart, exerciseChart, scoreChart;

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 } },
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748B', font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: '#64748B', font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
  },
};

async function loadRecoveryCharts() {
  try {
    const res  = await fetch('/api/recovery-data');
    const data = await res.json();
    const logs = data.logs || [];

    // Update stats
    updateDashStats(logs);

    if (logs.length === 0) {
      document.getElementById('noDataMsg')?.removeAttribute('hidden');
      document.getElementById('chartsGrid')?.setAttribute('hidden', '');
      document.getElementById('historySection')?.setAttribute('hidden', '');
      return;
    }

    document.getElementById('noDataMsg')?.setAttribute('hidden', '');
    document.getElementById('chartsGrid')?.removeAttribute('hidden');
    document.getElementById('historySection')?.removeAttribute('hidden');

    const labels    = logs.map(l => `Day ${l.day}`);
    const pain      = logs.map(l => l.pain);
    const swelling  = logs.map(l => l.swelling);
    const walking   = logs.map(l => l.walking);
    const exercises = logs.map(l => l.exercises);

    // Recovery score: (10-pain)/10 * (walking/max_walk) * (exercises/max_ex) * 100
    const maxWalk = Math.max(...walking, 1);
    const maxEx   = Math.max(...exercises, 1);
    const scores  = logs.map(l =>
      Math.round(((10 - l.pain) / 10 * 0.4 + (l.walking / maxWalk) * 0.4 + (l.exercises / maxEx) * 0.2) * 100)
    );

    // ── Pain & Swelling Chart ─────────────────────────────
    const ctx1 = document.getElementById('painChart')?.getContext('2d');
    if (ctx1) {
      painChart?.destroy();
      painChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Pain',
              data: pain,
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#EF4444',
            },
            {
              label: 'Swelling',
              data: swelling,
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245,158,11,0.08)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#F59E0B',
            },
          ],
        },
        options: { ...CHART_DEFAULTS, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 10 } } },
      });
    }

    // ── Walking Distance Chart ─────────────────────────────
    const ctx2 = document.getElementById('walkChart')?.getContext('2d');
    if (ctx2) {
      walkChart?.destroy();
      walkChart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Distance (m)',
            data: walking,
            backgroundColor: 'rgba(79,142,247,0.6)',
            borderColor: '#4F8EF7',
            borderWidth: 1,
            borderRadius: 6,
          }],
        },
        options: CHART_DEFAULTS,
      });
    }

    // ── Exercise Completion Chart ──────────────────────────
    const ctx3 = document.getElementById('exerciseChart')?.getContext('2d');
    if (ctx3) {
      exerciseChart?.destroy();
      exerciseChart = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Exercises Done',
            data: exercises,
            backgroundColor: 'rgba(16,185,129,0.6)',
            borderColor: '#10B981',
            borderWidth: 1,
            borderRadius: 6,
          }],
        },
        options: CHART_DEFAULTS,
      });
    }

    // ── Recovery Score Trend ───────────────────────────────
    const ctx4 = document.getElementById('recoveryScoreChart')?.getContext('2d');
    if (ctx4) {
      scoreChart?.destroy();
      scoreChart = new Chart(ctx4, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Recovery Score',
            data: scores,
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139,92,246,0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#8B5CF6',
          }],
        },
        options: { ...CHART_DEFAULTS, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 } } },
      });
    }

    // ── History table ─────────────────────────────────────
    const tbody = document.getElementById('logTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      [...logs].reverse().forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${l.day}</td>
          <td>${l.pain}/10</td>
          <td>${l.swelling}/10</td>
          <td>${l.walking}m</td>
          <td>${l.exercises}</td>
          <td>${l.medications ? '✅' : '❌'}</td>
          <td class="${l.slow_alert ? 'table-alert-yes' : 'table-alert-no'}">${l.slow_alert ? '⚠️ Yes' : '✓ No'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

  } catch (err) {
    console.error('Chart load error:', err);
  }
}

function updateDashStats(logs) {
  if (!logs.length) return;

  const totalMeds = logs.filter(l => l.medications).length;
  const adherence = Math.round((totalMeds / logs.length) * 100);
  const maxWalk   = Math.max(...logs.map(l => l.walking), 0);
  const lastPain  = logs[logs.length - 1]?.pain ?? '—';

  const el = (id) => document.getElementById(id);
  if (el('statTotalLogs'))     el('statTotalLogs').textContent = logs.length;
  if (el('statMedAdherence')) el('statMedAdherence').textContent = `${adherence}%`;
  if (el('statMaxWalk'))      el('statMaxWalk').textContent = `${maxWalk}m`;
  if (el('statAvgPain'))      el('statAvgPain').textContent = `${lastPain}/10`;
}

/* ── Milestone Tracker ───────────────────────────────────────── */
function updateMilestones(currentDay) {
  const milestones = [1, 7, 14, 42, 90, 365];
  milestones.forEach(day => {
    const el = document.getElementById(`ms-${day}`);
    if (!el) return;
    if (currentDay >= day) {
      el.classList.add('reached');
      const badge = el.querySelector('.ms-badge');
      if (badge) {
        badge.textContent = '✅';
        badge.setAttribute('aria-label', 'Milestone reached');
      }
    }
  });
}
