// Countdown timer utility
// Usage: startCountdown('timer-id', hours, minutes, seconds, onExpire)
window.startCountdown = function(elementId, h, m, s, onExpire) {
  let total = h * 3600 + m * 60 + s;
  const el = document.getElementById(elementId);
  if (!el) return;

  // Persist across page reloads using sessionStorage
  const key = 'kh_timer_' + elementId;
  const saved = sessionStorage.getItem(key);
  const now = Date.now();

  if (saved) {
    const { end } = JSON.parse(saved);
    total = Math.max(0, Math.floor((end - now) / 1000));
  } else {
    sessionStorage.setItem(key, JSON.stringify({ end: now + total * 1000 }));
  }

  function render() {
    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;
    const fmt = n => String(n).padStart(2, '0');
    el.querySelector('[data-h]').textContent = fmt(hh);
    el.querySelector('[data-m]').textContent = fmt(mm);
    el.querySelector('[data-s]').textContent = fmt(ss);
  }

  render();
  const iv = setInterval(() => {
    if (total <= 0) {
      clearInterval(iv);
      sessionStorage.removeItem(key);
      if (typeof onExpire === 'function') onExpire();
      return;
    }
    total--;
    render();
  }, 1000);
};
