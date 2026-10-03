/* 모이장 상세페이지 인터랙션
 * 1) 스크롤 리빌  2) 로고 '모이기' 애니메이션  3) 친구 탭 카드
 * 4) 구성품 리스트 / 갤러리 + 라이트박스  5) 수량·장바구니
 */
(() => {
  'use strict';

  const PRICE = 29000;
  const LOGO_W = 880, LOGO_H = 348, PAD = 20; // 로고 원본 좌표계 (피그마 컴포넌트 기준)

  // 친구 데이터 — 로고 조각 좌표(x, y, w, h, rot)는 피그마 컴포넌트에서 그대로 가져온 값
  const FRIENDS = [
    { id: 'carrot', jamo: 'ㅁ', name: '당근', product: '구좌 당근잼', color: '#F07A2B',
      origin: '제주시 구좌읍 · 모래땅에서 자란 당근',
      desc: '바닷바람과 화산 모래땅에서 자라 단단하고 달아요. 큼직하게 졸여 빵에도, 요거트에도 잘 어울리는 잼이 됐어요.',
      icon: 'friend_m_carrot.png', photo: 'product_carrot_jam.jpg',
      part: { x: 26, y: 29.33, w: 170, h: 150, rot: 4 } },
    { id: 'fern', jamo: 'ㅗ', name: '고사리', product: '한라산 건고사리', color: '#8AA04A',
      origin: '한라산 자락 · 4월 고사리 장마',
      desc: '봄비가 내리면 쑥쑥 올라오는 한라산 고사리를 손으로 꺾어 볕에 말렸어요. 불려서 볶으면 제주 집밥 맛 그대로.',
      icon: 'friend_o_fern.png', photo: 'product_fern.jpg',
      part: { x: 10, y: 187.33, w: 210, h: 140, rot: -3 } },
    { id: 'hallabong', jamo: 'ㅇ', name: '한라봉', product: '한라봉청', color: '#FFB23F',
      origin: '서귀포 · 볼록 꼭지가 매력',
      desc: '새콤달콤한 한라봉을 껍질째 썰어 담갔어요. 탄산수에 타면 에이드, 따뜻한 물에 타면 겨울 차.',
      icon: 'friend_ieung_hallabong.png', photo: 'product_hallabong.jpg',
      part: { x: 264, y: 72.33, w: 160, h: 180, rot: 5 } },
    { id: 'buckwheat', jamo: 'ㅣ', name: '메밀', product: '제주 메밀차', color: '#C9B98F',
      origin: '제주 동부 메밀밭 · 하얀 메밀꽃',
      desc: '제주는 메밀이 많이 나는 섬이에요. 고소하게 볶아 티백 없이도 우려 마시기 좋게 담았어요.',
      icon: 'friend_i_buckwheat.png', photo: 'product_buckwheat_tea.jpg',
      part: { x: 430, y: 38.33, w: 90, h: 230, rot: -4 } },
    { id: 'basalt', jamo: 'ㅈ', name: '현무암', product: '현무암 코스터', color: '#8C8880',
      origin: '제주 돌담 · 구멍 송송',
      desc: '제주 어디에나 있는 까만 돌, 현무암. 구멍 송송한 질감 그대로 컵 받침이 되어 책상 위에 제주를 놓아줘요.',
      icon: 'friend_j_basalt.png', photo: 'product_basalt_coaster.jpg',
      part: { x: 542, y: 22.33, w: 170, h: 150, rot: 4 } },
    { id: 'radish', jamo: 'ㅏ', name: '월동무', product: '월동무 말랭이', color: '#B9B2A0',
      origin: '성산·대정 · 겨울을 나는 무',
      desc: '한겨울 바닷바람을 맞으며 단맛이 꽉 찬 월동무를 썰어 말렸어요. 꼬들꼬들 무침으로 딱이에요.',
      icon: 'friend_a_radish.png', photo: 'product_radish.jpg',
      part: { x: 723, y: 21.33, w: 130, h: 200, rot: -5 } },
    { id: 'tangerine', jamo: 'ㅇ', name: '감귤', product: '감귤칩', color: '#FF9A3C',
      origin: '제주 전역 · 장의 받침 담당',
      desc: '얇게 썰어 바삭하게 말린 귤 한 조각. 모이장의 마지막 받침처럼, 박스의 마무리를 맡았어요.',
      icon: 'friend_batchim_tangerine.png', photo: 'product_tangerine_chips.jpg',
      part: { x: 561, y: 208.33, w: 180, h: 120, rot: 3 } },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const img = (f) => `images/${f}`;
  const won = (n) => n.toLocaleString('ko-KR') + '원';

  /* ---------- toast ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2200);
  }

  /* ---------- 1. reveal on scroll ---------- */
  // 첫 화면에 보이는 요소는 그대로 두고, 아래쪽 요소만 스크롤 시 떠오르게
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.remove('is-pending'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('is-pending');
      revealIO.observe(el);
    }
  });

  /* ---------- 2. logo gather ---------- */
  const stage = $('[data-gather]');
  const parts = FRIENDS.map((f, i) => {
    const p = f.part;
    const el = document.createElement('img');
    el.className = 'gather__part';
    el.src = img(f.icon);
    el.alt = `${f.jamo} ${f.name}`;
    el.title = `${f.jamo} = ${f.name} (${f.product})`;
    const fw = p.w + PAD * 2, fh = p.h + PAD * 2; // PNG는 사방 20px 여백 포함
    Object.assign(el.style, {
      left: `${((p.x - PAD) / LOGO_W) * 100}%`,
      top: `${((p.y - PAD) / LOGO_H) * 100}%`,
      width: `${(fw / LOGO_W) * 100}%`,
      transformOrigin: `${(PAD / fw) * 100}% ${(PAD / fh) * 100}%`, // 피그마 회전 기준점(원본 좌상단)
      transitionDelay: `${i * 0.09}s`,
    });
    el.addEventListener('click', () => {
      selectFriend(i);
      $('#friends').scrollIntoView({ behavior: 'smooth' });
    });
    stage.appendChild(el);
    return el;
  });

  function scatter() {
    parts.forEach((el, i) => {
      const angle = (i / parts.length) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 140 + Math.random() * 120; // %
      const dx = Math.cos(angle) * dist, dy = Math.sin(angle) * dist * 0.9;
      const spin = (Math.random() - 0.5) * 120;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = `translate(${dx}%, ${dy}%) rotate(${spin}deg) scale(.6)`;
    });
  }
  function gather() {
    parts.forEach((el, i) => {
      // reflow 후 트랜지션 재활성화
      void el.offsetWidth;
      el.style.transition = '';
      el.style.opacity = '1';
      el.style.transform = `rotate(${FRIENDS[i].part.rot}deg)`;
    });
  }
  scatter();
  const gatherIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { gather(); gatherIO.disconnect(); } });
  }, { threshold: 0.5 });
  gatherIO.observe(stage);
  $('[data-replay]').addEventListener('click', () => { scatter(); requestAnimationFrame(() => requestAnimationFrame(gather)); });

  // 자모 범례
  $('[data-legend]').innerHTML = FRIENDS
    .map((f, i) => `<li><b style="color:${f.color}">${f.jamo}</b><span>${f.name}${i === 6 ? '<br>(받침)' : ''}</span></li>`)
    .join('');

  /* ---------- 3. friend tabs ---------- */
  const tabs = $('[data-tabs]');
  tabs.innerHTML = FRIENDS.map((f, i) => `
    <button class="friend-tab" role="tab" type="button" aria-selected="false" data-i="${i}">
      <img src="${img(f.icon)}" alt=""><span>${f.name}</span>
    </button>`).join('');
  const card = {
    img: $('[data-card-img]'), jamo: $('[data-card-jamo]'), name: $('[data-card-name]'),
    origin: $('[data-card-origin]'), desc: $('[data-card-desc]'),
  };
  function selectFriend(i) {
    const f = FRIENDS[i];
    tabs.querySelectorAll('.friend-tab').forEach((t, j) => t.setAttribute('aria-selected', String(i === j)));
    card.img.style.opacity = '0';
    setTimeout(() => {
      card.img.src = img(f.photo);
      card.img.alt = f.product;
      card.img.style.opacity = '1';
    }, 180);
    card.jamo.textContent = f.jamo;
    card.jamo.style.background = f.color;
    card.name.textContent = `${f.name} 친구 · ${f.product}`;
    card.origin.textContent = f.origin;
    card.desc.textContent = f.desc;
  }
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.friend-tab');
    if (b) selectFriend(Number(b.dataset.i));
  });
  selectFriend(0);

  /* ---------- 4. box list & gallery ---------- */
  $('[data-boxlist]').innerHTML = FRIENDS
    .map((f) => `<li><img src="${img(f.icon)}" alt="">${f.product}</li>`).join('')
    + '<li class="is-card">✉ 친구 소개 카드</li>';

  const shots = FRIENDS.map((f) => ({ src: f.photo, cap: f.product }));
  $('[data-gallery]').innerHTML = shots.map((s, i) => `
    <button type="button" data-shot="${i}" aria-label="${s.cap} 크게 보기">
      <img src="${img(s.src)}" alt="${s.cap}" loading="lazy"><figcaption>${s.cap}</figcaption>
    </button>`).join('');

  const lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]'), lbCap = $('[data-lb-cap]');
  let lbIndex = 0;
  function openLB(i) {
    lbIndex = (i + shots.length) % shots.length;
    lbImg.src = img(shots[lbIndex].src);
    lbImg.alt = shots[lbIndex].cap;
    lbCap.textContent = shots[lbIndex].cap;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLB() { lb.classList.remove('is-open'); document.body.style.overflow = ''; }
  $('[data-gallery]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-shot]');
    if (b) openLB(Number(b.dataset.shot));
  });
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.closest('[data-lb-close]')) closeLB();
    const nav = e.target.closest('[data-lb-nav]');
    if (nav) openLB(lbIndex + Number(nav.dataset.lbNav));
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowRight') openLB(lbIndex + 1);
    if (e.key === 'ArrowLeft') openLB(lbIndex - 1);
  });

  /* ---------- 5. qty & cart ---------- */
  const MIN_QTY = 1, MAX_QTY = 10;
  let qty = 1;
  const qtyOut = $('[data-qty-out]'), total = $('[data-total]');
  function renderQty() { qtyOut.textContent = qty; total.textContent = won(PRICE * qty); }
  document.querySelectorAll('[data-qty]').forEach((b) => b.addEventListener('click', () => {
    const next = qty + Number(b.dataset.qty);
    if (next < MIN_QTY) return toast('최소 1박스부터 담을 수 있어요');
    if (next > MAX_QTY) return toast('한 번에 최대 10박스까지 담을 수 있어요');
    qty = next; renderQty();
  }));
  $('[data-cart]').addEventListener('click', () => toast(`친구들 박스 ${qty}개를 장바구니에 담았어요`));
  renderQty();
})();
