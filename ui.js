// ui.js: 处理UI交互、DOM元素获取和视觉更新。

// 集中管理所有需要操作的DOM元素
const uiElements = {
    // 按钮
    themeToggleButton: document.getElementById('theme-toggle-btn'),
    langSelectBtn: document.getElementById('lang-select-btn'),
    openFiltersBtn: document.getElementById('open-filters-btn'),
    shareFavoritesBtn: document.getElementById('share-favorites-btn'),
    openFavoritesBtn: document.getElementById('open-favorites-btn'),
    openGameHeroesBtn: document.getElementById('open-game-heroes-btn'),
    eva1ImporterInput: document.getElementById('eva1-importer-input'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    advancedFilterHelpBtn: document.getElementById('advanced-filter-help-btn'),
    lbTalentHelpBtn: document.getElementById('lb-talent-help-btn'),
    exportSettingsBtn: document.getElementById('export-settings-btn'),
    importSettingsBtn: document.getElementById('import-settings-btn'),

    // 视图切换按钮
    showWantedMissionBtn: document.getElementById('show-wanted-mission-btn'),
    showFarmingGuideBtn: document.getElementById('show-farming-guide-btn'),
    showTeamSimulatorBtn: document.getElementById('show-team-simulator-btn'),
    showRedeemCodesBtn: document.getElementById('show-redeem-codes-btn'),

    // 容器与视图
    resultsWrapper: document.getElementById('results-wrapper'),
    resultsHeader: document.querySelector('.results-header'),
    resultsCountEl: document.getElementById('results-count'),
    heroTableView: document.getElementById('hero-table-view'),
    heroCardView: document.getElementById('hero-card-view'),
    heroViewSwitch: document.querySelector('.hero-view-switch'),
    heroCardZoom: document.getElementById('hero-card-zoom'),
    heroCardZoomRange: document.getElementById('hero-card-zoom-range'),
    heroCardZoomValue: document.getElementById('hero-card-zoom-value'),
    wantedMissionView: document.getElementById('wanted-mission-view'),
    farmingGuideView: document.getElementById('farming-guide-view'),
    chatSimulatorView: document.getElementById('chat-simulator-view'),
    teamSimulatorWrapper: document.getElementById('team-simulator-wrapper'),
    lotterySimulatorWrapper: document.getElementById('lottery-simulator-wrapper'),

    // 表格
    heroTable: document.getElementById('hero-table'),
    wantedMissionTable: document.getElementById('wanted-mission-table'),
    farmingGuideTable: document.getElementById('farming-guide-table'),

    // 语言选项
    langOptions: document.getElementById('lang-options'),

    // 模态框 (Modal)
    modal: document.getElementById('modal'),
    modalContent: document.getElementById('modal-content'),
    filtersModal: document.getElementById('filters-modal'),
    closeFiltersModalBtn: document.getElementById('close-filters-modal-btn'),
    helpModal: document.getElementById('help-modal'),
    lbTalentHelpModal: document.getElementById('lb-talent-help-modal'),
    multiSelectModal: document.getElementById('multi-select-modal'),
    exportSettingsModal: document.getElementById('export-settings-modal'),
    importSettingsModal: document.getElementById('import-settings-modal'),
    summonSummaryModal: document.getElementById('summon-summary-modal'),
    redeemCodesModal: document.getElementById('redeem-codes-modal'),

    // 筛选器输入框 (在filters.js中定义并赋值)
    filterInputs: {},

    // 其他
    pageLoader: document.getElementById('page-loader-overlay'),
    headerInfoContainer: document.querySelector('.header-info-container'),
    donationlistcontainer:document.querySelector('.donation-list-container-wrapper'),
    teamDisplayGrid: document.getElementById('team-display-grid'),
    myTeamsTabBtn: document.getElementById('tab-my-teams'),
    sharedTeamsTabBtn: document.getElementById('tab-shared-teams'),
};

/** 站点语言码 → `og:locale`（Open Graph 用下划线形式）。 */
const OG_LOCALE = {
    cn: 'zh_CN', tc: 'zh_TW', en: 'en_US', ja: 'ja_JP', ko: 'ko_KR', fr: 'fr_FR',
    de: 'de_DE', es: 'es_ES', pt: 'pt_PT', it: 'it_IT', ru: 'ru_RU', ar: 'ar_SA',
    tr: 'tr_TR', pl: 'pl_PL', nl: 'nl_NL', sv: 'sv_SE', da: 'da_DK', no: 'nb_NO',
    fi: 'fi_FI', id: 'id_ID'
};

/** SEO 站点根（canonical / og:url / hreflang 都基于它）。 */
const SEO_ORIGIN = 'https://heroplan.github.io/';

/**
 * 应用指定的语言到整个页面。
 * @param {string} lang - 语言代码 ('cn', 'tc', 'en')。
 */
function applyLanguage(lang) {
    // 1. 设置 HTML 语言属性
    switch (lang) {
        // 中文按**书写系统**声明（与 index.html 的 hreflang `zh-Hans`/`zh-Hant` 一致）：
        // `zh-Hans` 覆盖所有简体用户，`zh-Hant` 覆盖港/澳/台等所有繁体用户，比 `zh-CN`/`zh-HK` 更准确。
        case 'cn':
            document.documentElement.lang = 'zh-Hans';
            break;
        case 'tc':
            document.documentElement.lang = 'zh-Hant';
            break;
        case 'en':
            document.documentElement.lang = 'en';
            break;
        case 'ja':
            document.documentElement.lang = 'ja';
            break;
        case 'ko':
            document.documentElement.lang = 'ko';
            break;
        case 'fr':
            document.documentElement.lang = 'fr';
            break;
        case 'de':
            document.documentElement.lang = 'de';
            break;
        case 'es':
            document.documentElement.lang = 'es';
            break;
        case 'pt':
            document.documentElement.lang = 'pt';
            break;
        case 'it':
            document.documentElement.lang = 'it';
            break;
        case 'ru':
            document.documentElement.lang = 'ru';
            break;
        case 'ar':
            document.documentElement.lang = 'ar';
            break;
        case 'tr':
            document.documentElement.lang = 'tr';
            break;
        case 'pl':
            document.documentElement.lang = 'pl';
            break;
        case 'nl':
            document.documentElement.lang = 'nl';
            break;
        case 'sv':
            document.documentElement.lang = 'sv';
            break;
        case 'da':
            document.documentElement.lang = 'da';
            break;
        case 'no':
            document.documentElement.lang = 'no';
            break;
        case 'fi':
            document.documentElement.lang = 'fi';
            break;
        case 'id':
            document.documentElement.lang = 'id';
            break;
        default:
            document.documentElement.lang = 'en';
            break;
    }

    // 1.5 书写方向：RTL 语言（阿拉伯语等）⇒ `<html dir="rtl">`，其余 `ltr`。
    //     20 种语言里只有 `ar` 是 RTL；多列几个常见 RTL 码以防以后加语言。
    //     ⚠ 只设 `dir` 不够：CSS 里写死的 `padding-left` / `margin-left` / `border-left` / `left:`
    //       等**物理属性不会自动镜像** ⇒ style.css 末尾有一整段 `html[dir="rtl"]` 覆盖。
    const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'yi'];
    const dir = RTL_LANGS.indexOf(lang) >= 0 ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('data-dir', dir);

    // 1.6 页头「赞助 / 制作」块的最小高度按语言给：CJK 四门只排 1 行（24px），其余排 3 行（60px）。
    //     语言页由 build_lang_pages 在构建期写死（首帧即终态）；这里管运行时切语言。
    const HEADER_INFO_ONE_LINE = ['cn', 'tc', 'ja', 'ko'];
    document.documentElement.style.setProperty(
        '--header-info-min-height',
        HEADER_INFO_ONE_LINE.indexOf(lang) >= 0 ? '24px' : '60px'
    );

    document.body.setAttribute('data-lang', lang);

    // 2. 更新状态和页面标题
    state.currentLang = lang;
    // i18n 由 langs.js 的 Lang.loadAll() 异步载入 ⇒ 首次调用（数据加载前）可能还没有字典：
    // 这里容错成空对象，只设状态；loadData 完成后 main.js 会再调一次把文案真正套上。
    const langDict = i18n[lang] || i18n.cn || {};
    if (langDict.pageTitle) document.title = langDict.pageTitle;

    // 3. 通用文本/属性更新逻辑
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');

        // 3.1 特殊处理 H1 里的链接
        if (key === 'headerTitle' && el.tagName === 'H1') {
            const link = el.querySelector('a');
            if (link && langDict[key] !== undefined && link.textContent !== langDict[key]) link.textContent = langDict[key];
            return; // 处理完直接跳过后续逻辑
        }

        const translation = langDict[key];

        // 3.2 正常的翻译应用逻辑
        if (translation !== undefined && typeof translation !== 'function') {

            if (el.tagName === 'SELECT') {
                // 如果是 Select 标签，我们通常是想修改它的 title 提示，而不是内容
                // 如果修改 innerHTML 会导致下拉选项消失
                el.setAttribute('title', translation);
            }
            else if (el.tagName === 'OPTION') {
                // Option 标签修改文本
                if (el.textContent !== translation) el.textContent = translation;
            }
            else if (String(translation).indexOf('<') >= 0) {
                // 富文本条目（少数）才走 HTML 解析；纯文本用 textContent，
                // 否则每次套文案 ~180 个条目各触发一次 ParseHTML（移动端实测数百毫秒长任务）。
                if (el.innerHTML !== translation) el.innerHTML = translation;
            }
            else if (el.textContent !== translation) {
                el.textContent = translation;
            }
        }
    });

    // 4. 处理 Placeholder (输入框占位符)
    document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-key-placeholder');
        if (langDict[key]) el.placeholder = langDict[key];
    });

    // 4.1 处理 Title / Aria-label（图标类按钮内部只有符号，可访问名与提示都要过字典）
    document.querySelectorAll('[data-lang-key-title]').forEach(el => {
        const key = el.getAttribute('data-lang-key-title');
        const translation = langDict[key];
        if (!translation) return;
        el.title = translation;
        if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', translation);
    });

    // 5. 处理特定 ID 的 Title (工具栏按钮等)
    const titles = {
        'theme-toggle-btn': 'themePickerTitle',
        'lang-select-btn': 'toggleLanguageTitle',
        'show-wanted-mission-btn': 'showWantedMissionTitle',
        'open-filters-btn': 'openFiltersTitle',
        'calendar-btn': 'calendarTitle',
        'close-filters-modal-btn': 'closeBtnTitle',
        'advanced-filter-help-btn': 'filterSyntaxTitle',
        'show-lottery-simulator-btn': 'showLotterySimulatorTitle',
        'show-team-simulator-btn': 'showTeamSimulatorTitle',
        'show-chat-simulator-btn': 'showChatSimulatorTitle',
        'show-farming-guide-btn': 'showFarmingGuideTitle',
        'show-redeem-codes-btn': 'showRedeemCodesTitle',
        'toggle-animation-btn': 'toggleAnimationTitle',
        'toggle-sound-btn': 'toggleSoundTitle'
    };

    for (const id in titles) {
        const element = document.getElementById(id);
        if (element && langDict[titles[id]]) {
            element.title = langDict[titles[id]];
            element.setAttribute('aria-label', langDict[titles[id]]);
        }
    }
    // 上面的循环会把"返回"提示覆盖回普通标题：视图按钮处于红态时按当前视图状态重同步
    if (typeof refreshMainViewButtons === 'function') refreshMainViewButtons();

    // 5.1 「活动日历」：直接跳 EP-BASE 的同语言当月月历。
    //     站点码与 EP-BASE locale 只差中文两码；月份用本机当前年月
    //     （`/calendar/<YYYYMM>` 只认已发布的月份，更早的会 404）。
    const calendarBtn = document.getElementById('calendar-btn');
    if (calendarBtn) {
        const EPBASE_LOCALE = { cn: 'zh_CN', tc: 'zh_TW' };
        const now = new Date();
        const ym = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0');
        calendarBtn.href = 'https://ep-base.com/' + (EPBASE_LOCALE[lang] || lang) + '/calendar/' + ym;
    }

    // 6. SEO：Meta Description + canonical + Open Graph / Twitter
    //
    // ⚠ 多语言 SEO 的关键：20 个语言版各有**独立静态入口** `/<码>/`（见 index.html 的
    //   `rel="alternate" hreflang`），每个语言版必须
    //   **把 canonical 指向自身路径**；若一律指向站点根，Google 会把 20 个版本判成
    //   同一页面、hreflang 注解随之失效。
    //   ⚠ canonical 跟随**地址路径**（可抓取的那个实体），不是 cookie 推导出的渲染语言：
    //     根页 `/` 是 x-default，即便回访 cookie 渲染成简中，canonical 仍自指根；
    //     语言页 `/<码>/` 自指该路径。切换语言时 syncLanguageUrl 已先把路径改好。
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc && langDict.metaDescription) metaDesc.setAttribute('content', langDict.metaDescription);

    const _setAttr = (id, attr, val) => {
        const el = document.getElementById(id);
        if (el && val) el.setAttribute(attr, val);
    };
    const pathLang = (typeof Lang !== 'undefined' && Lang.langFromPath) ? Lang.langFromPath(window.location.pathname) : null;
    const canonicalUrl = pathLang ? SEO_ORIGIN + pathLang + '/' : SEO_ORIGIN;
    const seoTitle = langDict.pageTitle || document.title;
    const seoDesc = langDict.metaDescription || '';

    _setAttr('canonical-link', 'href', canonicalUrl);
    _setAttr('og-url', 'content', canonicalUrl);
    _setAttr('og-title', 'content', seoTitle);
    _setAttr('og-description', 'content', seoDesc);
    _setAttr('og-locale', 'content', OG_LOCALE[lang] || lang);
    _setAttr('tw-title', 'content', seoTitle);
    _setAttr('tw-description', 'content', seoDesc);

    // 主题弹层里的 5 个名称跟随界面语言（cn/tc 用中文名，其余用英文名）。
    if (typeof renderThemePickerOptions === 'function') renderThemePickerOptions();
}

