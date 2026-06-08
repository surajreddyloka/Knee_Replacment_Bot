<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="KneeBot Recovery Dashboard — Log daily progress and visualise your knee replacement recovery."/>
  <title>KneeBot — Recovery Dashboard</title>
  <link rel="stylesheet" href="/static/css/style.css"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" defer></script>
</head>
<body>

{% include 'partials/header.html' %}

<main class="dashboard-page">
  <div class="container">

    <div class="page-header">
      <h1 class="page-title">📊 Recovery Dashboard</h1>
      <p class="page-subtitle">Log your daily recovery progress and track your journey to full health.</p>
    </div>

    <!-- ── Emergency Alert Banner ───────────────────────────────── -->
    <div class="emergency-banner" id="dashEmergencyBanner" hidden role="alert" aria-live="assertive">
      🚨 <strong>Emergency Symptoms Detected in Your Notes!</strong>
      Please call <strong>911</strong> or contact your surgical team immediately.
      <button class="emergency-close" id="dashEmergencyClose" aria-label="Dismiss">✕</button>
    </div>

    <!-- ── Slow Recovery Alert ─────────────────────────────────── -->
    <div class="alert-banner alert-warning" id="slowRecoveryBanner" hidden role="alert" aria-live="polite">
      ⚠️ <strong>Slow Recovery Detected.</strong> Your progress may be below expected benchmarks.
      Consider contacting your physiotherapist.
      <button class="emergency-close" id="slowRecoveryClose" aria-label="Dismiss">✕</button>
    </div>

    <!-- ── AI Prediction Banner ────────────────────────────────── -->
    <div class="prediction-banner glass-card" id="predictionBanner" hidden aria-live="polite">
      <div class="prediction-icon">🤖</div>
      <div class="prediction-text" id="predictionText"></div>
      <div class="prediction-days">Estimated full recovery: <strong id="predictionDays">—</strong> days</div>
    </div>

    <!-- ── Stats Row ──────────────────────────────────────────── -->
    <div class="dash-stats-row" id="dashStatsRow">
      <div class="dash-stat glass-card">
        <div class="dash-stat-icon">📝</div>
        <div class="dash-stat-val" id="statTotalLogs">{{ logs|length }}</div>
        <div class="dash-stat-label">Total Logs</div>
      </div>
      <div class="dash-stat glass-card">
        <div class="dash-stat-icon">💊</div>
        <div class="dash-stat-val" id="statMedAdherence">—</div>
        <div class="dash-stat-label">Med Adherence</div>
      </div>
      <div class="dash-stat glass-card">
        <div class="dash-stat-icon">🚶</div>
        <div class="dash-stat-val" id="statMaxWalk">—</div>
        <div class="dash-stat-label">Best Walk (m)</div>
      </div>
      <div class="dash-stat glass-card">
        <div class="dash-stat-icon">😊</div>
        <div class="dash-stat-val" id="statAvgPain">—</div>
        <div class="dash-stat-label">Avg Pain Today</div>
      </div>
    </div>

    <div class="dashboard-grid">

      <!-- ── Log Form ──────────────────────────────────────────── -->
      <section class="glass-card log-card" aria-labelledby="log-heading">
        <h2 id="log-heading">📝 Log Today's Recovery</h2>

        <form id="recoveryLogForm" novalidate>

          <div class="form-row">
            <div class="form-group">
              <label for="dayNumber">Day Since Surgery <span class="required">*</span></label>
              <input type="number" id="dayNumber" min="1" max="999"
                     placeholder="e.g. 7" required aria-required="true"/>
            </div>
            <div class="form-group">
              <label>Medications Taken?</label>
              <div class="toggle-group" role="group" aria-label="Medications taken">
                <button type="button" class="toggle-btn active" id="medYes" aria-pressed="true">✅ Yes</button>
                <button type="button" class="toggle-btn"        id="medNo"  aria-pressed="false">❌ No</button>
              </div>
            </div>
          </div>

          <div class="slider-group">
            <label for="logPain">Pain Level <span class="slider-value" id="logPainVal">5</span>/10</label>
            <input type="range" id="logPain" min="0" max="10" value="5" step="1"
                   aria-label="Pain level" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5"/>
            <div class="slider-labels"><span>No Pain</span><span>Worst</span></div>
          </div>

          <div class="slider-group">
            <label for="logSwelling">Swelling Level <span class="slider-value" id="logSwellingVal">3</span>/10</label>
            <input type="range" id="logSwelling" min="0" max="10" value="3" step="1"
                   aria-label="Swelling level" aria-valuemin="0" aria-valuemax="10" aria-valuenow="3"/>
            <div class="slider-labels"><span>No Swelling</span><span>Very Swollen</span></div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="walkingDist">Walking Distance (metres)</label>
              <input type="number" id="walkingDist" min="0" max="50000" step="1" placeholder="e.g. 200"/>
            </div>
            <div class="form-group">
              <label for="exercisesDone">Exercises Completed</label>
              <input type="number" id="exercisesDone" min="0" max="50" step="1" placeholder="e.g. 3"/>
            </div>
          </div>

          <div class="form-group">
            <div class="label-with-action">
              <label for="logNotes">Notes (symptoms, observations)</label>
              <button type="button" class="btn-voice-small" id="notesVoiceBtn" title="Voice input">🎙️</button>
            </div>
            <textarea id="logNotes" rows="3"
                      placeholder="e.g. Knee felt stiff in the morning, did 3 sets of ankle pumps..."
                      aria-label="Daily notes"></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-full" id="logSubmitBtn">
            <span id="logSubmitText">💾 Save Log Entry</span>
            <span class="spinner" id="logSpinner" hidden>⏳</span>
          </button>
        </form>

        <!-- Success notification -->
        <div class="success-toast" id="logSuccessToast" hidden role="status" aria-live="polite">
          ✅ Log saved successfully!
        </div>
      </section>

      <!-- ── Milestone Tracker ──────────────────────────────────── -->
      <section class="glass-card milestones-card" aria-labelledby="milestone-dash-heading">
        <h2 id="milestone-dash-heading">🏆 Recovery Milestones</h2>
        <div class="milestone-list" id="milestoneDashList">
          <div class="milestone-dash-item" data-day="1"  id="ms-1">
            <div class="ms-icon">🏥</div>
            <div class="ms-info">
              <strong>Day 1 — Surgery Day</strong>
              <span>Hospital, first walk with frame</span>
            </div>
            <div class="ms-badge" aria-label="Not yet reached">○</div>
          </div>
          <div class="milestone-dash-item" data-day="7" id="ms-7">
            <div class="ms-icon">🩹</div>
            <div class="ms-info">
              <strong>Day 7</strong>
              <span>Wound check, walk 100m, flexion 60°</span>
            </div>
            <div class="ms-badge" aria-label="Not yet reached">○</div>
          </div>
          <div class="milestone-dash-item" data-day="14" id="ms-14">
            <div class="ms-icon">✂️</div>
            <div class="ms-info">
              <strong>Day 14</strong>
              <span>Suture removal, one crutch, walk 200m</span>
            </div>
            <div class="ms-badge" aria-label="Not yet reached">○</div>
          </div>
          <div class="milestone-dash-item" data-day="42" id="ms-42">
            <div class="ms-icon">🚶</div>
            <div class="ms-info">
              <strong>Week 6</strong>
              <span>90°+ flexion, may drive, aids reduced</span>
            </div>
            <div class="ms-badge" aria-label="Not yet reached">○</div>
          </div>
          <div class="milestone-dash-item" data-day="90" id="ms-90">
            <div class="ms-icon">🏊</div>
            <div class="ms-info">
              <strong>Month 3</strong>
              <span>Cycling, swimming, return to light work</span>
            </div>
            <div class="ms-badge" aria-label="Not yet reached">○</div>
          </div>
          <div class="milestone-dash-item" data-day="365" id="ms-365">
            <div class="ms-icon">🏆</div>
            <div class="ms-info">
              <strong>Year 1</strong>
              <span>Full function, annual X-ray review</span>
            </div>
            <div class="ms-badge" aria-label="Not yet reached">○</div>
          </div>
        </div>
      </section>
    </div><!-- /dashboard-grid -->

    <!-- ── Charts ════════════════════════════════════════════════ -->
    <section class="charts-section" aria-labelledby="charts-heading">
      <h2 id="charts-heading" class="section-title">📈 Recovery Charts</h2>

      <div id="noDataMsg" class="no-data-msg glass-card" aria-live="polite">
        📊 No recovery data yet. Log your first entry above to see your charts!
      </div>

      <div class="charts-grid" id="chartsGrid" hidden>

        <div class="chart-card glass-card">
          <h3>🔴 Pain &amp; Swelling Over Time</h3>
          <div class="chart-wrapper">
            <canvas id="painChart" aria-label="Pain and swelling chart" role="img"></canvas>
          </div>
        </div>

        <div class="chart-card glass-card">
          <h3>🚶 Walking Distance Progression</h3>
          <div class="chart-wrapper">
            <canvas id="walkChart" aria-label="Walking distance chart" role="img"></canvas>
          </div>
        </div>

        <div class="chart-card glass-card">
          <h3>🏋️ Exercise Completion</h3>
          <div class="chart-wrapper">
            <canvas id="exerciseChart" aria-label="Exercise completion chart" role="img"></canvas>
          </div>
        </div>

        <div class="chart-card glass-card">
          <h3>📊 Recovery Score Trend</h3>
          <div class="chart-wrapper">
            <canvas id="recoveryScoreChart" aria-label="Recovery score chart" role="img"></canvas>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Log History Table ──────────────────────────────────── -->
    <section class="history-section glass-card" aria-labelledby="history-heading" id="historySection" hidden>
      <h2 id="history-heading">📋 Log History</h2>
      <div class="table-wrapper" role="region" aria-label="Recovery log history" tabindex="0">
        <table class="log-table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Pain</th>
              <th scope="col">Swelling</th>
              <th scope="col">Walk (m)</th>
              <th scope="col">Exercises</th>
              <th scope="col">Meds</th>
              <th scope="col">Alert</th>
            </tr>
          </thead>
          <tbody id="logTableBody"></tbody>
        </table>
      </div>
    </section>

  </div><!-- /container -->
</main>

{% include 'partials/footer.html' %}

<script src="/static/js/script.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initGlobalVoiceTriggers();
  });
</script>
</body>
</html>
