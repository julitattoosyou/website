// ================================================================
// GOOGLE FORM SETUP — replace these before going live
// ================================================================
// 1. Create a Google Form with these questions (short answer unless noted):
//      Name · Pronouns · Age or birth date · Instagram · Phone ·
//      Date requested · Description (paragraph) · Idea/theme (paragraph) ·
//      Size · Black or color ink? · Placement ·
//      Reference photos (file upload, required) · Placement reference (file upload, optional)
//    Note: file-upload questions can't be pre-filled by URL — that's why
//    they're not in FORM_FIELDS below. The person attaches those directly
//    on the Google Form page.
// 2. Click the 3-dot menu -> "Get pre-filled link", fill in dummy
//    text in each field, click "Get link", then copy it.
// 3. That copied URL looks like:
//      https://docs.google.com/forms/d/e/XXXX/viewform?usp=pp_url&entry.111=a...
//    Paste the base part (before the ?) into FORM_BASE below, and
//    match each entry.NNN number to the right field below.
// 4. In the Form itself: Settings -> Responses -> turn on
//    "Get email notifications for new responses".
// ================================================================
const FORM_BASE = "https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform";
const FORM_FIELDS = {
  name:        "entry.111111111",
  pronouns:    "entry.111111112",
  age:         "entry.111111113",
  instagram:   "entry.111111114",
  phone:       "entry.111111115",
  date:        "entry.333333333",
  description: "entry.333333334",
  idea:        "entry.555555555",
  size:        "entry.555555556",
  ink:         "entry.555555557",
  placement:   "entry.444444444"
};

function goToBookingForm(){
  const params = new URLSearchParams();
  const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const placement = localStorage.getItem('selectedPlacement') || '';
  const date = localStorage.getItem('selectedDate') || '';

  params.set(FORM_FIELDS.name, get('f-name'));
  params.set(FORM_FIELDS.pronouns, get('f-pronouns'));
  params.set(FORM_FIELDS.age, get('f-age'));
  params.set(FORM_FIELDS.instagram, get('f-instagram'));
  params.set(FORM_FIELDS.phone, get('f-phone'));
  params.set(FORM_FIELDS.date, date);
  params.set(FORM_FIELDS.description, get('f-description'));
  params.set(FORM_FIELDS.idea, get('f-idea'));
  params.set(FORM_FIELDS.size, get('f-size'));
  params.set(FORM_FIELDS.ink, get('f-ink'));
  params.set(FORM_FIELDS.placement, placement);

  window.open(FORM_BASE + "?usp=pp_url&" + params.toString(), "_blank");
}

// ---------- CRT boot / buffering (home page hero only) ----------
function initCRT(){
  const video = document.getElementById('static-video');
  const canvas = document.getElementById('static-canvas');
  const buffering = document.getElementById('buffering-overlay');
  const content = document.getElementById('crt-content');
  if(!video || !canvas) return;

  let settled = false;
  let usingVideo = true;
  const ctx = canvas.getContext('2d');

  function sizeCanvas(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  function drawStatic(){
    const w = canvas.width, h = canvas.height;
    if(!w || !h) return;
    const redFlicker = Math.random() < 0.06;
    const imgData = ctx.createImageData(w, h);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 255;
      imgData.data[i] = redFlicker ? Math.min(255, v + 60) : v;
      imgData.data[i+1] = v * 0.9;
      imgData.data[i+2] = v * 0.9;
      imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  let canvasRunning = false;
  let frame;
  function startCanvasStatic(){
    if(canvasRunning) return;
    canvasRunning = true;
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    (function loop(){
      if(!canvasRunning) return;
      drawStatic();
      frame = requestAnimationFrame(loop);
    })();
  }

  function settle(){
    if(settled) return;
    settled = true;
    clearTimeout(fallbackTimer);
    buffering.classList.add('hidden');
    content.classList.add('visible');
    if(usingVideo){ video.classList.add('settled'); }
    else{ canvas.classList.add('settled'); }
  }

  function fallbackToCanvas(){
    if(!usingVideo) return;
    usingVideo = false;
    video.style.display = 'none';
    canvas.style.display = 'block';
    startCanvasStatic();
    settle();
  }

  // If no <source> was ever pointed at a real file, jump straight to fallback
  const hasSource = video.querySelector('source') && video.querySelector('source').getAttribute('src') && !video.querySelector('source').getAttribute('src').includes('REPLACE');
  const fallbackTimer = setTimeout(fallbackToCanvas, hasSource ? 2500 : 400);

  video.addEventListener('canplaythrough', settle, { once:true });
  video.addEventListener('error', fallbackToCanvas);
  video.play().catch(fallbackToCanvas);
}

// ---------- FAQ accordion ----------
function initFAQ(){
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => item.classList.toggle('open'));
  });
}

// ---------- Body placement selector (placement.html) ----------
function initPlacement(){
  const regionOut = document.getElementById('region-out');
  const confirmBox = document.getElementById('placement-confirm');
  document.querySelectorAll('.body-region').forEach(region => {
    region.addEventListener('click', () => {
      document.querySelectorAll('.body-region').forEach(r => r.classList.remove('active'));
      region.classList.add('active');
      const name = region.getAttribute('data-name');
      if(regionOut) regionOut.textContent = name;
      localStorage.setItem('selectedPlacement', name);
      if(confirmBox){
        confirmBox.style.display = 'flex';
        confirmBox.querySelector('em').textContent = name;
      }
    });
  });
}

// ---------- Flash piece selection (flash.html) ----------
function initFlash(){
  document.querySelectorAll('.flash-tile:not(.taken)').forEach(tile => {
    tile.style.cursor = 'pointer';
    tile.addEventListener('click', () => {
      const name = tile.getAttribute('data-name');
      const price = tile.getAttribute('data-price');
      localStorage.setItem('selectedFlash', `${name} (${price})`);
      document.querySelectorAll('.flash-tile').forEach(t => t.style.outline = 'none');
      tile.style.outline = '2px solid var(--blood)';
      if(confirm(`Save "${name}" and head to Book now?`)){
        window.location.href = 'book.html';
      }
    });
  });
}

// ---------- Booking form placement readout (book.html) ----------
function initBookingPlacementReadout(){
  const el = document.getElementById('f-placement-display');
  if(el){
    const saved = localStorage.getItem('selectedPlacement');
    el.textContent = saved ? saved : '— none yet, tap the map above —';
  }
  const dateEl = document.getElementById('f-date-display');
  if(dateEl){
    const savedDate = localStorage.getItem('selectedDate');
    dateEl.textContent = savedDate ? savedDate : '— pick a date above —';
  }
  const flash = localStorage.getItem('selectedFlash');
  const ideaEl = document.getElementById('f-idea');
  if(flash && ideaEl && !ideaEl.value){
    ideaEl.value = `Flash piece: ${flash}`;
  }
}

// ---------- Calendar day picker ----------
function initCalendar(){
  document.querySelectorAll('.cal-day.open').forEach(day => {
    day.addEventListener('click', () => {
      document.querySelectorAll('.cal-day.open').forEach(d => d.style.outline = 'none');
      day.style.outline = '2px solid var(--blood)';
      const label = 'July ' + day.textContent + ', 2026';
      localStorage.setItem('selectedDate', label);
      const dateEl = document.getElementById('f-date-display');
      if(dateEl) dateEl.textContent = label;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCRT();
  initFAQ();
  initPlacement();
  initBookingPlacementReadout();
  initCalendar();
  initFlash();
});