/**
 * 应用指定的主题（亮色/暗色）。
 * @param {string} theme - 'light' 或 'dark'。
 */
function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark-theme');
    else document.documentElement.classList.remove('dark-theme');
    updateThemePickerUI();
}

/**
 * 切换并保存主题。
 */
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    setCookie('theme', newTheme, 365);
}

/* ── MD3 配色主题（配置驱动） ─────────────────────────────────────────
   theme.css 中的 `html.theme-<id>` 负责实际色值；这里只管选择、持久化
   和主题弹层 UI。固定语义色（辉光/词条）不随这里切换。 */
const MD3_THEME_DATA = window.HEROPLAN_MD3_THEMES || null;
const MD3_THEME_NAME_TC = {
    'classic-blue': '經典',
    'holy': '神聖',
    'dark': '暗黑',
    'fire': '烈火',
    'nature': '自然',
    'ice': '冰雪',
    'aurora-indigo': '極光靛藍',
    'ocean-teal': '深海青藍',
    'soft-violet': '柔和紫羅蘭',
    'rose-quartz': '玫瑰石英',
    'graphite-blue': '石墨藍灰'
};

function currentMdThemeId() {
    const themes = MD3_THEME_DATA && MD3_THEME_DATA.themes;
    const fallback = (MD3_THEME_DATA && MD3_THEME_DATA.defaultTheme) || 'classic-blue';
    const current = document.documentElement.getAttribute('data-md-theme');
    return (themes && Object.prototype.hasOwnProperty.call(themes, current)) ? current : fallback;
}

