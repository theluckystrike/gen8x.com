/* Color Palette Generator - gen8x.com */
(function() {
  'use strict';

  var currentPalette = null;
  var history = JSON.parse(localStorage.getItem('gen8x_history') || '[]');
  var currentExportTab = 'css';

  var keywordHues = {
    fire: 0, red: 0, rose: 350, cherry: 345, passion: 340,
    orange: 25, sunset: 20, warm: 30, autumn: 35, peach: 15,
    gold: 45, yellow: 55, sun: 50, honey: 42, lemon: 58,
    lime: 80, green: 120, forest: 140, nature: 130, mint: 155, emerald: 145,
    teal: 175, cyan: 185, ocean: 200, sea: 195, water: 205,
    sky: 210, blue: 220, royal: 230, ice: 195, steel: 215,
    indigo: 245, purple: 270, violet: 280, lavender: 260, plum: 290,
    magenta: 300, pink: 330, fuchsia: 315, berry: 310, blush: 340,
    brown: 25, earth: 30, chocolate: 20, rust: 15, coffee: 28,
    night: 240, dark: 240, space: 250, midnight: 235, storm: 220,
    cool: 200, calm: 190, fresh: 160, spring: 110, summer: 45, winter: 210
  };

  function hslToRgb(h, s, l) {
    h = h / 360; s = s / 100; l = l / 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function(c) {
      var hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
  }

  function normHue(h) { return ((h % 360) + 360) % 360; }

  function generatePalette(baseHue, type) {
    var hues = [];
    var baseSat = 65 + Math.random() * 20;
    var baseLit = 50 + Math.random() * 15;

    switch(type) {
      case 'complementary':
        hues = [baseHue, normHue(baseHue + 180), normHue(baseHue + 30), normHue(baseHue + 210), normHue(baseHue + 15)];
        break;
      case 'analogous':
        hues = [normHue(baseHue - 30), normHue(baseHue - 15), baseHue, normHue(baseHue + 15), normHue(baseHue + 30)];
        break;
      case 'triadic':
        hues = [baseHue, normHue(baseHue + 120), normHue(baseHue + 240), normHue(baseHue + 60), normHue(baseHue + 180)];
        break;
      case 'monochromatic':
        hues = [baseHue, baseHue, baseHue, baseHue, baseHue];
        break;
      default:
        hues = [baseHue, normHue(baseHue + 180), normHue(baseHue + 30), normHue(baseHue + 210), normHue(baseHue + 15)];
    }

    var colors = [];
    var sats = type === 'monochromatic' ?
      [baseSat, baseSat - 20, baseSat + 10, baseSat - 10, baseSat + 5] :
      [baseSat, baseSat - 5, baseSat + 5, baseSat - 10, baseSat];
    var lits = type === 'monochromatic' ?
      [30, 42, 55, 68, 82] :
      [baseLit, baseLit + 10, baseLit - 10, baseLit + 20, baseLit - 5];

    for (var i = 0; i < 5; i++) {
      var s = Math.max(20, Math.min(95, sats[i]));
      var l = Math.max(20, Math.min(85, lits[i]));
      var rgb = hslToRgb(hues[i], s, l);
      var hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      colors.push({ h: hues[i], s: s, l: l, r: rgb[0], g: rgb[1], b: rgb[2], hex: hex });
    }
    return colors;
  }

  function getContrastColor(r, g, b) {
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#111111' : '#ffffff';
  }

  function renderPalette(colors) {
    currentPalette = colors;
    var container = document.getElementById('palette-display');
    container.innerHTML = '';
    for (var i = 0; i < colors.length; i++) {
      var c = colors[i];
      var textColor = getContrastColor(c.r, c.g, c.b);
      var swatch = document.createElement('div');
      swatch.className = 'palette-swatch';
      swatch.style.background = c.hex;
      swatch.style.color = textColor;
      swatch.setAttribute('data-hex', c.hex);
      swatch.innerHTML = '<div class="copied-badge">Copied!</div>' +
        '<div class="swatch-info"><div class="hex">' + c.hex.toUpperCase() + '</div>' +
        '<div>RGB: ' + c.r + ', ' + c.g + ', ' + c.b + '</div>' +
        '<div>HSL: ' + c.h + ', ' + c.s + '%, ' + c.l + '%</div></div>';
      swatch.addEventListener('click', (function(hex, el) {
        return function() {
          navigator.clipboard.writeText(hex);
          var badge = el.querySelector('.copied-badge');
          badge.classList.add('show');
          setTimeout(function() { badge.classList.remove('show'); }, 1200);
        };
      })(c.hex.toUpperCase(), swatch));
      container.appendChild(swatch);
    }
    renderPreview(colors);
    renderExport(colors);
    addToHistory(colors);
  }

  function renderPreview(colors) {
    var frame = document.getElementById('mockup-frame');
    var bg = colors[4]; var header = colors[0]; var accent = colors[1];
    var text = colors[3]; var button = colors[2];
    var headerTextColor = getContrastColor(header.r, header.g, header.b);
    var bgTextColor = getContrastColor(bg.r, bg.g, bg.b);
    var btnTextColor = getContrastColor(button.r, button.g, button.b);

    frame.innerHTML = '<div class="mockup-header" style="background:' + header.hex + ';color:' + headerTextColor + '">' +
      '<span>AppName</span><div class="mock-nav"><span>Home</span><span>Features</span><span>Pricing</span></div></div>' +
      '<div class="mockup-body" style="background:' + bg.hex + ';color:' + bgTextColor + '">' +
      '<h2>Welcome to your app</h2>' +
      '<p style="color:' + text.hex + '">This is a preview of your palette applied to a simple UI layout.</p>' +
      '<span class="mockup-btn" style="background:' + button.hex + ';color:' + btnTextColor + '">Get Started</span>' +
      ' <span class="mockup-btn" style="background:transparent;border:1px solid ' + accent.hex + ';color:' + accent.hex + '">Learn More</span></div>';
  }

  function renderExport(colors) {
    var output = document.getElementById('export-code');
    var names = ['primary', 'secondary', 'accent', 'text', 'background'];
    var lines = '';
    switch(currentExportTab) {
      case 'css':
        lines = ':root {\n';
        for (var i = 0; i < 5; i++) lines += '  --color-' + names[i] + ': ' + colors[i].hex + ';\n';
        lines += '}';
        break;
      case 'tailwind':
        lines = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
        for (var j = 0; j < 5; j++) lines += '        ' + names[j] + ': \'' + colors[j].hex + '\',\n';
        lines += '      }\n    }\n  }\n}';
        break;
      case 'scss':
        for (var k = 0; k < 5; k++) lines += '$color-' + names[k] + ': ' + colors[k].hex + ';\n';
        break;
      case 'json':
        var obj = {};
        for (var l = 0; l < 5; l++) {
          obj[names[l]] = { hex: colors[l].hex, rgb: 'rgb('+colors[l].r+','+colors[l].g+','+colors[l].b+')', hsl: 'hsl('+colors[l].h+','+colors[l].s+'%,'+colors[l].l+'%)' };
        }
        lines = JSON.stringify(obj, null, 2);
        break;
    }
    output.textContent = lines;
  }

  function addToHistory(colors) {
    var entry = colors.map(function(c) { return c.hex; });
    history.unshift(entry);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('gen8x_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    var container = document.getElementById('history-list');
    container.innerHTML = '';
    for (var i = 0; i < history.length; i++) {
      var item = document.createElement('div');
      item.className = 'history-item';
      for (var j = 0; j < history[i].length; j++) {
        var d = document.createElement('div');
        d.style.background = history[i][j];
        item.appendChild(d);
      }
      item.addEventListener('click', (function(entry) {
        return function() {
          var colors = entry.map(function(hex) {
            var rgb = hexToRgb(hex);
            var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
            return { h: hsl[0], s: hsl[1], l: hsl[2], r: rgb[0], g: rgb[1], b: rgb[2], hex: hex };
          });
          renderPalette(colors);
        };
      })(history[i]));
      container.appendChild(item);
    }
  }

  function getSelectedType() {
    var radios = document.querySelectorAll('input[name="palette-type"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return 'complementary';
  }

  window.gen8x = {
    generateRandom: function() {
      var hue = Math.floor(Math.random() * 360);
      renderPalette(generatePalette(hue, getSelectedType()));
    },
    generateFromHex: function() {
      var input = document.getElementById('hex-input').value.trim();
      if (!/^#?[0-9a-fA-F]{3,6}$/.test(input)) return;
      var rgb = hexToRgb(input);
      var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      renderPalette(generatePalette(hsl[0], getSelectedType()));
    },
    generateFromKeyword: function() {
      var word = document.getElementById('keyword-input').value.trim().toLowerCase();
      var hue = keywordHues[word];
      if (hue === undefined) hue = Math.abs(word.split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0)) % 360;
      renderPalette(generatePalette(hue, getSelectedType()));
    },
    switchExportTab: function(tab, btn) {
      currentExportTab = tab;
      var tabs = document.querySelectorAll('.export-tab');
      for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
      btn.classList.add('active');
      if (currentPalette) renderExport(currentPalette);
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    renderHistory();
    gen8x.generateRandom();
  });
})();
