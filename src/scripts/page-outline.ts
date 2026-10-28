export function createHeadingId(text: string, usedIds: Set<string>): string {
  const base = text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

export function getActiveHeadingIndex(tops: number[], activationLine: number, atBottom: boolean): number {
  if (tops.length === 0) return -1;
  if (atBottom) return tops.length - 1;
  let active = 0;
  for (let i = 0; i < tops.length; i++) {
    if (tops[i] <= activationLine) active = i;
  }
  return active;
}

export function initPageOutline() {
  const sidebar = document.getElementById('sidebar');
  const shell = document.getElementById('page-shell');
  const edgeToggle = document.querySelector<HTMLButtonElement>('#sidebar-edge-toggle');
  const main = document.getElementById('page-viewport');
  const content = document.getElementById('page-content');
  const outline = document.getElementById('page-outline');
  const chrome = document.getElementById('outline-chrome');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.querySelector<HTMLButtonElement>('#tree-toggle');
  const close = document.querySelector<HTMLButtonElement>('#outline-close');
  if (!sidebar || !shell || !edgeToggle || !main || !content || !outline || !toggle) return;

  const headings = Array.from(content.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'))
    .filter((heading) => heading.textContent?.trim() && !heading.closest('[hidden], [data-toc-ignore]'));
  const headingSet = new Set<Element>(headings);
  const existingElements = Array.from(document.querySelectorAll('[id]'));
  // Reserve explicit anchors before generating any IDs, even on later headings.
  const usedIds = new Set(existingElements.map((element) => element.id));
  const claimedIds = new Set(existingElements.filter((element) => !headingSet.has(element)).map((element) => element.id));
  const minimumLevel = Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))));
  const list = document.createElement('ol');
  list.className = 'outline-list';
  const links = headings.map((heading) => {
    const title = heading.textContent!.trim();
    if (!heading.id || claimedIds.has(heading.id)) heading.id = createHeadingId(title, usedIds);
    claimedIds.add(heading.id);
    heading.tabIndex = -1;

    const depth = Number(heading.tagName.slice(1)) - minimumLevel;
    const item = document.createElement('li');
    item.style.paddingInlineStart = `${depth * 16}px`;
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.className = 'outline-link';
    const icon = document.createElement('img');
    icon.src = `/images/ui/${depth === 0 ? 'asm' : depth === 1 ? 'part' : 'feature'}-icon.png`;
    if (depth >= 2) icon.className = 'outline-feature-icon';
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = title;
    link.append(icon, label);
    item.append(link);
    list.append(item);
    return link;
  });

  outline.replaceChildren(...(headings.length ? [list] : []));
  outline.hidden = headings.length === 0;
  if (chrome) chrome.hidden = headings.length === 0;
  toggle.disabled = headings.length === 0;

  const desktop = window.matchMedia('(min-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let desktopExpanded = true;
  let drawerOpen = false;
  let drawerTrigger: HTMLButtonElement = toggle;
  let activeIndex = -1;
  let frame = 0;
  let pointer: { x: number; y: number } | null = null;
  let revealHeld = false;
  let revealTimer: number | undefined;

  function updateEdgeReveal() {
    const pane = shell!.getBoundingClientRect();
    const open = desktop.matches ? desktopExpanded : drawerOpen;
    const edge = open ? sidebar!.getBoundingClientRect().right : pane.left;
    const reveal = pointer !== null && pointer.x >= pane.left && pointer.x <= edge + 24
      && pointer.y >= pane.top && pointer.y <= pane.bottom;
    shell!.dataset.sidebarReveal = String(revealHeld || reveal);
  }

  function trackPointer(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    updateEdgeReveal();
  }

  shell.addEventListener('pointerenter', trackPointer, { passive: true });
  shell.addEventListener('pointermove', trackPointer, { passive: true });
  shell.addEventListener('pointerleave', () => {
    pointer = null;
    updateEdgeReveal();
  });

  function updateSidebar() {
    const open = desktop.matches ? desktopExpanded : drawerOpen;
    const wasOpen = shell!.dataset.sidebarOpen === 'true';
    if (open || wasOpen) {
      window.clearTimeout(revealTimer);
      revealTimer = undefined;
      revealHeld = false;
    }
    if (wasOpen && !open) {
      revealHeld = true;
      // Keep the reopen tab visible for 0.75 seconds after the 180ms slide.
      revealTimer = window.setTimeout(() => {
        revealHeld = false;
        revealTimer = undefined;
        updateEdgeReveal();
      }, 930);
    }
    shell!.dataset.sidebarOpen = String(open);
    sidebar!.classList.toggle('-translate-x-full', !drawerOpen);
    backdrop?.classList.toggle('hidden', desktop.matches || !drawerOpen);
    toggle!.setAttribute('aria-expanded', String(open));
    edgeToggle!.setAttribute('aria-expanded', String(open));
    edgeToggle!.setAttribute('aria-label', open ? 'Collapse sidebar' : 'Expand sidebar');
    edgeToggle!.title = open ? 'Collapse sidebar' : 'Expand sidebar';
    if (!open && sidebar!.contains(document.activeElement)) edgeToggle!.focus();
    sidebar!.inert = !open;
    updateEdgeReveal();
    scheduleUpdate();
  }

  function setDrawer(open: boolean, restoreFocus = false) {
    drawerOpen = open && !desktop.matches;
    updateSidebar();
    if (drawerOpen) {
      if (headings.length) close?.focus();
      else edgeToggle!.focus();
    }
    else if (restoreFocus) drawerTrigger.focus();
  }

  updateSidebar();
  toggle.addEventListener('click', () => {
    drawerTrigger = toggle;
    setDrawer(!drawerOpen);
  });
  edgeToggle.addEventListener('click', () => {
    if (desktop.matches) {
      desktopExpanded = !desktopExpanded;
      updateSidebar();
    } else {
      drawerTrigger = edgeToggle;
      setDrawer(!drawerOpen);
    }
  });
  close?.addEventListener('click', () => setDrawer(false, true));
  backdrop?.addEventListener('click', () => setDrawer(false, true));
  desktop.addEventListener('change', () => setDrawer(false));
  document.addEventListener('keydown', (event) => {
    if (!drawerOpen) return;
    if (event.key === 'Escape') setDrawer(false, true);
    if (event.key === 'Tab') {
      const first = headings.length ? close ?? links[0] : edgeToggle;
      const last = edgeToggle;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  if (headings.length === 0) return;

  function updateActiveHeading() {
    frame = 0;
    const activationLine = main!.getBoundingClientRect().top + Math.min(72, main!.clientHeight * 0.2);
    const atBottom = main!.scrollHeight > main!.clientHeight + 1
      && main!.scrollTop + main!.clientHeight >= main!.scrollHeight - 2;
    const index = getActiveHeadingIndex(headings.map((heading) => heading.getBoundingClientRect().top), activationLine, atBottom);
    if (index !== activeIndex) {
      links[activeIndex]?.removeAttribute('aria-current');
      links[index].setAttribute('aria-current', 'location');
      activeIndex = index;
    }

    // Keep long outlines readable without scrolling the page or moving focus.
    if ((desktop.matches && desktopExpanded) || drawerOpen) {
      const item = links[index].getBoundingClientRect();
      const pane = sidebar!.getBoundingClientRect();
      if (item.top < pane.top + 28) sidebar!.scrollTop += item.top - pane.top - 28;
      else if (item.bottom > pane.bottom) sidebar!.scrollTop += item.bottom - pane.bottom;
    }
  }

  function scheduleUpdate() {
    if (headings.length && !frame) frame = requestAnimationFrame(updateActiveHeading);
  }

  function scrollToHeading(heading: HTMLElement, smooth: boolean) {
    const top = heading.getBoundingClientRect().top - main!.getBoundingClientRect().top + main!.scrollTop - 24;
    main!.scrollTo({ top: Math.max(0, top), behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' });
    scheduleUpdate();
  }

  links.forEach((link, index) => link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
    setDrawer(false);
    headings[index].focus({ preventScroll: true });
    scrollToHeading(headings[index], true);
  }));

  function followHash() {
    let id: string;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch { return; }
    const heading = headings.find((item) => item.id === id);
    if (heading) scrollToHeading(heading, false);
    else if (!id) main!.scrollTo({ top: 0, behavior: 'instant' });
  }

  main.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('hashchange', followHash);
  const resizeObserver = new ResizeObserver(scheduleUpdate);
  resizeObserver.observe(main);
  resizeObserver.observe(content);
  document.fonts?.ready.then(scheduleUpdate);
  if (window.location.hash) followHash();
  scheduleUpdate();
}