function currentUiLang() {
    return (typeof state !== 'undefined' && state.currentLang) ? state.currentLang : 'cn';
}

function mdThemeDisplayName(themeId, theme) {
    const lang = currentUiLang();
    const localized = theme.nameI18n && theme.nameI18n[lang];
    if (localized) return localized;
    if (lang === 'cn') return theme.nameZh || theme.name || themeId;
    if (lang === 'tc') return MD3_THEME_NAME_TC[themeId] || theme.nameZh || theme.name || themeId;
    return theme.name || themeId;
}

function mdThemeSecondaryName(themeId, theme) {
    const lang = currentUiLang();
    if (lang === 'cn' || lang === 'tc') return theme.name || 'Material 3';
    return 'Material 3';
}

function renderThemePickerOptions() {
    const list = document.getElementById('theme-picker-list');
    const themes = MD3_THEME_DATA && MD3_THEME_DATA.themes;
    if (!list || !themes) return;

    const current = currentMdThemeId();
    list.innerHTML = '';
    Object.entries(themes).forEach(([themeId, theme]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'theme-option';
        button.dataset.themeId = themeId;
        button.setAttribute('aria-pressed', String(themeId === current));

        const preview = document.createElement('span');
        preview.className = 'theme-option-preview';
        preview.setAttribute('aria-hidden', 'true');
        preview.innerHTML =
            '<span class="theme-option-half" style="background:' + theme.light.background + '">' +
                '<i style="background:' + theme.light.primary + '"></i>' +
            '</span>' +
            '<span class="theme-option-half" style="background:' + theme.dark.background + '">' +
                '<i style="background:' + theme.dark.primary + '"></i>' +
            '</span>';

        const copy = document.createElement('span');
        copy.className = 'theme-option-copy';
        const strong = document.createElement('strong');
        strong.textContent = mdThemeDisplayName(themeId, theme);
        const small = document.createElement('small');
        small.textContent = mdThemeSecondaryName(themeId, theme);
        copy.appendChild(strong);
        copy.appendChild(small);

        const check = document.createElement('span');
        check.className = 'theme-option-check';
        check.setAttribute('aria-hidden', 'true');
        check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m5 12 4 4L19 6"/></svg>';

        button.appendChild(preview);
        button.appendChild(copy);
        button.appendChild(check);

        button.addEventListener('click', () => applyColorTheme(themeId));
        list.appendChild(button);
    });
}

