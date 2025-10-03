/* ======== UTILITY: GET CURRENT THEME COLORS ======== */
function getThemeColors() {
  if(document.body.classList.contains('dark')){
    return {
      grid: 'rgba(255,255,255,0.03)',
      text: '#9aa1ab',
      bar: '#7b61ff',
      doughnut: ['#1f8ef1','#7b61ff']
    };
  } else {
    return {
      grid: 'rgba(0,0,0,0.08)',
      text: '#555',
      bar: '#7b61ff',
      doughnut: ['#1f8ef1','#7b61ff']
    };
  }
}

/* ======== CHARTS ======== */
let chart1, chart2;
function initCharts(){
  const colors = getThemeColors();

  // Posting Frequency
  const ctx1 = document.getElementById('chart1').getContext('2d');
  if(chart1) chart1.destroy();
  chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{ label: 'Posts/day', data: [1,4,2,3,6,5,2], borderRadius:6, barThickness:18, backgroundColor: colors.bar }]
    },
    options: {
      plugins: { legend:{ display:false } },
      scales: {
        x: { ticks:{ color: colors.text }, grid:{ display:false } },
        y: { ticks:{ color: colors.text }, grid:{ color: colors.grid } }
      }
    }
  });

  // Follower / Following Ratio
  const ctx2 = document.getElementById('chart2').getContext('2d');
  if(chart2) chart2.destroy();
  chart2 = new Chart(ctx2, {
    type: 'doughnut',
    data: { labels:['Followers','Following'], datasets:[{ data:[780,220], backgroundColor: colors.doughnut, hoverOffset:6 }] },
    options: { plugins: { legend:{ position:'bottom', labels:{ color: colors.text } } } }
  });
}

/* ======== INITIALIZE CHARTS ======== */
initCharts();

/* ======== PREDICTION ======== */
function simulatePrediction() {
  const isFake = Math.random() < 0.28;
  const flag = document.getElementById('flag');
  const conf = document.getElementById('conf');
  const analyzed = document.getElementById('profilesAnalyzed');
  const fakeCount = document.getElementById('profilesFake');

  if (isFake) {
    flag.className = 'predict-flag fake';
    flag.textContent = 'Fake ❌';
    conf.textContent = `${Math.floor(60 + Math.random()*35)}%`;
    fakeCount.textContent = parseInt(fakeCount.textContent)+1;
  } else {
    flag.className = 'predict-flag genuine';
    flag.textContent = 'Genuine ✅';
    conf.textContent = `${Math.floor(75 + Math.random()*20)}%`;
  }
  analyzed.textContent = parseInt(analyzed.textContent)+1;
}

/* ======== RESET ======== */
function resetMock(){
  document.getElementById('accName').value = '';
  document.getElementById('flag').className = 'predict-flag genuine';
  document.getElementById('flag').textContent = 'Genuine ✅';
  document.getElementById('conf').textContent = '92%';
  document.getElementById('profilesAnalyzed').textContent = '1,240';
  document.getElementById('profilesFake').textContent = '87';
  initCharts(); // Reset charts colors
}

/* ======== THEME TOGGLE ======== */
function toggleTheme(){
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  initCharts(); // Update charts colors
}
