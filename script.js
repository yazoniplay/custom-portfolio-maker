(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const form = $('#portfolio-form'), preview = $('#preview'), skillsList = $('#skills-list'), projectsList = $('#projects-list');
  const codeOutput = $('#generated-code'), codeStatus = $('#code-status'), toast = $('#toast');
  let toastTimer;
  const escapeHTML = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = v => { try { const u = new URL(String(v || '').trim()); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch (_) { return ''; } };
  function showToast(message, error) {
    toast.textContent = message; toast.classList.toggle('error', !!error); toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
  const presets = {
    midnight:{background:'#0b1020',accent:'#829dff',highlight:'#54e0c0'},
    violet:{background:'#100b1d',accent:'#b49aff',highlight:'#f0a7ff'},
    emerald:{background:'#071a17',accent:'#4ee0b5',highlight:'#c2f970'},
    sunset:{background:'#1b1016',accent:'#ff927e',highlight:'#ffd08a'},
    minimal:{background:'#111111',accent:'#f4f4f5',highlight:'#a3a3a3'}
  };
  function updateColorLabels() {
    ['backgroundColor','accentColor','highlightColor'].forEach(id => {
      const el = $('#' + id), label = $('#' + id + 'Value');
      if (el && label) label.textContent = el.value.toUpperCase();
    });
  }
  function addSkill(value) {
    const row = $('#skill-template').content.firstElementChild.cloneNode(true);
    const input = $('.skill-input', row); input.value = value || '';
    input.addEventListener('input', renderNow);
    $('.remove-button', row).addEventListener('click', () => { row.remove(); renderNow(); });
    skillsList.appendChild(row);
  }
  function addProject(data) {
    data = data || {};
    const card = $('#project-template').content.firstElementChild.cloneNode(true);
    $('.project-name', card).value = data.name || '';
    $('.project-description', card).value = data.description || '';
    $('.project-live', card).value = data.live || '';
    $('.project-repo', card).value = data.repo || '';
    $$('input,textarea', card).forEach(el => el.addEventListener('input', renderNow));
    $('.remove-button', card).addEventListener('click', () => { card.remove(); renumberProjects(); renderNow(); });
    projectsList.appendChild(card); renumberProjects(); renderNow();
  }
  function renumberProjects() {
    $$('.project-index', projectsList).forEach((el, i) => el.textContent = 'PROJECT ' + String(i + 1).padStart(2,'0'));
  }
  function getData() {
    const val = id => ($('#' + id).value || '').trim();
    return {
      name:val('fullName') || 'Your Name', role:val('role') || 'Developer & creator',
      headline:val('headline') || 'Curious mind. Builder’s mindset.',
      bio:val('bio') || 'I enjoy building useful things and learning new technologies.',
      avatar:safeURL(val('avatar')), email:val('email'), github:safeURL(val('github')), social:safeURL(val('social')),
      colors:{background:val('backgroundColor') || '#0b1020',accent:val('accentColor') || '#829dff',highlight:val('highlightColor') || '#54e0c0'},
      skills:$$('.skill-input',skillsList).map(el => el.value.trim()).filter(Boolean),
      projects:$$('.project-editor',projectsList).map(card => ({
        name:$('.project-name',card).value.trim(), description:$('.project-description',card).value.trim(),
        live:safeURL($('.project-live',card).value), repo:safeURL($('.project-repo',card).value)
      })).filter(p => p.name || p.description || p.live || p.repo)
    };
  }
  function portfolioCSS(d) {
    return ':root{color-scheme:dark;--bg:' + d.colors.background + ';--accent:' + d.colors.accent + ';--highlight:' + d.colors.highlight + ';--text:#eff3ff;--muted:#aab5ca;--panel:#141f33;--line:#34425d}' +
    '*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 system-ui,sans-serif}a{color:var(--highlight);text-decoration:none}a:hover{text-decoration:underline}' +
    '.site{max-width:1000px;margin:auto;padding:0 28px}nav{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 0;border-bottom:1px solid #ffffff20}.wordmark{font-weight:800;font-size:19px;color:var(--text);overflow-wrap:anywhere}.wordmark span,.period{color:var(--highlight)}.nav-right{display:flex;gap:18px;flex-wrap:wrap}.nav-right a{color:var(--muted);font-size:13px}' +
    '.hero{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:30px;align-items:center;padding:65px 0 45px}.eyebrow,.section-label,.hero-index,.project-count{font:11px ui-monospace,monospace;letter-spacing:1.4px;color:var(--highlight)}.hello{color:var(--muted);margin:24px 0 0}h1{font-size:clamp(38px,7vw,66px);line-height:1.05;letter-spacing:-2px;margin:5px 0 12px;overflow-wrap:anywhere}.hero h2{font-size:19px;color:#c0cbe0;font-weight:500;margin:0}.hero-bio,.section-content>p{max-width:620px;color:var(--muted);line-height:1.9}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.primary-link,.secondary-link,.contact-button{display:inline-block;padding:10px 15px;border-radius:8px;font-weight:700;font-size:13px}.primary-link{background:var(--accent);color:#101421}.secondary-link{border:1px solid var(--line);color:var(--text)}' +
    '.portrait{width:150px;height:180px;overflow:hidden;border-radius:80px 80px 16px 16px;border:1px solid var(--line);background:var(--panel);display:grid;place-items:center;position:relative}.avatar-img{width:100%;height:100%;object-fit:cover}.avatar-fallback{width:100%;height:100%;display:grid;place-items:center;font-size:38px;font-weight:800;background:linear-gradient(140deg,var(--panel),var(--bg));color:var(--accent)}.portrait-caption{position:absolute;bottom:0;left:0;right:0;padding:6px;background:#0009;font-size:8px;text-align:center;letter-spacing:1px}.hero-index{margin-top:12px;color:var(--muted)}' +
    '.section{display:grid;grid-template-columns:160px minmax(0,1fr);gap:25px;padding:42px 0;border-top:1px solid #ffffff20}.section-label span{color:var(--accent);margin-right:8px}.section-content h2,.contact h2{font-size:clamp(25px,4vw,34px);line-height:1.2;letter-spacing:-1px;margin:0 0 15px}.section-content h2 span,.contact h2 span{color:var(--accent)}.socials{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px}.skills{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.skill{padding:6px 10px;border:1px solid var(--line);background:var(--panel);border-radius:7px;font-size:12px}.muted,.empty-projects{color:var(--muted)}' +
    '.work-heading{display:flex;justify-content:space-between;align-items:end;gap:12px}.projects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:20px}.project{min-width:0;padding:18px;border:1px solid var(--line);border-radius:10px;background:var(--panel)}.project-top{display:flex;justify-content:space-between;color:var(--highlight);font:12px ui-monospace,monospace}.project h3{font-size:18px;margin:18px 0 6px;overflow-wrap:anywhere}.project p{font-size:13px;color:var(--muted);overflow-wrap:anywhere}.project-links{display:flex;gap:14px;flex-wrap:wrap;font-size:12px}.contact{display:flex;justify-content:space-between;align-items:center;gap:25px;margin:24px 0;padding:28px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.contact-button{background:var(--highlight);color:#101421}.footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:22px 0 30px;border-top:1px solid #ffffff20;color:var(--muted);font:10px ui-monospace,monospace;letter-spacing:1px}' +
    '@media(max-width:650px){.site{padding:0 18px}.hero{grid-template-columns:1fr;padding:45px 0 35px}.portrait{grid-row:1;width:105px;height:125px}.avatar-fallback{font-size:30px}.section{grid-template-columns:1fr;gap:14px;padding:32px 0}.projects{grid-template-columns:1fr}.contact{align-items:flex-start;flex-direction:column}.nav-right{gap:10px}.nav-right a{font-size:12px}}';
  }
  function renderPortfolio(d) {
    const e = escapeHTML, validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
    const initials = d.name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'Y';
    const avatar = d.avatar
      ? '<img class="avatar-img" src="' + e(d.avatar) + '" alt="' + e(d.name) + '"><span class="avatar-fallback" hidden>' + e(initials) + '</span>'
      : '<span class="avatar-fallback">' + e(initials) + '</span>';
    const links = [
      d.github ? '<a href="' + e(d.github) + '" target="_blank" rel="noopener noreferrer">GitHub ↗</a>' : '',
      d.social ? '<a href="' + e(d.social) + '" target="_blank" rel="noopener noreferrer">Social ↗</a>' : '',
      validEmail ? '<a href="mailto:' + e(d.email) + '">Email ↗</a>' : ''
    ].filter(Boolean).join('');
    const skills = d.skills.length ? d.skills.map(s => '<span class="skill">' + e(s) + '</span>').join('') : '<span class="muted">Add your skills in the editor.</span>';
    const projects = d.projects.length ? d.projects.map((p,i) => '<article class="project"><div class="project-top"><span>PROJECT ' + String(i+1).padStart(2,'0') + '</span><span>↗</span></div><h3>' + e(p.name || 'Untitled project') + '</h3><p>' + e(p.description || 'Project description coming soon.') + '</p><div class="project-links">' + (p.live ? '<a href="' + e(p.live) + '" target="_blank" rel="noopener noreferrer">Live demo ↗</a>' : '') + (p.repo ? '<a href="' + e(p.repo) + '" target="_blank" rel="noopener noreferrer">Source code ↗</a>' : '') + '</div></article>').join('') : '<p class="empty-projects">Your projects will appear here when you add them.</p>';
    let html = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="' + e(d.role) + ' — portfolio of ' + e(d.name) + '"><title>' + e(d.name) + ' — Portfolio</title><style>' + portfolioCSS(d) + '</style></head><body><div class="site">';
    html += '<nav><a class="wordmark" href="#top">' + e(d.name) + '<span>.</span></a><div class="nav-right"><a href="#about">About</a><a href="#skills">Skills</a><a href="#work">Projects</a><a href="#contact">Contact</a></div></nav><main id="top">';
    html += '<section class="hero"><div><div class="eyebrow">✳ YOUR PORTFOLIO</div><p class="hello">Hello, I’m</p><h1>' + e(d.name) + '<span class="period">.</span></h1><h2>' + e(d.role) + '</h2><p class="hero-bio">' + e(d.bio) + '</p><div class="hero-actions"><a class="primary-link" href="#work">View my projects ↘</a>' + (validEmail ? '<a class="secondary-link" href="mailto:' + e(d.email) + '">Contact me</a>' : '') + '</div></div><div class="portrait">' + avatar + '<div class="portrait-caption">DESIGNING & BUILDING</div></div><div class="hero-index">PORTFOLIO / ' + new Date().getFullYear() + '</div></section>';
    html += '<section class="section" id="about"><div class="section-label"><span>01</span> ABOUT ME</div><div class="section-content"><h2>' + e(d.headline).replace(/\n/g,'<br>') + '</h2><p>' + e(d.bio).replace(/\n/g,'<br>') + '</p><div class="socials">' + (links || '<span class="muted">Add your social links in the editor.</span>') + '</div></div></section>';
    html += '<section class="section" id="skills"><div class="section-label"><span>02</span> MY SKILLS</div><div class="section-content"><h2>My toolkit</h2><div class="skills">' + skills + '</div></div></section>';
    html += '<section class="section" id="work"><div class="section-label"><span>03</span> SELECTED PROJECTS</div><div class="section-content"><div class="work-heading"><h2>Things I’ve built</h2><span class="project-count">' + String(d.projects.length).padStart(2,'0') + ' PROJECTS</span></div><div class="projects">' + projects + '</div></div></section>';
    html += '<section class="contact" id="contact"><div><div class="section-label"><span>04</span> WHAT’S NEXT?</div><h2>Have an idea?<br><span>Let’s make it real.</span></h2></div><div>' + (validEmail ? '<a href="mailto:' + e(d.email) + '" class="contact-button">Say hello ↗</a>' : '<p class="muted">Find me through my links.</p>') + '<div class="socials">' + links + '</div></div></section></main>';
    html += '<footer class="footer"><span>© ' + new Date().getFullYear() + ' ' + e(d.name) + '</span><a href="#top">BACK TO TOP ↑</a><span>BUILT WITH INTENTION</span></footer></div>';
    html += '<script>document.querySelectorAll(".avatar-img").forEach(function(i){i.addEventListener("error",function(){i.hidden=true;if(i.nextElementSibling)i.nextElementSibling.hidden=false;});});<\/script></body></html>';
    return html;
  }
  function renderNow() {
    try {
      const html = renderPortfolio(getData());
      preview.srcdoc = html;
      preview.dataset.html = html;
      if (codeOutput) codeOutput.value = html;
      if (codeStatus) codeStatus.textContent = 'Generated · ' + html.length.toLocaleString() + ' characters';
      updateColorLabels();
    } catch (error) {
      console.error('Render error:', error);
      if (codeStatus) codeStatus.textContent = 'Generation error';
      showToast('Portfolio generation failed. Open the browser console for details.', true);
    }
  }
  function downloadHTML() {
    const html = renderPortfolio(getData());
    if (!html || !html.startsWith('<!doctype html>')) { showToast('No HTML was generated.', true); return; }
    try {
      const blob = new Blob([html], {type:'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url;
      link.download = (getData().name.toLowerCase().replace(/[^a-z0-9]+/g,'-') || 'my') + '-portfolio.html';
      link.style.display = 'none'; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast('HTML download started.');
    } catch (error) { console.error(error); showToast('Download failed. Copy the code below instead.', true); }
  }
  async function copyHTML() {
    const html = renderPortfolio(getData());
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(html);
      else {
        const area = document.createElement('textarea'); area.value = html; area.setAttribute('readonly','');
        area.style.position = 'fixed'; area.style.left = '-9999px'; document.body.appendChild(area); area.select();
        const ok = document.execCommand('copy'); area.remove(); if (!ok) throw new Error('Clipboard denied');
      }
      showToast('HTML copied. Paste it into a file named index.html.');
    } catch (error) {
      if (codeOutput) { codeOutput.focus(); codeOutput.select(); }
      showToast('Auto-copy blocked. Code selected below—press Ctrl+C.', true);
    }
  }
  function reset() {
    const defaults = {fullName:'Alex Morgan',role:'Developer & digital creator',headline:'Curious mind. Builder’s mindset.',bio:'I build thoughtful digital experiences, experiment with new technologies, and turn ideas into useful things on the web.',avatar:'',email:'hello@example.com',github:'https://github.com/',social:''};
    Object.entries(defaults).forEach(([id,value]) => { if ($('#'+id)) $('#'+id).value = value; });
    $('#theme').value = 'midnight';
    $('#backgroundColor').value = presets.midnight.background; $('#accentColor').value = presets.midnight.accent; $('#highlightColor').value = presets.midnight.highlight;
    skillsList.replaceChildren(); ['HTML','CSS','JavaScript','UI Design'].forEach(addSkill);
    projectsList.replaceChildren();
    addProject({name:'Pixel Studio',description:'A creative playground for experimenting with interfaces, color, and small details.'});
    addProject({name:'Taskflow',description:'A simple productivity tool that turns a long to-do list into clear, manageable next steps.'});
    renderNow();
  }
  form.addEventListener('input', renderNow);
  $('#add-skill').addEventListener('click', () => { addSkill(''); const inputs = $$('.skill-input',skillsList); inputs[inputs.length-1].focus(); renderNow(); });
  $('#add-project').addEventListener('click', () => { addProject({}); const cards = $$('.project-editor',projectsList); $('.project-name',cards[cards.length-1]).focus(); renderNow(); });
  $('#theme').addEventListener('change', () => {
    const p = presets[$('#theme').value]; if (!p) return;
    $('#backgroundColor').value = p.background; $('#accentColor').value = p.accent; $('#highlightColor').value = p.highlight; renderNow();
  });
  ['backgroundColor','accentColor','highlightColor'].forEach(id => {
    $('#'+id).addEventListener('input', () => { $('#theme').value = 'custom'; renderNow(); });
    $('#'+id).addEventListener('change', renderNow);
  });
  $('#download-btn').addEventListener('click', downloadHTML);
  $('#copy-btn').addEventListener('click', copyHTML);
  $('#reset-btn').addEventListener('click', () => { reset(); showToast('Example content restored.'); });
  reset();
})();