function updateThemePickerUI() {
    const menu = document.getElementById('theme-picker-menu');
    if (!menu) return;
    const isDark = document.documentElement.classList.contains('dark-theme');
    menu.querySelectorAll('[data-theme-mode]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.themeMode === (isDark ? 'dark' : 'light')));
    });
    const current = currentMdThemeId();
    menu.querySelectorAll('.theme-option').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.themeId === current));
    });
}

/**
 * 把固定定位的主题弹层夹在视口内：
 * 优先与按钮右缘对齐，空间不够就向左收；下方不够高时翻到按钮上方。
 */
function positionThemePickerMenu() {
    const menu = document.getElementById('theme-picker-menu');
    const button = document.getElementById('theme-toggle-btn');
    if (!menu || !button || menu.classList.contains('hidden')) return;
    const margin = 8;
    const width = Math.min(320, window.innerWidth - margin * 2);
    menu.style.width = width + 'px';
    const rect = button.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;
    let left = document.documentElement.dir === 'rtl' ? rect.left : rect.right - width;
    const maxLeft = window.innerWidth - width - margin;
    if (left < margin) left = Math.min(Math.max(rect.left, margin), maxLeft);
    left = Math.max(margin, Math.min(left, maxLeft));
    let top = rect.bottom + 10;
    if (top + menuHeight > window.innerHeight - margin) {
        top = Math.max(margin, rect.top - menuHeight - 10);
    }
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
}

function applyColorTheme(themeId, persist = true) {
    const themes = MD3_THEME_DATA && MD3_THEME_DATA.themes;
    if (!themes) return;
    const fallback = MD3_THEME_DATA.defaultTheme || 'aurora-indigo';
    const next = Object.prototype.hasOwnProperty.call(themes, themeId) ? themeId : fallback;

    Object.keys(themes).forEach(id => {
        document.documentElement.classList.toggle('theme-' + id, id === next);
    });
    document.documentElement.setAttribute('data-md-theme', next);
    if (persist && typeof setCookie === 'function') setCookie('md_theme', next, 365);
    updateThemePickerUI();
}

function setThemeMode(mode, persist = true) {
    const next = mode === 'dark' ? 'dark' : 'light';
    applyTheme(next);
    if (persist && typeof setCookie === 'function') setCookie('theme', next, 365);
}

function toggleThemePicker(force) {
    const menu = document.getElementById('theme-picker-menu');
    const button = document.getElementById('theme-toggle-btn');
    if (!menu || !button) return;
    const willOpen = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
    if (willOpen) {
        renderThemePickerOptions();
        updateThemePickerUI();
        menu.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
        positionThemePickerMenu();
    } else {
        menu.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
    }
}

function closeThemePicker() {
    toggleThemePicker(false);
}
// 给 main.js 的其它弹层用（如语言下拉展开时要顺手收起配色弹层）
window.closeThemePicker = closeThemePicker;

function setupThemePicker() {
    const container = document.querySelector('.theme-picker-container');
    const button = document.getElementById('theme-toggle-btn');
    const menu = document.getElementById('theme-picker-menu');
    if (!container || !button || !menu) return;

    // Firefox: header-buttons 上的 translateY 会让 position:fixed 的弹层相对它定位。
    // 把弹层挂到 body，保证所有浏览器都按视口定位。
    if (menu.parentElement !== document.body) document.body.appendChild(menu);

    button.addEventListener('click', event => {
        event.stopPropagation();
        // 打开配色弹层前先收起语言下拉，避免两个弹层叠在一起
        const langList = document.getElementById('lang-options');
        if (langList && !langList.classList.contains('hidden')) langList.classList.add('hidden');
        toggleThemePicker();
    });

    const closeButton = document.getElementById('theme-picker-close');
    if (closeButton) {
        closeButton.addEventListener('click', event => {
            event.stopPropagation();
            closeThemePicker();
            button.focus();
        });
    }

    menu.addEventListener('click', event => {
        event.stopPropagation();
        const modeButton = event.target.closest('[data-theme-mode]');
        if (modeButton) {
            setThemeMode(modeButton.dataset.themeMode);
            return;
        }
        const themeButton = event.target.closest('.theme-option');
        if (themeButton) {
            applyColorTheme(themeButton.dataset.themeId);
        }
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.theme-picker-container')) closeThemePicker();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !menu.classList.contains('hidden')) {
            closeThemePicker();
            button.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (!menu.classList.contains('hidden')) positionThemePickerMenu();
    });
    window.addEventListener('scroll', () => {
        if (!menu.classList.contains('hidden')) closeThemePicker();
    }, { passive: true });

    // 首屏快照如果已经有早期脚本写入的 class，这里补齐所有主题 class 并同步 UI。
    applyColorTheme(currentMdThemeId(), false);
    renderThemePickerOptions();
    updateThemePickerUI();
}

