(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const form = $('#portfolio-form');
  const preview = $('#preview');
  const skillsList = $('#skills-list');
  const projectsList = $('#projects-list');
  const toast = $('#toast');
  let toastTimer;
  let updateTimer;

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeURL = (value, allowed = ['http:', 'https:']) => {
    try { const url = new URL(String(value || '').trim()); return allowed.includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  const initials = name => name.trim().split(/\s+/).slice(0,2).map(part => part[0] || '').join('').toUpperCase() || 'Y';
  const showToast = (message, error = false) => {
    toast.textContent = message;
    toast.classList.toggle('error', error);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };
  function addSkill(value = '') {
    const fragment = $('#skill-template').content.cloneNode(true);
    const row = $('.skill-row', fragment);
    $('.skill-input', row).value = value;
    $('.remove-button', row).addEventListener('click', () => { row.remove(); scheduleRender(); });
    $('.skill-input', row).addEventListener('input', scheduleRender);
    skillsList.appendChild(fragment);
  }
  function addProject(data = {}) {
    const fragment = $('#project-template').content.cloneNode(true);
    const card = $('.project-editor', fragment);
    $('.project-name', card).value = data.name || '';
    $('.project-description', card).value = data.description || '';
    $('.project-live', card).value = data.live || '';
    $('.project-repo', card).value = data.repo || '';
    $('.remove-button', card).addEventListener('click', () => { card.remove(); renumberProjects(); scheduleRender(); });
    $$('input,textarea', card).forEach(input => input.addEventListener('input', scheduleRender));
    projectsList.appendChild(fragment);
    renumberProjects();
  }
  function renumberProjects() {
    $$('.project-index', projectsList).forEach((el, i) => el.textContent = 'PROJECT ' + String(i + 1).padStart(2, '0'));
  }
  const colorPresets = {
    midnight: {background:'#0b1020',accent:'#829dff',highlight:'#54e0c0'},
    violet: {background:'#100b1d',accent:'#b49aff',highlight:'#f0a7ff'},
    emerald: {background:'#071a17',accent:'#4ee0b5',highlight:'#c2f970'},
    sunset: {background:'#1b1016',accent:'#ff927e',highlight:'#ffd08a'},
    minimal: {background:'#111111',accent:'#f4f4f5',highlight:'#a3a3a3'}
  };
  function applyPreset(name) {
    const preset = colorPresets[name];
    if (!preset) return;
    Object.entries({backgroundColor:preset.background,accentColor:preset.accent,highlightColor:preset.highlight}).forEach(([id,value]) => { $('#' + id).value = value; });
    updateColorLabels();
    scheduleRender();
  }
  function updateColorLabels() {
    ['backgroundColor','accentColor','highlightColor'].forEach(id => { const output = $('#' + id + 'Value'); if(output) output.textContent = $('#' + id).value.toUpperCase(); });
  }
  function getData() {
    const get = id => ($('#' + id).value || '').trim();
    return {
      name: get('fullName') || 'Your Name',
      role: get('role') || 'Developer & creator',
      headline: get('headline') || 'Curious mind. Builder’s mindset.',
      colors: {background:get('backgroundColor') || '#0b1020',accent:get('accentColor') || '#829dff',highlight:get('highlightColor') || '#54e0c0'},
      bio: get('bio') || 'I enjoy building useful things and learning new technologies.',
      avatar: safeURL(get('avatar')),
      email: get('email'),
      github: safeURL(get('github')),
      social: safeURL(get('social')),
      skills: $$('.skill-input', skillsList).map(el => el.value.trim()).filter(Boolean).slice(0,40),
      projects: $$('.project-editor', projectsList).map(card => ({
        name: $('.project-name', card).value.trim(),
        description: $('.project-description', card).value.trim(),
        live: safeURL($('.project-live', card).value),
        repo: safeURL($('.project-repo', card).value)
      })).filter(p => p.name || p.description || p.live || p.repo).slice(0,30)
    };
  }
  function renderPortfolio(data) {
    const e = escapeHTML;
    const avatar = data.avatar
      ? '<img class="avatar-img" src="' + e(data.avatar) + '" alt="' + e(data.name) + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><span class="avatar-fallback" style="display:none">' + e(initials(data.name)) + '</span>'
      : '<span class="avatar-fallback">' + e(initials(data.name)) + '</span>';
    const socialLinks = [
      data.github ? '<a href="' + e(data.github) + '" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>' : '',
      data.social ? '<a href="' + e(data.social) + '" target="_blank" rel="noreferrer">Social <span>↗</span></a>' : '',
      data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? '<a href="mailto:' + e(data.email) + '">Email <span>↗</span></a>' : ''
    ].filter(Boolean).join('');
    const skills = data.skills.length ? data.skills.map(skill => '<span class="skill">' + e(skill) + '</span>').join('') : '<span class="muted">Add your skills in the editor.</span>';
    const projects = data.projects.length ? data.projects.map((p, i) => '<article class="project"><div class="project-top"><span class="project-number">0' + (i + 1) + '</span><span class="project-arrow">↗</span></div><h3>' + e(p.name || 'Untitled project') + '</h3><p>' + e(p.description || 'A project in progress. More details coming soon.') + '</p><div class="project-links">' + (p.live ? '<a href="' + e(p.live) + '" target="_blank" rel="noreferrer">Live demo ↗</a>' : '') + (p.repo ? '<a href="' + e(p.repo) + '" target="_blank" rel="noreferrer">Source code ↗</a>' : '') + '</div></article>').join('') : '<p class="empty-projects">Your next great project belongs here. Add one in the editor.</p>';
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b1020"><meta name="description" content="' + e(data.role) + ' — portfolio of ' + e(data.name) + '"><title>' + e(data.name) + ' — Portfolio</title><style>' + portfolioCSS(data) + '</style></head><body><div class="site"><nav class="nav"><a class="wordmark" href="#top">' + e(data.name) + '<span>.</span></a><div class="nav-right"><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></div></nav><main id="top"><section class="hero"><div class="hero-copy"><div class="available"><span></span> OPEN TO BUILDING COOL THINGS</div><p class="hello">Hello, I\'m</p><h1>' + e(data.name) + '<span class="period">.</span></h1><h2>' + e(data.role) + '</h2><p class="hero-bio">' + e(data.bio) + '</p><div class="hero-actions"><a class="primary-link" href="#work">Explore my work <span>↘</span></a>' + (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? '<a class="secondary-link" href="mailto:' + e(data.email) + '">Get in touch ↗</a>' : '') + '</div></div><div class="portrait">' + avatar + '<div class="portrait-caption"><span>DESIGNING & BUILDING</span><span>✳</span></div></div><div class="hero-index">PORTFOLIO / 2026</div></section><section class="section about" id="about"><div class="section-label"><span>01</span> A LITTLE ABOUT ME</div><div class="section-content"><h2>' + e(data.headline).replace(/\n/g, '<br>') + '</h2><p>' + e(data.bio) + '</p><div class="socials">' + (socialLinks || '<span class="muted">Add your links in the editor.</span>') + '</div></div></section><section class="section" id="skills"><div class="section-label"><span>02</span> MY TOOLKIT</div><div class="section-content"><h2>Tools I use to<br><span>bring ideas to life.</span></h2><div class="skills">' + skills + '</div></div></section><section class="section work-section" id="work"><div class="section-label"><span>03</span> SELECTED WORK</div><div class="section-content"><div class="work-heading"><h2>Things I've<br><span>put into the world.</span></h2><span class="project-count">' + String(data.projects.length).padStart(2,'0') + ' PROJECTS</span></div><div class="projects">' + projects + '</div></div></section><section class="contact" id="contact"><div><div class="section-label"><span>04</span> WHAT'S NEXT?</div><h2>Have an idea?<br><span>Let's make it real.</span></h2></div><div class="contact-action">' + (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? '<a href="mailto:' + e(data.email) + '" class="contact-button">Say hello <span>↗</span></a>' : '<p>Find me through my social links.</p>') + '<div class="socials">' + socialLinks + '</div></div></section></main><footer class="footer"><span>© ' + new Date().getFullYear() + ' ' + e(data.name) + '</span><a href="#top">BACK TO TOP ↑</a><span>BUILT WITH INTENTION.</span></footer></div></body></html>';
  }
  function portfolioCSS(data) {
    return `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');:root{color-scheme:dark;--bg:${data.colors.background};--panel:#111a2c;--line:#27334b;--muted:#9ba9c1;--text:#eff3ff;--accent:${data.colors.accent};--mint:${data.colors.highlight}}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.7 'DM Sans',sans-serif}.site{max-width:1040px;margin:auto;padding:0 48px}.nav{height:78px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #ffffff16}.wordmark{font:700 17px 'Space Grotesk',sans-serif;letter-spacing:-.6px;color:var(--text);text-decoration:none}.wordmark span,.period{color:var(--mint)}.nav-right{display:flex;gap:26px}.nav-right a,.socials a{color:var(--muted);text-decoration:none;font-size:12px}.nav-right a:hover,.socials a:hover{color:var(--mint)}.hero{min-height:430px;padding:75px 0 60px;display:grid;grid-template-columns:1fr 190px;gap:35px;align-items:center;position:relative}.available{display:flex;align-items:center;gap:8px;font:9px 'DM Mono',monospace;letter-spacing:1px;color:var(--mint)}.available span{width:6px;height:6px;background:var(--mint);border-radius:50%;box-shadow:0 0 10px #54e0c077}.hello{color:var(--muted);font-size:13px;margin:25px 0 0}.hero h1{font:600 clamp(38px,6vw,64px)/1.08 'Space Grotesk',sans-serif;letter-spacing:-2.7px;margin:3px 0 8px;overflow-wrap:anywhere}.hero h2{font:500 16px 'Space Grotesk',sans-serif;color:#a9b8d6;margin:0 0 18px}.hero-bio{max-width:490px;color:var(--muted);font-size:13px;line-height:1.9}.hero-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:24px}.primary-link,.secondary-link{padding:10px 14px;border-radius:7px;font-size:11px;text-decoration:none}.primary-link{background:var(--accent);color:#0b1020;font-weight:700}.primary-link span{margin-left:14px}.secondary-link{border:1px solid var(--line);color:var(--text)}.portrait{width:170px;height:200px;border:1px solid #3a4965;border-radius:90px 90px 18px 18px;background:linear-gradient(145deg,#24375b,#111a2b);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:relative}.avatar-img{width:100%;height:100%;object-fit:cover}.avatar-fallback{display:grid;place-items:center;width:100%;height:100%;font:600 42px 'Space Grotesk',sans-serif;color:#a8baff;background:radial-gradient(circle at 50% 35%,#405989,#17243b 65%)}.portrait-caption{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:10px;background:#0b1020cc;font:8px 'DM Mono',monospace;letter-spacing:.7px;color:#b5c6e5}.hero-index{position:absolute;bottom:20px;left:0;color:#65738f;font:9px 'DM Mono',monospace;letter-spacing:1.3px}.section{display:grid;grid-template-columns:155px 1fr;gap:30px;padding:57px 0;border-top:1px solid #ffffff16}.section-label{font:9px 'DM Mono',monospace;letter-spacing:1px;color:#9eacc5}.section-label span{color:var(--mint);margin-right:8px}.section-content h2,.contact h2{font:600 30px/1.2 'Space Grotesk',sans-serif;letter-spacing:-1px;margin:0 0 17px}.section-content h2 span,.contact h2 span{color:#8597bd}.section-content>p{max-width:550px;color:var(--muted);font-size:13px;line-height:1.9}.socials{display:flex;gap:20px;flex-wrap:wrap;margin-top:20px}.socials a span{color:var(--mint)}.skills{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}.skill{border:1px solid #34425d;background:#131e32;color:#c7d3ed;border-radius:7px;padding:7px 11px;font:10px 'DM Mono',monospace}.muted,.empty-projects{color:var(--muted);font-size:12px}.work-heading{display:flex;justify-content:space-between;align-items:end;gap:12px}.project-count{font:9px 'DM Mono',monospace;color:var(--mint);letter-spacing:1px;margin-bottom:21px}.projects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}.project{padding:18px;border:1px solid var(--line);background:linear-gradient(145deg,#141f33,#0f1728);border-radius:10px;min-width:0}.project-top{display:flex;justify-content:space-between;color:var(--mint);font:10px 'DM Mono',monospace}.project-arrow{font-size:17px}.project h3{font:600 16px 'Space Grotesk',sans-serif;margin:18px 0 7px;overflow-wrap:anywhere}.project p{color:var(--muted);font-size:11px;line-height:1.8;min-height:40px;overflow-wrap:anywhere}.project-links{display:flex;gap:13px;flex-wrap:wrap}.project-links a{font-size:10px;color:var(--mint);text-decoration:none}.project-links a:hover{text-decoration:underline}.contact{display:flex;justify-content:space-between;align-items:center;gap:25px;padding:42px 28px;margin:12px 0 36px;border:1px solid #33405a;border-radius:13px;background:radial-gradient(ellipse at 90% 10%,#263b62,#141e32 60%)}.contact h2{margin-top:17px;margin-bottom:0}.contact-action{min-width:160px}.contact-button{display:flex;justify-content:space-between;align-items:center;gap:25px;padding:12px 15px;border-radius:7px;background:var(--mint);color:#0b1020;text-decoration:none;font-weight:700;font-size:11px}.contact-action .socials{gap:13px;margin-top:13px}.contact-action p{color:var(--muted);font-size:12px}.footer{border-top:1px solid #ffffff16;display:flex;justify-content:space-between;gap:12px;padding:18px 0 25px;color:#7e8ba5;font:8px 'DM Mono',monospace;letter-spacing:.8px}.footer a{color:#a9b8d6;text-decoration:none}@media(max-width:620px){.site{padding:0 22px}.nav{height:65px}.nav-right{gap:14px}.nav-right a{font-size:11px}.hero{grid-template-columns:1fr;gap:22px;padding:48px 0 58px}.portrait{grid-row:1;width:105px;height:125px}.avatar-fallback{font-size:30px}.portrait-caption{font-size:6px;padding:6px}.hero h1{font-size:45px}.hero-index{bottom:19px}.section{grid-template-columns:1fr;gap:17px;padding:38px 0}.section-content h2,.contact h2{font-size:27px}.projects{grid-template-columns:1fr}.project p{min-height:0}.contact{padding:25px 20px;align-items:flex-start;flex-direction:column}.footer{flex-wrap:wrap}.footer span:last-child{width:100%}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`;
  }
  function scheduleRender() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      const html = renderPortfolio(getData());
      preview.srcdoc = html;
      preview.dataset.html = html;
    }, 70);
  }
  function downloadHTML() {
    const name = getData().name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio';
    const blob = new Blob([renderPortfolio(getData())], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name + '-portfolio.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Your portfolio HTML is ready to download.');
  }
  async function copyHTML() {
    const html = renderPortfolio(getData());
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(html);
      } else {
        const area = document.createElement('textarea');
        area.value = html;
        area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.appendChild(area); area.select();
        const success = document.execCommand('copy');
        area.remove();
        if (!success) throw new Error('Clipboard unavailable');
      }
      showToast('Generated HTML copied to clipboard.');
    } catch {
      showToast('Clipboard access was blocked. Use Download HTML instead.', true);
    }
  }
  const defaultState = {
    fullName:'Alex Morgan',role:'Developer & digital creator',headline:'Curious mind. Builder’s mindset.',
    bio:'I build thoughtful digital experiences, experiment with new technologies, and turn ideas into useful things on the web.',
    avatar:'',email:'hello@example.com',github:'https://github.com/',social:''
  };
  function reset() {
    Object.entries(defaultState).forEach(([id,value]) => { const field = $('#' + id); if(field) field.value = value; });
    $('#theme').value = 'midnight'; applyPreset('midnight');
    skillsList.replaceChildren(); ['HTML','CSS','JavaScript','UI Design'].forEach(addSkill);
    projectsList.replaceChildren();
    addProject({name:'Pixel Studio',description:'A creative playground for experimenting with interfaces, color, and small details that make products feel great.',live:'',repo:'https://github.com/'});
    addProject({name:'Taskflow',description:'A simple productivity tool that helps turn a long to-do list into clear, manageable next steps.',live:'',repo:''});
    scheduleRender();
  }
  form.addEventListener('input', scheduleRender);
  $('#add-skill').addEventListener('click', () => { addSkill(); const inputs = $$('.skill-input',skillsList); inputs[inputs.length-1].focus(); scheduleRender(); });
  $('#add-project').addEventListener('click', () => { addProject(); const cards = $$('.project-editor',projectsList); $('.project-name',cards[cards.length-1]).focus(); scheduleRender(); });
  $('#theme').addEventListener('change', () => { if ($('#theme').value !== 'custom') applyPreset($('#theme').value); });
  ['backgroundColor','accentColor','highlightColor'].forEach(id => $('#' + id).addEventListener('input', () => {
    $('#theme').value = 'custom';
    updateColorLabels();
    scheduleRender();
  }));
  $('#download-btn').addEventListener('click', downloadHTML);
  $('#copy-btn').addEventListener('click', copyHTML);
  $('#reset-btn').addEventListener('click', () => { reset(); showToast('Example content restored.'); });
  reset();
  updateColorLabels();
})();