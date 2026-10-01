/* ============================================================
 * DS桌宠 · 官网脚本
 *   1) 下载链接集中配置（改 LINKS 就行）
 *   2) 滚动渐入渐出：.reveal → is-in（进）/ is-out（往上滑出去）
 *   3) 试玩区滚出屏幕就隐藏，别在后台白烧 CPU
 * ============================================================ */
(function () {
  'use strict';

  /* ============ 1. 下载链接：只改这里 ============ */

  var LINKS = {
    // vivo 应用商店的应用详情页地址
    android: 'https://h5coml.vivo.com.cn/h5coml/appdetail_h5/browser_v2/index.html?appId=5259965&resource=301&source=7',
    // 安卓 APK 直链（可选；填了的话，安卓卡片会多一句「或直接下载 APK」）
    apk: '',
    // iOS 版：GitHub 上的未签名 IPA（已可用）
    ios: 'https://github.com/eazy-gyz/dspet-ios/releases/latest',
    // 网页版
    web: 'pet/index.html'
  };

  function applyLinks() {
    var nodes = document.querySelectorAll('[data-link]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-link');
      var url = LINKS[key];
      if (url) {
        el.setAttribute('href', url);
        if (/^https?:/i.test(url)) {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener');
        }
      } else {
        // 还没填 → 变灰并指到下载区（那里写着「去应用商店搜 DS桌宠」）
        el.classList.add('is-disabled');
        el.setAttribute('href', '#download');
        el.setAttribute('aria-disabled', 'true');
      }
    }

    var note = document.querySelector('[data-note="android"]');
    if (note) {
      note.textContent = LINKS.android
        ? (LINKS.apk ? '也可以直接下载 APK 安装包' : '')
        : '暂时还没填商店链接 · 可以在你手机的应用商店里搜「DS桌宠」';
    }
  }

  /* ============ 2. 滚动渐入渐出 ============ */

  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) {
          el.classList.remove('is-out');
          el.classList.add('is-in');
          el.dataset.seen = '1';                 // 露过脸了，之后才允许「渐出」
        } else if (el.dataset.seen === '1') {
          if (e.boundingClientRect.top < 0) {
            // 往上滑出屏幕 → 淡出
            el.classList.add('is-out');
            el.classList.remove('is-in');
          } else {
            // 又滑回下面 → 复位，等下次再渐入
            el.classList.remove('is-in');
            el.classList.remove('is-out');
          }
        }
      });
    }, { rootMargin: '-6% 0px -10% 0px', threshold: 0.01 });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ============ 3. 导航状态 + 试玩区 ============ */

  function setupPlayground() {
    var frame = document.querySelector('.playground-frame');
    var box = document.querySelector('.playground');
    var toggle = document.getElementById('playToggle');
    if (!frame || !box) return;

    // 按框的实际宽度算她该多大（手机上不能比框还宽），再乘 0.5 缩小一倍
    var w = frame.clientWidth || box.clientWidth || 900;
    var scale = Math.max(0.42, Math.min(0.62, (w / 780) * 0.5));
    frame.src = (frame.getAttribute('data-src') || 'pet/index.html') +
                '?scale=' + scale.toFixed(2);

    // 默认不接管鼠标/手指，点「开始试玩」才让她接管
    if (toggle) {
      toggle.addEventListener('click', function () {
        var live = box.classList.toggle('is-live');
        toggle.textContent = live ? '退出试玩' : '开始试玩';
      });
    }

    // 滚出屏幕就把 iframe 藏起来 —— 浏览器不渲染它，她也就"暂停"了
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          frame.style.visibility = e.isIntersecting ? 'visible' : 'hidden';
        });
      }, { threshold: 0 });
      io.observe(frame);
    }
  }

  function setupNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var update = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function boot() {
    applyLinks();
    setupReveal();
    setupNav();
    setupPlayground();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