setupThemePicker();

/**
 * 同步 URL 到当前语言的路径版 `/<码>/`（canonical 自指 / hreflang / 刷新都依赖它）。
 * ⚠ 不重载的前提下必须自己改，否则刷新或分享出去的还是旧语言。
 *   只改路径 + 摘掉遗留的 `lang`/`hl` 参数，业务参数（`view`/`pool`/`hero`/`bfavs`…）与 hash 原样保留。
 */
function syncLanguageUrl(lang) {
    try {
        const u = new URL(window.location.href);
        u.pathname = '/' + lang + '/';
        u.searchParams.delete('lang');
        u.searchParams.delete('hl');
        // ⚠ 第二个参数不能传 `null`：那会把 `history.state`（视图深链接用的 `{view:'lottery'}`）一起抹掉，
        //   于是切完语言后 `setMainViewHistory` 的 push/replace 判据和 `handlePopState` 的派发都失忆。
        history.replaceState(history.state || { view: currentMainViewName() }, '', u.pathname + u.search + u.hash);
    } catch (e) { /* URL 同步失败不影响切换本身 */ }
}

/**
 * 重刷筛选器标签：`populateFilters()` 会**清空** `multiSelectFilters` ⇒ 先存后还，再刷按钮态。
 * ⚠ 筛选值存的都是规范 ID（`elementId`/`classId`/…）⇒ 语言无关，可以原样还原。
 */
function refreshFiltersAfterLanguageChange() {
    const saved = JSON.parse(JSON.stringify(state.multiSelectFilters || {}));
    populateFilters();
    Object.keys(saved).forEach(k => { state.multiSelectFilters[k] = saved[k]; });
    Object.keys(state.multiSelectFilters).forEach(k => {
        if (typeof updateFilterButtonUI === 'function') updateFilterButtonUI(k);
    });
}

/**
 * 重渲染当前子视图（通缉令 /  Farming / 队伍模拟器）。
 * 列表视图由 `applyFiltersAndRender()` 负责，这里只管"非列表"的那几个。
 */
function refreshActiveViewAfterLanguageChange() {
    const vis = el => el && !el.classList.contains('hidden');
    try {
        // 抽奖池标题/加成文案是**按语言缓存**的字典 ⇒ 无条件重取（很便宜），
        // 否则用户切完语言再进抽奖模拟器会看到旧标题。
        if (typeof refreshLotteryTranslations === 'function') refreshLotteryTranslations();
        if (vis(uiElements.wantedMissionView) && typeof initAndShowWantedMissionView === 'function') {
            initAndShowWantedMissionView();
        } else if (vis(uiElements.farmingGuideView) && typeof initAndShowFarmingGuideView === 'function') {
            initAndShowFarmingGuideView();
        } else if (vis(uiElements.teamSimulatorWrapper)) {
            if (typeof renderTeamDisplay === 'function') renderTeamDisplay();
            if (typeof renderSavedTeams === 'function') renderSavedTeams(getSavedTeams());
            if (typeof updateTeamTags === 'function') updateTeamTags();
        } else if (vis(uiElements.lotterySimulatorWrapper)) {
            // 抽奖模拟器：先重取按语言缓存的字典（标题/加成文案），再调三个**纯渲染**函数
            // （不重新 initialize，避免重置抽奖状态）。
            if (typeof refreshLotteryTranslations === 'function') refreshLotteryTranslations();
            if (typeof refreshPoolTitle === 'function') refreshPoolTitle();   // 奖池标题只在点卡池时写过 ⇒ 必须显式补
            if (typeof renderActivityList === 'function') renderActivityList();
            if (typeof renderFeaturedHeroes === 'function') renderFeaturedHeroes();
            if (typeof renderSummonHistory === 'function') renderSummonHistory();
        } else if (vis(uiElements.chatSimulatorView) && typeof updateChatPreview === 'function') {
            updateChatPreview();
        }
    } catch (e) {
        console.warn('[lang] 子视图刷新失败（已忽略）：', e);
    }
}

/**
 * 切换并保存语言（**无缝**：不整页重载）。
 *
 * 数据存 ID + 显示时才过字典 + 排序表语言无关 ⇒ 具备不重载切换的条件；
 * 分段顺序**与首访一致**（用户 2026-11-22 口径）：
 *   ① 界面文案：只等 UI 字典（`Lang.loadI18n`，语言页内联即同帧 / 根页 ~24KB）→ `applyLanguage()`；
 *   ② 英雄数据：`Lang.loadCore` 名词/属性表（~50KB）→ `reloadLanguageNames()` → 列表先上屏 → **解禁 + 撤遮罩**；
 *   ③ 技能数据：延后词表 + `heroes_skills_<码>.json`（3.6MB 解码）→ `reloadLanguageSkills()`，后台补齐。
 * 切换期间 `body.lang-switching` 上「结果区懒加载遮罩 + 透明整屏拦截层」⇒ 不能在半切换状态下乱点。
 *
 * ⚠ ② 之前任一步失败 ⇒ 回退到整页重载，避免停留在"半切换"的错乱状态。
 * @param {string} lang - 新的语言代码。
 */
let _langSwitchGen = 0;   // 保留给日志/调试；技能正文换代由 utils 的 `_skillsGen` / Lang 的 `_lang` 自行作废

/** 等一帧真正合成上屏（两次 rAF + 一轮宏任务）。
 *  文案换完紧接着就是「重建名称 → 批量渲染」的长任务；不主动让帧，浏览器会把这两步
 *  合成在同一个任务里 ⇒ 用户看到的是「转圈结束，文字和表格一起出现」，而不是"文字先换、表格后到"。 */
