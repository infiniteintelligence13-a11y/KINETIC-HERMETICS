// Infinite Intelligence Concierge — client-side chatbot
// Knowledge base covers products, courses, retreats, webinar, FAQ

const KB = {
  greetings: ['hi','hello','hey','hiya','good morning','good evening','what\'s up'],
  intent: [
    {
      keys: ['sea moss','seamoss','irish moss'],
      response: '🌊 <strong>Organic Sea Moss</strong> is one of our bestsellers! It contains 92 of 102 minerals the human body needs, supporting thyroid health, gut healing, skin radiance, and energy.<br><br>Price: <strong>$24.99/jar</strong>. Get it <a href="/pages/products/index.html#sea-moss" style="color:#c9a84c">here →</a>'
    },
    {
      keys: ['reishi','mushroom','lion','lions mane','chaga','cordyceps','fungi'],
      response: '🍄 We carry a full <strong>Medicinal Mushroom Collection</strong>:<br>• Reishi ("Mushroom of Immortality") — $32.99<br>• Lion\'s Mane (brain/focus) — $28.99<br>• Cordyceps (energy/stamina) — $26.99<br>• Chaga (immune supreme) — $34.99<br><br>View all → <a href="/pages/products/index.html#mushrooms" style="color:#c9a84c">Mushroom Collection</a>'
    },
    {
      keys: ['frankincense','myrrh','lavender','peppermint','essential oil','oil'],
      response: '🌿 Our <strong>Essential Oils</strong> are ceremonial-grade and sustainably sourced:<br>• Sacred Frankincense — $29.99<br>• Myrrh — $27.99<br>• Lavender Spiritual Blend — $19.99<br>• Peppermint Clarity — $18.99<br><br><a href="/pages/products/index.html#oils" style="color:#c9a84c">Shop Oils →</a>'
    },
    {
      keys: ['webinar','free webinar','live webinar','register','sign up'],
      response: '🎯 Our <strong>FREE live webinar</strong> — "The Infinite Intelligence Method" — covers:<br>• Herbal foundations for energy & healing<br>• Hermetic principles for transformation<br>• Nature immersion practices<br>• Personalized healing protocols<br><br>Includes <strong>$497 in bonuses</strong>. <a href="/pages/webinar-registration.html" style="color:#c9a84c">Reserve your spot →</a>'
    },
    {
      keys: ['course','courses','academy','program','class','herbal medicine','hermetic'],
      response: '📚 <strong>Infinite Intelligence Academy</strong> offers 4 tiers:<br>• Herbal Foundations — $297 (8 weeks)<br>• Hermetic Sciences Mastery — $997 (12 weeks)<br>• Full Transformation — $2,997 (12 months)<br>• Puerto Rico Retreat — Application required<br><br><a href="/pages/sales.html" style="color:#c9a84c">See full curriculum →</a>'
    },
    {
      keys: ['retreat','puerto rico','rainforest','beach','nature immersion','island'],
      response: '🌴 <strong>Puerto Rico Nature Immersion Retreat</strong>:<br>• 7 days in the tropical rainforest<br>• Herb identification walks<br>• Beach meditation & sacred ceremony<br>• Small group (max 20 participants)<br>• Meals, accommodation & all activities included<br><br>Spaces are extremely limited. <a href="/pages/retreats.html" style="color:#c9a84c">Apply here →</a>'
    },
    {
      keys: ['shipping','ship','delivery','how long','arrive'],
      response: '📦 <strong>Shipping Policy:</strong><br>• Orders processed within 24 hours<br>• US Standard: 3–7 business days (free over $75)<br>• US Expedited: 1–3 business days<br>• International: 7–21 business days<br>• Digital products: Instant access after purchase'
    },
    {
      keys: ['refund','return','money back','guarantee','policy'],
      response: '✅ <strong>30-Day Money-Back Guarantee</strong>: If you\'re not completely satisfied with any product or course, we\'ll refund you in full — no questions asked. Just email <a href="mailto:hello@kinetichemetics.com" style="color:#c9a84c">hello@kinetichemetics.com</a>'
    },
    {
      keys: ['price','cost','how much','pricing','cheap','afford'],
      response: '💰 Our pricing ranges from:<br>• Digital guides: $9.99–$44.99<br>• Physical herbs: $12.99–$39.99<br>• Courses: $297–$2,997<br>• Free webinar (with $497 in bonuses!)<br><br>We also offer a <strong>30-day money-back guarantee</strong> on everything.'
    },
    {
      keys: ['bladderwrack','sea salt','mineral','iodine','thyroid'],
      response: '🌊 <strong>Ocean & Mineral Superfoods:</strong><br>• Sea Moss — $24.99 (92 minerals)<br>• Bladderwrack — $16.99 (iodine-rich)<br>• Atlantic Sea Salt — $12.99<br><br>Sea Moss + Bladderwrack is a powerful thyroid support combination. <a href="/pages/products/index.html#ocean" style="color:#c9a84c">Shop Ocean Collection →</a>'
    },
    {
      keys: ['ebook','ebook','digital','guide','pdf','download'],
      response: '📖 <strong>Digital Guides (instant download):</strong><br>• The Sacred Apothecary (50 herbs) — $17.99<br>• Ocean\'s Medicine (Sea Moss protocols) — $9.99<br>• Mushroom Mastery — $14.99<br>• Hermetic Principles in Daily Life — $12.99<br>• Complete Bundle (all 6 books) — $44.99<br><br><a href="/pages/products/index.html#digital" style="color:#c9a84c">Browse Digital Products →</a>'
    },
    {
      keys: ['contact','email','phone','support','help','reach'],
      response: '📧 <strong>Contact Us:</strong><br>• General: hello@kinetichemetics.com<br>• Products: products@kinetichemetics.com<br>• Courses: courses@kinetichemetics.com<br>• Bookings: bookings@kinetichemetics.com<br>• Hours: Mon–Fri, 9 AM – 6 PM EST'
    },
    {
      keys: ['hermetic','hermetics','hermes','law','principle','as above'],
      response: '✨ <strong>Hermetic Philosophy</strong> is based on 7 universal laws (Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause & Effect, Gender) that govern all reality. Our courses teach how to apply these directly to your health, energy, and daily life.<br><br><a href="/pages/sales.html" style="color:#c9a84c">Explore Hermetic Courses →</a>'
    }
  ],
  fallback: [
    "Great question! Let me point you in the right direction. You can browse all our offerings at the links above, or email us at hello@kinetichemetics.com for personalized guidance. 🌿",
    "I'd love to help with that! For the most detailed answer, reach out to our team at hello@kinetichemetics.com — or explore our <a href='/pages/products/index.html' style='color:#c9a84c'>products</a> and <a href='/pages/sales.html' style='color:#c9a84c'>courses</a>.",
    "That's a wonderful area to explore! Check out our <a href='/pages/webinar-registration.html' style='color:#c9a84c'>free webinar</a> where we cover herbal medicine and hermetic principles in depth. 🌿"
  ]
};

let fallbackIdx = 0;

function getResponse(msg) {
  const lower = msg.toLowerCase();
  if (KB.greetings.some(g => lower.includes(g))) {
    return "Hello! Welcome to Kinetic Hermetics 🌿 I\'m here to guide you toward the right herbs, courses, or experiences. What are you looking to transform today?";
  }
  for (const item of KB.intent) {
    if (item.keys.some(k => lower.includes(k))) return item.response;
  }
  const fb = KB.fallback[fallbackIdx % KB.fallback.length];
  fallbackIdx++;
  return fb;
}

window.toggleChat = function() {
  const win = document.getElementById('chatbot-window');
  win.classList.toggle('open');
};

window.sendChat = function() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  appendMsg(msg, 'user');
  input.value = '';
  document.getElementById('quick-replies').style.display = 'none';
  setTimeout(() => appendMsg(getResponse(msg), 'bot'), 420);
};

window.quickReply = function(msg) {
  appendMsg(msg, 'user');
  document.getElementById('quick-replies').style.display = 'none';
  setTimeout(() => appendMsg(getResponse(msg), 'bot'), 380);
};

function appendMsg(text, role) {
  const msgs = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.innerHTML = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