function _nextPaint() {
    return new Promise(function (resolve) {
        if (typeof requestAnimationFrame !== 'function') { setTimeout(resolve, 0); return; }
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { setTimeout(resolve, 0); });
        });
    });
}

async function changeLanguage(lang) {
    if (!lang || lang === state.currentLang) return;
    if (state._switchingLang) return;          // 连点保护
    state._switchingLang = true;
    _langSwitchGen++;

    setCookie('language', lang, 365);
    const loader = document.getElementById('page-loader-overlay');
    // 切换期间禁止操作：遮罩仍只盖结果区，另加一层透明整屏拦截层吃掉指针事件（CSS 见 index.html 的 body.lang-switching）
    document.body.classList.add('lang-switching');

    try {
        // 点击即给反馈：结果区转圈立刻上（它只盖表格区，页头文案随后仍会先换成目标语言）
        if (loader) loader.classList.remove('hidden');
        // ① 界面文案：只等 UI 字典（语言页内联 ⇒ 同帧；根页一次 ~24KB）⇒ 点了就换页头/按钮/筛选器
        await Lang.loadI18n(lang);
        syncLanguageUrl(lang);
        applyLanguage(lang);
        refreshFiltersAfterLanguageChange();
        // 关键：先让「文案已换」这一帧真正画出来，再去做重建名词/批量渲染的长任务。
        await _nextPaint();
        // ② 英雄名/属性：只等名词/属性表（`langs_json/*_<码>.json` 那 9 张 + sort_order，原始 ~75~87KB，
        //    线上压缩后 ~25KB）⇒ 重建名字后列表先上屏（等效首访「表格有内容即撤遮罩」）
        await reloadLanguageNames(lang);
        refreshFiltersAfterLanguageChange();
        applyFiltersAndRender();
        refreshActiveViewAfterLanguageChange();
    } catch (err) {
        console.error('[lang] 无缝切换失败，回退整页重载：', err);
        state._switchingLang = false;
        document.body.classList.remove('lang-switching');
        window.location.reload();
        return;
    }

    // 列表已是新语言 ⇒ 解禁 + 撤遮罩；技能正文（3.6MB/语言）像首访一样放后台，不再挡操作
    state._switchingLang = false;
    document.body.classList.remove('lang-switching');
    if (loader) loader.classList.add('hidden');

    // ③ 技能数据：延后词表 + heroes_skills_<码>.json ⇒ 详情/技能搜索随后就绪
    //    ⚠ 不再二次 applyFiltersAndRender()：技能正文只影响详情与「搜技能」，列表条数/几何不变，
    //      重渲染反而可能把用户正在看的滚动位置弹回顶部。
    await reloadLanguageSkills(lang);
}

/**
 * 调整粘性表头的位置，确保其在结果头下方。
 */
function adjustStickyHeaders() {
    if (!uiElements.resultsHeader) return;
    const headerHeight = uiElements.resultsHeader.offsetHeight;
    const theads = document.querySelectorAll('#results-wrapper thead');
    theads.forEach(thead => {
        if (thead) thead.style.top = `${headerHeight - 1}px`;
    });
}

/**
 * 更新结果区域头部的文本信息（如英雄数量）。
 */
function updateResultsHeader() {
    const langDict = i18n[state.currentLang] || {};
    const count = state.filteredHeroes.length;
    const filtersAreActive = areFiltersActive();
    const onlyFavoritesIsActive = isOnlySpecificScopeFilterActive('favorites');
    const onlyHeroIsActive = isOnlySpecificScopeFilterActive('hero');
    const onlyCostumeIsActive = isOnlySpecificScopeFilterActive('skin');

    if (uiElements.resultsCountEl) {
        uiElements.resultsCountEl.innerHTML = '';
        let message = '';
        let showResetButton = false;
        let mergeCountIntoLatest = false;

        if (state.temporaryOwnedHeroes) {
            // 「打开游戏英雄列表」：页头显示「游戏英雄列表共 N 位英雄」+ 重置 tag
            message = langDict.gameHeroesListCount(count);
            showResetButton = true;
        } else if (onlyFavoritesIsActive) {
            message = (count > 0) ? langDict.favoritesListCount(count) : langDict.favoritesListEmpty;
            showResetButton = true;
        } else if (onlyHeroIsActive) {
            message = langDict.resultsCountTextHeroOnly(count);
            showResetButton = true;
        } else if (onlyCostumeIsActive) {
            message = langDict.resultsCountTextCostumeOnly(count);
            showResetButton = true;
        } else if (filtersAreActive) {
            message = langDict.resultsCountTextFiltered(count);
            showResetButton = true;
        } else {
            // 未筛选时显示本地化的「共 N 位」（不带「英雄 (包含服装)」后缀）；
            // totalHeroesCountText 自带一层括号，这里去掉
            message = String(langDict.totalHeroesCountText(count)).replace(/^\(|\)$/g, '');
            // 未筛选时页头还有「查看最新」按钮：按钮直接显示总数，
            // 「查看最新」保留在 title/aria-label 里说明点击用途，省掉一条独立数量文案。
            mergeCountIntoLatest = true;
            showResetButton = false;
        }

        if (message && !mergeCountIntoLatest) {
            const messageSpan = document.createElement('span');
            messageSpan.innerHTML = message;
            uiElements.resultsCountEl.appendChild(messageSpan);
        }

        // --- 查看最新 按钮逻辑 ---
        // 仅在未应用任何筛选时显示「查看最新」按钮；一旦有筛选（含英雄学院10列表临时筛选）
        // 有筛选时不显示「查看最新」，header 由上面的 showResetButton 分支呈现「重置」tag。
        if (!filtersAreActive) {
            const latestBtn = document.createElement('span');
            latestBtn.id = 'view-latest-btn';
            latestBtn.className = 'reset-tag'; // 复用样式
            const latestLabel = langDict.viewLatest || '';
            latestBtn.textContent = mergeCountIntoLatest ? message : latestLabel;
            latestBtn.title = mergeCountIntoLatest ? `${latestLabel} · ${message}` : latestLabel;
            if (mergeCountIntoLatest) latestBtn.setAttribute('aria-label', `${latestLabel} · ${message}`);
            uiElements.resultsCountEl.appendChild(latestBtn);
        }
        // --- 查看最新 按钮逻辑结束 ---

        // --- 查看平衡数据英雄（带图标，调用筛选页面那颗同名按钮）---
        // 与「查看最新」同进同出：**有任何筛选（即页头出现「重置」tag）就不显示**，取消筛选后自动恢复；
        // 且只在主列表页出现（非列表视图由 style.css 里 `#view-balance-heroes-btn` 的规则隐藏）。
        if (!filtersAreActive) {
            const balanceBtn = document.createElement('span');
            balanceBtn.id = 'view-balance-heroes-btn';
            balanceBtn.className = 'reset-tag';
            balanceBtn.title = langDict.balanceHeroesList;
            const balanceIcon = document.createElement('img');
            balanceIcon.src = 'imgs/event/emoji_spritesheet_234.webp';
            balanceIcon.className = 'event-icon';
            balanceIcon.alt = '';
            balanceIcon.onerror = () => { balanceIcon.style.display = 'none'; };
            balanceBtn.appendChild(balanceIcon);
            balanceBtn.appendChild(document.createTextNode(langDict.balanceHeroesList || ''));
            uiElements.resultsCountEl.appendChild(balanceBtn);
        }
        // --- 查看平衡数据英雄 逻辑结束 ---

        if (showResetButton) {
            const resetTag = document.createElement('span');
            resetTag.className = 'reset-tag';
            resetTag.textContent = langDict.resultsReset;
            resetTag.onclick = (e) => {
                e.preventDefault();
                uiElements.resetFiltersBtn.click();
            };
            uiElements.resultsCountEl.appendChild(resetTag);
        }
    }
}

/**
 * 更新单个多选筛选按钮的UI（文本和激活状态）。
 * @param {string} filterType - 筛选器的类型 (e.g., 'element', 'class')。
 */
function updateFilterButtonUI(filterType) {
    const button = document.getElementById(`btn-filter-${filterType}`);
    if (!button) return;
    // 列表上方便捷栏的同类型按钮：文案、计数、高亮一律与筛选页面保持一致
    const targets = [button, ...document.querySelectorAll(`.quick-filter-button[data-filter="${filterType}"]`)];

    const selectedValues = state.multiSelectFilters[filterType] || [];
    const selectedCount = selectedValues.length;
    const langDict = i18n[state.currentLang] || {};

    const labelKey = filterType.startsWith('skillTag_')
        ? filterType.replace('skillTag_', 'cnSkill_') + 'Label'
        : (filterType === 'aetherpower' ? 'aetherPowerLabel' : (filterType === 'costume' ? 'costumeTypeLabel' : `${filterType}Label`));

    let label = langDict[labelKey] || filterType;
    if (label.endsWith(':')) {
        label = label.slice(0, -1);
    }

    let text = label;
    const active = selectedCount > 0;
    if (active && filterType === 'filterScope') {
        text = `${label}: ${langDict[`filterScope_${selectedValues[0]}`]}`;
    } else if (active) {
        text = `${label} (${selectedCount})`;
    }

    targets.forEach(target => {
        target.textContent = text;
        target.classList.toggle('active', active);
    });
}

// --- 模态框管理 ---
// 详情弹窗的打开序号：等待技能档期间用户又点了别的英雄 ⇒ 旧的这次直接放弃渲染。
let _detailsOpenSeq = 0;

async function openDetailsModal(hero, context = {}) {
    state.modalContext = context; // 在打开模态框时存储上下文
    const seq = ++_detailsOpenSeq;

    // ① **先上屏**：技能正文与延后词表都是「延后加载」的（2.6~4MB/语言，见 utils.js），
    //    等它们到齐再 showModal 的话，用户点一下要干等到下载完 —— 那正是移动端 INP 的
    //    大坑（点击→下一帧被整段 await 挡住）。现在立刻开出弹窗骨架（名字 + 转圈），
    //    正文到达后再填进去；数据本来就绪时 await 只走微任务，骨架不会闪。
    const _mc = document.getElementById('modal-content');
    if (_mc) {
        _mc.innerHTML = `
            <div style="min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 24px;">
                <div class="loader-spinner" aria-hidden="true"></div>
                <p style="margin: 0; font-weight: 600;">${(typeof escapeHtml === 'function' ? escapeHtml(hero && hero.name || '') : '')}</p>
            </div>`;
    }
    uiElements.modal.classList.remove('hidden');
    cancelModalClose(uiElements.modal);
    uiElements.modal.showModal();
    document.body.classList.add('modal-open');
    uiElements.modal.scrollTop = 0;
    // 地址栏同步成"这只英雄"的地址：**保留当前所有参数**，只加/换 `hero`
    //   ⇒ 在抽奖视图里打开英雄，地址是 `?view=lottery&hero=<身份>`，复制出去就能把上下文一起带走；
    //   关闭走 `history.back()`（见 closeDetailsModal），浏览器自动把地址退回去。
    //   ⚠ state 里要带上 `view`：弹窗这条历史记录若丢了视图名，后退/前进回来时 `handlePopState`
    //   只能退回"没有视图"的状态。
    const _hid = (typeof heroIdentity === 'function') ? heroIdentity(hero) : (hero && hero.heroId) || '';
    history.pushState(
        { modal: 'details', hero: _hid, view: (typeof currentMainViewName === 'function' ? currentMainViewName() : 'list') },
        '', _hid ? heroUrl(_hid, true) : null); // 添加历史记录
    state.modalStack.push('details'); // 入栈

    // ② 补齐技能正文 / 延后词表（水合是**就地**改英雄对象，故 hero 引用无需重新取）
    if (typeof ensureSkillsLoaded === 'function') {
        await ensureSkillsLoaded();
    }
    if (typeof ensureDeferredTables === 'function') {
        await ensureDeferredTables();
    }
    if (seq !== _detailsOpenSeq) return;   // 期间又打开了别的详情 ⇒ 这次作废，别覆盖新弹窗
    renderDetailsInModal(hero, context); // 渲染内容
    uiElements.modal.scrollTop = 0;
}

function closeDetailsModal() {
    if (!uiElements.modal.classList.contains('hidden') && !uiElements.modal.classList.contains('closing')) history.back();
}

function openFiltersModal() {
    uiElements.filtersModal.classList.remove('hidden');
    cancelModalClose(uiElements.filtersModal);
    uiElements.filtersModal.showModal();
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'filters' }, null);
    state.modalStack.push('filters');
}

function closeFiltersModal() {
    if (!uiElements.filtersModal.classList.contains('hidden') && !uiElements.filtersModal.classList.contains('closing')) history.back();
}

/**
 * 渲染帮助类型模态框的通用函数。
 */
function renderHelpModalContent(modalElement, titleKey, introKey, listKeys) {
    const langDict = i18n[state.currentLang] || {};
    const introHTML = introKey ? `<p>${langDict[introKey]}</p>` : '';
    const listHTML = listKeys.map(key => langDict[key] || '').join('');
    modalElement.innerHTML = `
        <h3 id="${modalElement.id}-title">${langDict[titleKey]}</h3>
        ${introHTML}
        <ul>${listHTML}</ul>
        <div class="modal-footer">
            <button class="close-bottom-btn" id="close-${modalElement.id}-btn">${langDict.detailsCloseBtn}</button>
        </div>
    `;
    document.getElementById(`close-${modalElement.id}-btn`).addEventListener('click', () => {
        if (modalElement === uiElements.helpModal) closeHelpModal();
        if (modalElement === uiElements.lbTalentHelpModal) closeLbTalentHelpModal();
    });
}

function openHelpModal() {
    renderHelpModalContent(uiElements.helpModal, 'filterHelpTitle', 'filterHelpIntro', ['filterHelpAnd', 'filterHelpOr', 'filterHelpNot', 'filterHelpGroup', 'filterHelpExample']);
    uiElements.helpModal.classList.add('stacked-modal');
    uiElements.helpModal.classList.remove('hidden');
    cancelModalClose(uiElements.helpModal);
    uiElements.helpModal.showModal();
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'help' }, null);
    state.modalStack.push('help');

    // 打开时永远从标题开始：某些浏览器会把焦点落在底部关闭按钮上，弹窗自动滚到底
    uiElements.helpModal.scrollTop = 0;
    const helpHeading = uiElements.helpModal.querySelector('h3');
    if (helpHeading) {
        helpHeading.setAttribute('tabindex', '-1');
        helpHeading.focus({ preventScroll: true });
    }
    uiElements.helpModal.scrollTop = 0;
}

function closeHelpModal() {
    if (!uiElements.helpModal.classList.contains('hidden') && !uiElements.helpModal.classList.contains('closing')) history.back();
}

function openLbTalentHelpModal() {
    renderHelpModalContent(uiElements.lbTalentHelpModal, 'lbTalentHelpTitle', null, ['lbTalentHelpLine2']);
    uiElements.lbTalentHelpModal.classList.add('stacked-modal');
    uiElements.lbTalentHelpModal.classList.remove('hidden');
    cancelModalClose(uiElements.lbTalentHelpModal);
    uiElements.lbTalentHelpModal.showModal();
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'lbTalentHelp' }, null);
    state.modalStack.push('lbTalentHelp');
}

function closeLbTalentHelpModal() {
    if (!uiElements.lbTalentHelpModal.classList.contains('hidden') && !uiElements.lbTalentHelpModal.classList.contains('closing')) history.back();
}

/**
 * 更新兑换码悬浮按钮上的数量。
 */
function updateRedeemCodeCount() {
    const count = redeemcodes ? redeemcodes.length : 0;
    const countElement = document.getElementById('redeem-code-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function openRedeemCodesModal() {
    renderRedeemCodesModal(); // 动态生成内容
    uiElements.redeemCodesModal.classList.remove('hidden');
    cancelModalClose(uiElements.redeemCodesModal);
    uiElements.redeemCodesModal.showModal();
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'redeemCodes' }, null);
    state.modalStack.push('redeemCodes');
}

function closeRedeemCodesModal() {
    if (!uiElements.redeemCodesModal.classList.contains('hidden') && !uiElements.redeemCodesModal.classList.contains('closing')) history.back();
}

/**
 * 将结果表格的滚动条滚动到最顶部。
 */
function scrollToTableTop() {
    if (uiElements.resultsWrapper) {
        uiElements.resultsWrapper.scrollTo({
            top: 0,
            behavior: 'smooth' // 使用平滑滚动效果
        });
    }
}

/**
 * 关闭英雄立绘模态框
 */
function closeHeroPortraitModal() {
    const imageModal = document.getElementById('image-modal');
    // 统一走 history.back()：popstate 的 heroPortrait 分支负责关弹窗、释放立绘播放器、弹栈。
    // 立即置 hidden：容器与立绘图片各挂了一个本函数，点击冒泡会同步触发两次，
    // 若等 popstate 异步置 hidden 作守卫会连退两级历史（把详情页也关掉）。
    if (imageModal && !imageModal.classList.contains('hidden')) {
        imageModal.classList.add('hidden');
        history.back();
    }
}