// special-views.js: 管理特殊视图，如通缉任务、材料指南和聊天模拟器。

/**
 * `?view=` 的**保留字**（地址里写的短名）：命中即当"主视图"处理，没命中才当英雄身份键（`?view=<heroId>` 分享链接）。
 * 短名 → 内部视图名（`history.state.view` 用的那套，也是 `setMainViewHistory` / `applyMainView` 的入参）：
 *   地址要短要好读（`?view=lottery`），内部名沿用既有标志（`lotterySimulator`），两者靠下面这张表换。
 * ⚠ 新增视图要同时改这张表、`applyMainView` 的派发与 `main.js` 的解析。
 *   heroId 都是 `color_class_name` / `seasonN_xxx` 形态，与这些短名零冲突。
 */
const VIEW_NAME_BY_URL_KEYWORD = {
    wanted: 'wanted',
    farming: 'farming',
    chat: 'chat',
    team: 'teamSimulator',
    lottery: 'lotterySimulator'
};
const VIEW_URL_KEYWORDS = Object.keys(VIEW_NAME_BY_URL_KEYWORD);
const VIEW_URL_KEYWORD_BY_NAME = VIEW_URL_KEYWORDS.reduce((m, k) => { m[VIEW_NAME_BY_URL_KEYWORD[k]] = k; return m; }, {});

/** 地址参数值是不是"主视图"保留字？ */
const isViewUrlKeyword = (v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(VIEW_NAME_BY_URL_KEYWORD, v);
/** 地址短名 → 内部视图名；不是保留字时返回 null。 */
const viewNameFromUrlParam = (v) => (isViewUrlKeyword(v) ? VIEW_NAME_BY_URL_KEYWORD[v] : null);

/**
 * 生成"只改指定参数、其余参数原样保留"的相对地址（供 pushState/replaceState 用）。
 * 值为 `null`/`''` ⇒ 删掉该参数；值为 `undefined` ⇒ 该参数不动。
 * ⚠ 视图名要换成地址短名再传进来（`VIEW_URL_KEYWORD_BY_NAME`）—— 地址用短名（`?view=lottery`），
 *   内部 `history.state.view` 用长名（`lotterySimulator`）。
 * @param {Object<string, string|null|undefined>} params
 * @returns {string}
 */
function urlWithParams(params) {
    const u = new URL(window.location.href);
    Object.keys(params).forEach(k => {
        const v = params[k];
        if (v === undefined) return;                     // 不动这个参数
        if (v === null || v === '') u.searchParams.delete(k);
        else u.searchParams.set(k, v);
    });
    // `pool` 是 `view=lottery` 的子参数（层级关系）⇒ 地址里固定写成 `?view=…&pool=…`。
    // 进入抽奖时 `handleActivityClick` 会先写 `pool`、`setMainViewHistory` 随后才补 `view`，
    // `URLSearchParams.set` 只会把 `view` 追加到末尾 ⇒ 不归一会得到 `?pool=…&view=lottery`。
    const entries = Array.from(u.searchParams.entries());
    const vi = entries.findIndex(([k]) => k === 'view');
    const pi = entries.findIndex(([k]) => k === 'pool');
    if (vi >= 0 && pi >= 0 && vi > pi) {
        const [viewEntry] = entries.splice(vi, 1);
        entries.splice(pi, 0, viewEntry);
        u.search = new URLSearchParams(entries).toString();
    }
    return u.pathname + u.search + u.hash;
}

/**
 * 根据当前历史状态智能地设置主视图的历史记录**与地址**。
 * 如果当前已在一个主视图中，则替换状态；否则，添加新状态。
 * @param {string} viewName - 要设置的新视图名称 ('wanted', 'farming', 'chat', 'teamSimulator', 'lotterySimulator')。
 */
function setMainViewHistory(viewName) {
    const mainViews = ['wanted', 'farming', 'chat', 'teamSimulator', 'lotterySimulator'];
    const currentState = history.state || {};
    // 切到**别的**视图时把抽奖的子参数 `pool` 一起清掉（留着就是陈旧状态）；
    // 进抽奖本身不能清 —— 抽奖的进入分支会先 `handleActivityClick` 写好 `pool`，再调本函数。
    const poolParam = viewName === 'lotterySimulator'
        ? (new URLSearchParams(window.location.search).get('pool') || null) : null;
    const st = { view: viewName };
    if (poolParam) st.pool = poolParam;              // state 与地址保持一致
    const url = urlWithParams({
        view: VIEW_URL_KEYWORD_BY_NAME[viewName] || null,
        pool: poolParam
    });
    if (currentState.view && mainViews.includes(currentState.view)) {
        // 视图间切换是 replace：沿用原条目的 push 标记，退出时才知道该 back 还是原地替换
        if (currentState.viewPushed) st.viewPushed = true;
        history.replaceState(st, '', url);
    } else {
        st.viewPushed = true;
        history.pushState(st, '', url);
    }
}

/**
 * 退出到主列表：把当前那条"视图"历史**原地替换**成列表（绝不 push —— 后退语义要留给浏览器）。
 * 只在用户主动点"退出"的两个分支里调用；`handlePopState` 里不需要（浏览器已把地址恢复好了）。
 */
function clearMainViewHistory() {
    // 退出视图时把它自己的子参数一起清掉（`pool` = 抽奖选中的奖池，见 lottery-ui.js）
    history.replaceState({ view: 'list' }, '', urlWithParams({ view: null, pool: null }));
}

/**
 * 给两个模拟器"开关"函数收尾用：**只有确实停在列表上**才清地址。
 * ⚠ 必须延一拍再判：跨视图切换（进通缉任务/材料/聊天会先关抽奖，见各 `initAndShow*` 开头）时，
 *   目标视图的 `.hidden`/标志**还没落下**，当场判会误以为"回列表了"而把地址清掉 +
 *   把 `history.state.view` 打成 'list' ⇒ 随后那次 `setMainViewHistory(目标)` 就从 replace 变成 push，
 *   历史栈白多一条、后退语义跟着变。0ms 定时器跑在本次调用栈之后，那时目标视图已经就位。
 */
function syncViewUrlAfterToggle() {
    const settle = () => {
        if (currentMainViewName() !== 'list') return;
        // 还在途的只有两种：懒加载脚本未落地（轮询等）、过渡回调未落地（视图终态未定）。
        // ⚠ 别等整个动画：busy 横跨动画全程，等它会把地址变更拖到退出动画结束之后；
        //   回调落地即可判——本函数就是从回调里调出来的，那时视图已切换，地址应随点击即变。
        //   在途时不能直接跳过：跳过会丢掉本次清理，地址永远留在 ?view=（刷新又跳回旧视图）。
        if (_lazyViewPending > 0 || (_viewTransitionBusy && !_vtUpdateLanded)) { setTimeout(settle, 50); return; }
        if (_exitBackPending) return;   // 已有清理在 back 途中，别叠第二次 back
        if (history.state && history.state.viewPushed) {
            // 本条视图记录是 push 出来的 ⇒ back 弹掉它；原地 replace 会留下第二条"列表"死记录
            _exitBackFromView = 'list';
            _exitBackPending = true;
            history.back();
        } else {
            clearMainViewHistory();
        }
    };
    setTimeout(settle, 0);
}

let _exitBackPending = false;
let _exitBackFromView = null;

/**
 * 图标"退出"的统一入口：本条视图记录是自己 push 的就用 back 弹掉（前进/后退栈不留死记录）；
 * 深链接冷启动没有可回的列表条目，只能原地 replace。back 的渲染与过渡由 popstate → applyMainView 负责。
 */
function exitMainViewToList() {
    if (_exitBackPending) return;
    cancelPendingViewLoad();   // 回列表也是新意图：作废还在等配置的打开（history.back 路径不经过渡包装）
    if (history.state && history.state.viewPushed) {
        _exitBackFromView = currentMainViewName();
        _exitBackPending = true;
        history.back();
        return;
    }
    runViewTransition(showHeroListViewUI);
}

/**
 * 当前显示中的主视图名（与 `setMainViewHistory` 用的那套激活标志同源）。
 * @returns {string} 'list' | VIEW_URL_KEYWORDS 之一
 */
function currentMainViewName() {
    if (state.lotterySimulatorActive) return 'lotterySimulator';
    if (state.teamSimulatorActive) return 'teamSimulator';
    const vis = el => el && !el.classList.contains('hidden');
    if (vis(uiElements.wantedMissionView)) return 'wanted';
    if (vis(uiElements.farmingGuideView)) return 'farming';
    if (vis(uiElements.chatSimulatorView)) return 'chat';
    return 'list';
}

/**
 * 同步右上角视图按钮的"开关"外观：视图激活时按钮变红、提示换成"返回"，再点一次即回列表。
 * 所有会改变主视图的入口（进入/退出/切语言）末尾都调它，保证按钮状态与视图一致。
 */
function refreshMainViewButtons() {
    const current = currentMainViewName();
    const langDict = i18n[state.currentLang] || {};
    const entries = [
        ['show-wanted-mission-btn', 'wanted', 'showWantedMissionTitle'],
        ['show-farming-guide-btn', 'farming', 'showFarmingGuideTitle'],
        ['show-chat-simulator-btn', 'chat', 'showChatSimulatorTitle'],
        ['show-team-simulator-btn', 'teamSimulator', 'showTeamSimulatorTitle'],
        ['show-lottery-simulator-btn', 'lotterySimulator', 'showLotterySimulatorTitle']
    ];
    entries.forEach(([id, view, titleKey]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const active = current === view;
        btn.classList.toggle('simulator-exit-btn', active);
        const title = active ? langDict.returnToList : langDict[titleKey];
        if (title) {
            btn.title = title;
            if (btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', title);
        }
    });
}

// ────────────────────────────────────────────────────────────────────
// 懒加载视图脚本（抽奖/队伍/聊天）：不在启动 defer 链里，首次打开才注入执行。
// index.html 里对应 <script type="application/x-lazy-view"> 数据块（浏览器不下载不执行），
// 这里把 src 原样抄进真 <script>，按数据块先后顺序串行加载（engine → odds → ui 有依赖）。
// ────────────────────────────────────────────────────────────────────
const _viewScriptPromise = {};
const VIEW_READY = {
    lottery: () => typeof LotterySimulator !== 'undefined',
    team: () => typeof toggleTeamSimulator === 'function',
    chat: () => typeof handleChatSimulatorButtonClick === 'function'
};
function ensureViewScripts(view) {
    // 测试沙箱直接 eval 全部脚本（无数据块）⇒ 全局已在即视为就绪
    if (VIEW_READY[view]()) return Promise.resolve();
    if (_viewScriptPromise[view]) return _viewScriptPromise[view];
    const tags = Array.from(document.querySelectorAll(
        'script[type="application/x-lazy-view"][data-view="' + view + '"]'));
    if (!tags.length) return Promise.reject(new Error('[lazy-view] 找不到 ' + view + ' 的脚本数据块'));
    const p = tags.reduce((chain, tag) => chain.then(() => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = tag.getAttribute('src');
        s.onload = resolve;
        s.onerror = () => reject(new Error('[lazy-view] 加载失败 ' + s.src));
        document.head.appendChild(s);
    })), Promise.resolve());
    _viewScriptPromise[view] = p;
    p.catch(() => { delete _viewScriptPromise[view]; });   // 失败可重试（下次点击重新注入）
    return p;
}

// 加载期间用户可能又切了视图 ⇒ 每次打开/过渡动作递增序号，脚本落地后序号已旧就放弃这次打开。
let _lazyViewSeq = 0;
let _lazyViewPending = 0;

// ────────────────────────────────────────────────────────────────────
// 视图「所需配置」就位门控（**不含图片**：视图里的头像/立绘照旧边开边加载）
//   脚本没注入、抽奖奖池/标题词表还没到 ⇒ 先把**目标视图自己的骨架**摆上屏、视图内转圈，
//   配置就位后还原骨架再真正打开 —— 用户看到的是「这个视图在加载」，而不是首页在加载。
//   与详情弹窗"骨架先上屏、数据后补"同一口径，别把一张空视图先甩给用户。
// ────────────────────────────────────────────────────────────────────
let _viewLoadSeq = 0;

// 抽奖：奖池（lottery_official/display 解析后 buildPools）与奖池标题（延后词表）都算配置；
// 其余视图的配置在 data.js 关键路径里同步可用，无需等待。
function lotteryConfigReady() {
    // allSummonPools 是 poolId → 奖池 的对象（buildPools 产物），不是数组
    const pools = state.allSummonPools;
    if (!pools || typeof pools !== 'object' || !Object.keys(pools).length) return false;
    if (typeof Lang !== 'undefined' && Lang.get) {
        const titles = Lang.get('lottery_title');
        if (!titles || !Object.keys(titles).length) return false;
    }
    return true;
}
const VIEW_CONFIG_READY = { lottery: lotteryConfigReady };

function isViewReady(view) {
    if (VIEW_READY[view] && !VIEW_READY[view]()) return false;
    const cfg = VIEW_CONFIG_READY[view];
    return cfg ? cfg() : true;
}

/** 轮询等到条件成立；到点即返回（不 reject），调用方按"就绪与否"自行决定 */
function waitFor(cond, timeoutMs) {
    const t0 = Date.now();
    return new Promise(resolve => {
        const tick = () => {
            let ok = false;
            try { ok = !!cond(); } catch (e) { ok = false; }
            if (ok || Date.now() - t0 >= timeoutMs) { resolve(ok); return; }
            setTimeout(tick, 100);
        };
        tick();
    });
}

function ensureViewReady(view) {
    const boot = [ensureViewScripts(view)];
    if (view === 'lottery') {
        // 抽奖配置 promise 要等首屏渲染后才挂上 ⇒ 先等它出现，再等它落地（含奖池 buildPools）
        boot.push(waitFor(() => !!window.__lotteryConfigReady, 10000).then(() => window.__lotteryConfigReady));
        if (typeof Lang !== 'undefined' && Lang.ensureDeferred) boot.push(Lang.ensureDeferred());
    }
    return Promise.race([
        Promise.all(boot.map(p => Promise.resolve(p).catch(() => null)))
            // 配置落地后奖池/词表还要一拍才对得上 ⇒ 再给 2s 收敛窗口
            .then(() => waitFor(() => isViewReady(view), 2000)),
        // 兜底：真拖太久（弱网/单文件失败）也不能让用户一直看转圈，到点照旧开视图
        new Promise(r => setTimeout(r, 15000))
    ]);
}

// ── 等待期占位：**用目标视图自己的骨架**摆屏，不再把首页表格盖成一块 ——
//   用户口径：进特殊视图要等（脚本/配置）时，看到的是「这个视图在加载」，不是首页在加载。
//   骨架只借 DOM 显示，不动 `state.*Active`；就绪后先把骨架还原成 hidden，再走真正的 open()
//   （open 里的 toggle 都是状态驱动的，不会被临时显示骗过去）。
const VIEW_SHELL = {
    lottery: { host: '#lottery-simulator-wrapper', slot: '#lottery-activity-list-container', inline: false },
    team: { host: '#team-simulator-wrapper', slot: '#team-simulator-display', inline: false },
    // 嵌入型视图的「结果表头」里写着视图标题 + 返回，而这段是 open() 时才写进去的
    // ⇒ 骨架期先按同一份内容占位（`headerTitle`），否则就绪后表头上屏会把下面的面板顶下去。
    chat: { host: '#chat-simulator-view', slot: '.chat-simulator-container', inline: true, headerTitle: 'chatSimulatorTitle', headerTitleFallback: '聊天模拟器' },
    wanted: { host: '#wanted-mission-view', slot: null, inline: true, headerTitle: 'wantedMissionTableTitle' },
    farming: { host: '#farming-guide-view', slot: null, inline: true, headerTitle: 'farmingGuideTableTitle' }
};
let _pendingShell = null;   // { view, host, slot, ov, cls, undo }

// 抽奖/队伍是**整页替换**型：真打开时会把页头的「赞助/制作」块与捐赠榜收掉、给 body 打上
// `lottery-mode-active` / `team-mode-active`（抽奖还靠它隐掉快捷筛选栏）。
// 等待期必须**先按打开态隐藏这些元素再上骨架** —— 否则配置到了再收这块页头，
// 主内容整体上跳一大截（用户看到的"加载完才有明显布局跳动"就是这个）。
// 只做**显示态**，不碰 `state.*Active`，也不跑视图里的数据活。
const VIEW_OPEN_STATE = {
    lottery: { mode: 'lottery-mode-active', hideHeaderInfo: true },
    team: { mode: 'team-mode-active', hideHeaderInfo: true },
    chat: { mode: null, hideHeaderInfo: false },
    wanted: { mode: null, hideHeaderInfo: false },
    farming: { mode: null, hideHeaderInfo: false }
};

function _applyOpenState(view) {
    const cfg = VIEW_OPEN_STATE[view];
    if (!cfg) return null;
    const undo = [];
    if (cfg.mode && !document.body.classList.contains(cfg.mode)) {
        document.body.classList.add(cfg.mode);
        undo.push(() => document.body.classList.remove(cfg.mode));
    }
    if (cfg.hideHeaderInfo) {
        ['.header-info-container', '.donation-list-container-wrapper'].forEach(sel => {
            const el = document.querySelector(sel);
            if (!el || el.classList.contains('hidden')) return;   // 捐赠榜可能被用户关了，别擅自打开
            el.classList.add('hidden');
            undo.push(() => el.classList.remove('hidden'));
        });
    }
    return () => undo.forEach(f => f());
}

function _hidePendingShell() {
    if (!_pendingShell) return;
    const { host, ov, cls, undo, headerBackup } = _pendingShell;
    _pendingShell = null;
    window.removeEventListener('scroll', _placePendingSpinner, true);
    window.removeEventListener('resize', _placePendingSpinner);
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    host.classList.remove('pending-view-shell');
    host.classList.add('hidden');        // 还原默认：真正打开由 open() 负责
    if (cls) document.body.classList.remove(cls);
    if (headerBackup) _restorePendingHeader(headerBackup);
    if (undo) undo();                   // 打开态隐藏元素复原（随后 open() 会在同一拍重新做一遍）
}

/** 骨架期把「结果表头」按目标视图的标题 + 返回占位，几何与打开后一致（否则表头上屏会把面板顶下去）。 */
function _paintPendingHeader(cfg) {
    const el = document.getElementById('results-count');
    if (!el) return null;
    const backup = { html: el.innerHTML };
    const dict = (typeof i18n !== 'undefined' && i18n[state.currentLang]) || {};
    el.textContent = '';
    const titleEl = document.createElement('span');
    titleEl.textContent = dict[cfg.headerTitle] || cfg.headerTitleFallback || '';
    el.appendChild(titleEl);
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = dict.returnToList || '返回';
    el.appendChild(returnTag);
    return backup;
}

function _restorePendingHeader(backup) {
    const el = document.getElementById('results-count');
    if (el && backup) el.innerHTML = backup.html;
}

/** 只收掉转圈与跟随监听，**保留骨架的显示态**（视图容器仍可见、页头仍收起、mode class 还在）。 */
function _detachPendingOverlay() {
    if (!_pendingShell) return null;
    const st = _pendingShell;
    _pendingShell = null;
    window.removeEventListener('scroll', _placePendingSpinner, true);
    window.removeEventListener('resize', _placePendingSpinner);
    if (st.ov && st.ov.parentNode) st.ov.parentNode.removeChild(st.ov);
    return st;
}

/**
 * 打开已交给 open()，而 open() 常被 `runViewTransition` 推给 View Transitions 的过渡回调
 * ⇒ 若这时就把骨架还原成列表，过渡的"旧快照"会是列表、下一帧视图才回来 —— 就是用户看到的
 * 「转圈消失瞬间下面弹上来、内容出现后又落回去」。
 * 所以：骨架的显示态一直留到**视图真正 active** 之后再收尾；迟迟没 active（打开失败）
 * 才复原，避免把页面卡在打开的隐藏态。
 */
function _schedulePendingCleanup(st, view) {
    if (!st) return;
    const t0 = performance.now();
    const finish = revert => {
        if (st.host) st.host.classList.remove('pending-view-shell');
        if (st.cls) document.body.classList.remove(st.cls);
        if (revert && st.headerBackup) _restorePendingHeader(st.headerBackup);
        if (revert && st.undo) st.undo();
    };
    const tick = () => {
        const active = (typeof currentMainViewName === 'function') && currentMainViewName() !== 'list';
        if (active) { requestAnimationFrame(() => finish(false)); return; }
        if (performance.now() - t0 > 1500) { finish(true); return; }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// 转圈按「视图内容槽在视口内的可见部分」居中：既不会压住视图自己的标签栏，
// 也不会因为槽比一屏还高（聊天/队伍）把转圈丢到屏幕外。
function _placePendingSpinner() {
    const s = _pendingShell;
    if (!s) return;
    const slot = (s.slot && s.host.querySelector(s.slot)) || s.host;
    const r = slot.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const top = Math.max(0, r.top);
    const height = Math.max(160, Math.min(vh, r.bottom) - top);
    s.ov.style.top = top + 'px';
    s.ov.style.left = r.left + 'px';
    s.ov.style.width = r.width + 'px';
    s.ov.style.height = height + 'px';
}

function _showPendingShell(view) {
    const cfg = VIEW_SHELL[view];
    if (!cfg) return;
    if (_pendingShell && _pendingShell.view === view) return;   // 连点同一个视图，复用骨架
    _hidePendingShell();
    const host = document.querySelector(cfg.host);
    if (!host) return;
    const cls = cfg.inline ? 'view-pending-inline' : null;
    const undo = cfg.inline ? null : _applyOpenState(view);   // 先隐藏，再上骨架（次序不能反）
    const headerBackup = cfg.headerTitle ? _paintPendingHeader(cfg) : null;
    host.classList.remove('hidden');
    host.classList.add('pending-view-shell');
    if (cls) document.body.classList.add(cls);
    const ov = document.createElement('div');
    ov.className = 'view-loading-overlay';
    ov.setAttribute('role', 'status');
    ov.innerHTML = '<div class="loader-spinner"></div><span class="visually-hidden">加载中…</span>';
    // 挂到 body 而不是视图容器：视图切换带 opacity/transform 过渡，会把它变成定位/层叠上下文，
    // 转圈会被挤到容器中线（聊天/队伍容器高过一屏就跑到屏幕外）。挂 body 才是真正的视口坐标。
    document.body.appendChild(ov);
    _pendingShell = { view, host, slot: cfg.slot || null, ov, cls, undo, headerBackup };
    _placePendingSpinner();
    window.addEventListener('scroll', _placePendingSpinner, true);
    window.addEventListener('resize', _placePendingSpinner);
}

/** 任何已落地的视图动作（含回列表/前进后退）都作废还在等配置的打开，并收掉它的占位骨架 */
function cancelPendingViewLoad() {
    _lazyViewSeq++;
    _viewLoadSeq++;
    _hidePendingShell();
}

/**
 * 打开懒加载/带异步配置的主视图：配置已齐 ⇒ 同步直开（不多闪一帧）；
 * 未齐 ⇒ 先摆出该视图的骨架 + 视图内转圈，就绪后还原骨架再开视图。
 */
function openViewWithLoading(view, open) {
    if (isViewReady(view)) { open(); return; }
    const seq = ++_viewLoadSeq;
    _lazyViewPending++;
    // 防眨眼：配置只差一点点（延后词表等）时先静等 150ms，别为一次 30ms 的等待闪一屏骨架
    const shellTimer = setTimeout(() => {
        if (seq !== _viewLoadSeq || isViewReady(view)) return;
        // 首屏还在加载（首屏遮罩本来就在）⇒ 不叠骨架，等首屏撤了再说
        if (document.body.classList.contains('js-loading')) return;
        _showPendingShell(view);
    }, 150);
    ensureViewReady(view).then(() => {
        clearTimeout(shellTimer);
        if (seq !== _viewLoadSeq) return;
        const shellState = _detachPendingOverlay();   // 只收转圈：骨架显示态留到视图 active
        open();
        _schedulePendingCleanup(shellState, view);
    }).catch(err => console.error('[view-load]', err))
        .finally(() => { _lazyViewPending--; });
}

function runWhenViewReady(view, open) {
    openViewWithLoading(view, open);
}

/**
 * 视图切换的渐进增强包装：支持 View Transitions 且未要求减少动态时做整页交叉淡入淡出，
 * 否则同步执行原逻辑。视图函数之间会互相调用（互斥退出），忙标志保证一次用户动作只起一个过渡。
 */
let _viewTransitionBusy = false;
let _viewTransitionGen = 0;
// 最新一次过渡的回调是否已落地（执行或被 gen 作废）。busy 要等动画播完才释放，
// 但视图终态在回调落地那一刻就定了 ⇒ 地址清理等这个标志，不等 busy。
let _vtUpdateLanded = true;
function runViewTransition(update) {
    // 任何已落地的视图动作都作废还在等脚本/配置的懒加载打开（后发意图优先）
    cancelPendingViewLoad();
    // 过渡回调是延迟执行的：连点时后发的同步切换先落地，旧回调必须作废，否则视图会被回切
    const gen = ++_viewTransitionGen;
    _vtUpdateLanded = false;
    const guarded = () => { if (gen === _viewTransitionGen) update(); _vtUpdateLanded = true; };
    if (_viewTransitionBusy) { guarded(); return; }
    if (typeof document.startViewTransition !== 'function'
        || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        guarded();
        focusActiveViewHeading();
        return;
    }
    _viewTransitionBusy = true;
    const transition = document.startViewTransition(guarded);
    transition.finished
        .catch(() => { })
        .finally(() => { _viewTransitionBusy = false; _vtUpdateLanded = true; focusActiveViewHeading(); });
}

/** 过渡结束后把焦点送到新视图的标题；焦点已在新视图内（如聊天输入框）则不抢占。 */
function focusActiveViewHeading() {
    // 有模态弹窗开着时背景是 inert 的，焦点归弹窗管
    if (document.querySelector('dialog.modal-dialog[open]')) return;
    const vis = el => el && !el.classList.contains('hidden');
    const view = [uiElements.wantedMissionView, uiElements.farmingGuideView, uiElements.chatSimulatorView,
    uiElements.teamSimulatorWrapper, uiElements.lotterySimulatorWrapper, uiElements.heroTableView].find(vis);
    if (!view || view.contains(document.activeElement)) return;
    const heading = [...view.querySelectorAll('h1, h2, h3')].find(h => h.getBoundingClientRect().width > 0) || view;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
}

/**
 * 打开指定主视图（**只做打开**，历史/地址由调用方或视图函数自己负责）。
 * 冷启动深链接（`main.js`）和浏览器前进后退（`handlePopState`）都走这里，避免两套派发漂移。
 * @param {string} viewName
 */
function applyMainView(viewName) {
    if (_exitBackPending) {
        _exitBackPending = false;
        const cur = currentMainViewName();
        // back 落地前用户又切了视图 ⇒ 这条 popstate 已过时，别把用户的新操作打回去
        if (viewName === 'list' && cur !== 'list' && cur !== _exitBackFromView) return;
    }
    // 懒加载视图：等脚本落地再开。过渡要包住"落地后的打开动作"本身，
    // 不能包在外层等加载（否则过渡会在视图还没切时就拍新快照）。
    if (viewName === 'lotterySimulator') {
        runWhenViewReady('lottery', () => runViewTransition(() => {
            if (!state.lotterySimulatorActive) LotterySimulator.toggle();
        }));
        return;
    }
    if (viewName === 'teamSimulator') {
        runWhenViewReady('team', () => runViewTransition(() => {
            if (!state.teamSimulatorActive) toggleTeamSimulator();
        }));
        return;
    }
    if (viewName === 'chat') {
        // 与按钮同一条打开路径（含一次性控件初始化）：只调 initAndShowChatSimulatorView
        // 会漏绑输入/取色/表情控件，深链接进来的聊天页打字无预览
        runWhenViewReady('chat', () => openChatSimulatorView());
        return;
    }
    runViewTransition(() => {
        switch (viewName) {
            case 'wanted': initAndShowWantedMissionView(); break;
            case 'farming': initAndShowFarmingGuideView(); break;
            default:
                if (currentMainViewName() !== 'list') closeAllMainViews();
                // 已在列表也要清一次：进抽奖时 handleActivityClick 会先把 pool 写进**当时还在的列表条目**，
                // back 落回这条被污染的列表条目时没人清它（UI 已是列表 ⇒ 不走 showHeroListViewUI）
                else clearMainViewHistory();
        }
    });
}

/**
 * 回到主列表：按激活标志逐个关（复用各自的退出逻辑，不自己摘 `.hidden` ——
 * 队伍/抽奖的退出分支还要清 body class、恢复表头信息、重渲染列表）。
 */
function closeAllMainViews() {
    if (state.teamSimulatorActive) toggleTeamSimulator();
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    showHeroListViewUI();
}

/**
 * 保存当前活动视图的滚动位置。
 * 在切换视图前调用，以提供更好的用户体验。
 */
function saveCurrentViewScrollPosition() {
    const { heroTableView, wantedMissionView, farmingGuideView, chatSimulatorView, resultsWrapper } = uiElements;

    if (!heroTableView.classList.contains('hidden')) {
        state.scrollPositions.list.top = resultsWrapper.scrollTop;
        state.scrollPositions.list.left = resultsWrapper.scrollLeft;
    } else if (!wantedMissionView.classList.contains('hidden')) {
        state.scrollPositions.wanted.top = resultsWrapper.scrollTop;
        state.scrollPositions.wanted.left = resultsWrapper.scrollLeft;
    } else if (!farmingGuideView.classList.contains('hidden')) {
        state.scrollPositions.farming.top = resultsWrapper.scrollTop;
        state.scrollPositions.farming.left = resultsWrapper.scrollLeft;
    } else if (chatSimulatorView && !chatSimulatorView.classList.contains('hidden')) {
        state.scrollPositions.chat.top = resultsWrapper.scrollTop;
        state.scrollPositions.chat.left = resultsWrapper.scrollLeft;
    }
}

/**
 * 切换回主英雄列表视图，并恢复其滚动位置。
 */
function showHeroListViewUI() {
    saveCurrentViewScrollPosition(); // 保存当前视图的位置
    // 列表已渲染且筛选结果未变 ⇒ 跳过整表重渲：退出特殊页重建 2000+ 行会阻塞主线程、点击延迟/丢失
    if (!isListRenderFresh()) applyFiltersAndRender();

    // 显示英雄列表，隐藏其他所有特殊视图
    uiElements.heroTableView.classList.remove('hidden');
    uiElements.wantedMissionView.classList.add('hidden');
    uiElements.farmingGuideView.classList.add('hidden');
    if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
    if (uiElements.lotterySimulatorWrapper) uiElements.lotterySimulatorWrapper.classList.add('hidden');

    // 恢复英雄列表的滚动位置
    uiElements.resultsWrapper.scrollTop = state.scrollPositions.list.top;
    uiElements.resultsWrapper.scrollLeft = state.scrollPositions.list.left;

    // 停在列表 ⇒ 地址不该再留着 `?view=<某个视图>`（刷新会又跳回那个视图）。
    //   ⚠ 这里只能 replace：本函数也是 `handlePopState` 的后退目的地，push 会破坏后退。
    clearMainViewHistory();

    updateResultsHeader(); // 更新结果头部信息
    refreshMainViewButtons();
}

/**
 * 初始化并显示通缉任务视图。
 * 如果表格尚未创建，则动态生成。
 */
function initAndShowWantedMissionView() {
    // 如果当前在抽奖模拟器中，先退出
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    // 如果当前在队伍模拟器中，先退出
    if (state.teamSimulatorActive) toggleTeamSimulator();
    if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
    saveCurrentViewScrollPosition();

    const { wantedMissionTable, heroTableView, farmingGuideView, wantedMissionView, resultsWrapper, resultsCountEl } = uiElements;

    // 检查表格是否已渲染，如果没有则只渲染一次
    if (wantedMissionTable.innerHTML.trim() === '') {
        const headers = {
            season: '', daily: 'imgs/farm/wanted_normal.webp', red: 'imgs/farm/wanted_red.webp',
            green: 'imgs/farm/wanted_green.webp', blue: 'imgs/farm/wanted_blue.webp',
            purple: 'imgs/farm/wanted_purple.webp', yellow: 'imgs/farm/wanted_yellow.webp'
        };
        // 创建表头
        let thead = wantedMissionTable.querySelector('thead') || wantedMissionTable.appendChild(document.createElement('thead'));
        thead.innerHTML = '<tr>' + Object.keys(headers).map(key =>
            key === 'season' ? `<th></th>` : `<th><img loading="lazy" src="${headers[key]}" decoding="async" alt="${key}" style="height: 32px; vertical-align: middle;"></th>`
        ).join('') + '</tr>';

        // 创建表格内容
        let tbody = wantedMissionTable.querySelector('tbody') || wantedMissionTable.appendChild(document.createElement('tbody'));
        tbody.innerHTML = wantedMissionData.map(row => `<tr>${Object.keys(headers).map(key => {
            const value = row[key];
            const colorMap = { red: 'var(--hero-color-red)', green: 'var(--hero-color-green)', blue: 'var(--hero-color-blue)', purple: 'var(--hero-color-purple)', yellow: 'var(--hero-color-yellow)' };
            const style = colorMap[key] ? `style="color: ${colorMap[key]}; font-weight: bold;"` : '';
            return `<td ${style}>${Array.isArray(value) ? value.join('<br>') : value}</td>`;
        }).join('')}</tr>`).join('');
    }

    // 切换视图的可见性
    heroTableView.classList.add('hidden');
    farmingGuideView.classList.add('hidden');
    wantedMissionView.classList.remove('hidden');

    // 恢复此视图的滚动位置
    resultsWrapper.scrollTop = state.scrollPositions.wanted.top;
    resultsWrapper.scrollLeft = state.scrollPositions.wanted.left;

    // 更新结果头部
    const langDict = i18n[state.currentLang];
    resultsCountEl.innerHTML = `<span>${langDict.wantedMissionTableTitle}</span>`;
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = langDict.returnToList;
    returnTag.onclick = () => { history.back(); };
    resultsCountEl.appendChild(returnTag);

    setTimeout(adjustStickyHeaders, 0);
    // 更新浏览器历史记录，以便后退按钮可以返回列表视图
    setMainViewHistory('wanted');
    refreshMainViewButtons();
}

/**
 * 初始化并显示材料出处指南视图。
 */
function initAndShowFarmingGuideView() {
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    if (state.teamSimulatorActive) toggleTeamSimulator();
    if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
    saveCurrentViewScrollPosition();

    const { farmingGuideTable, heroTableView, wantedMissionView, farmingGuideView, resultsWrapper, resultsCountEl } = uiElements;

    // 只在首次点击时渲染表格
    if (farmingGuideTable.innerHTML.trim() === '') {
        const headers = { item: '', s1: 'S1', s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6: 'UT1' };
        const headerKeys = Object.keys(headers);

        let thead = farmingGuideTable.querySelector('thead') || farmingGuideTable.appendChild(document.createElement('thead'));
        thead.innerHTML = '<tr>' + headerKeys.map((key, index) => `<th data-col-index="${index}">${headers[key]}</th>`).join('') + '</tr>';

        let tbody = farmingGuideTable.querySelector('tbody') || farmingGuideTable.appendChild(document.createElement('tbody'));
        tbody.innerHTML = farmingGuideData.map((row, rowIndex) => {
            const isSecondRow = rowIndex === 0; // 第二行（索引为0）

            return `<tr data-row-index="${rowIndex}">${headerKeys.map((key, colIndex) => {
                let value = row[key] || '';

                if (key === 'item') {
                    // 第一列物品图标渲染为图片
                    if (value) {
                        return `<td data-col-index="${colIndex}"><img loading="lazy" src="imgs/farm/${value}.webp" decoding="async" alt="${value}" class="farm-item-image"></td>`;
                        return `<td data-col-index="${colIndex}">${String(value).replace(/\n/g, '<br>')}</td>`;
                    }
                    return `<td data-col-index="${colIndex}"></td>`;
                }

                // 为第二行的非第一列添加点击事件
                if (isSecondRow && key !== 'item') {
                    const fileName = String(value).replace(/\n/g, '');
                    return `<td data-col-index="${colIndex}" class="clickable-avatar-mission" data-filename="${fileName}" style="cursor: pointer; text-decoration: underline; color: blue;">${String(value).replace(/\n/g, '<br>')}</td>`;
                }

                return `<td data-col-index="${colIndex}">${String(value).replace(/\n/g, '<br>')}</td>`;
            }).join('')}</tr>`;
        }).join('');

        // 添加点击事件监听器
        tbody.addEventListener('click', event => {
            if (farmingGuideView.classList.contains('hidden')) return;

            const target = event.target.closest('.clickable-avatar-mission');
            if (target) {
                const fileName = target.dataset.filename;
                if (fileName) {
                    // 在新标签页打开对应的webp文件
                    window.open(`imgs/avatar_mission/${fileName}.webp`, '_blank');
                }
                event.stopPropagation(); // 更可靠地阻止事件冒泡
                return;
            }

            // 单元格高亮
            const cell = event.target.closest('td');
            if (cell) applyHighlight(cell);
        });

        // 为表格单元格添加高亮事件
        const isMobile = window.innerWidth < 769;
        tbody.addEventListener(isMobile ? 'click' : 'mouseover', event => {
            if (farmingGuideView.classList.contains('hidden')) return;
            const cell = event.target.closest('td');
            if (cell && !cell.classList.contains('clickable-avatar-mission')) {
                applyHighlight(cell);
            }
        });
        if (!isMobile) {
            tbody.addEventListener('mouseout', clearFarmGuideHighlight);
        }
    }

    // 切换视图可见性
    heroTableView.classList.add('hidden');
    wantedMissionView.classList.add('hidden');
    farmingGuideView.classList.remove('hidden');

    // 恢复滚动位置
    resultsWrapper.scrollTop = state.scrollPositions.farming.top;
    resultsWrapper.scrollLeft = state.scrollPositions.farming.left;

    // 更新头部信息
    const langDict = i18n[state.currentLang];
    resultsCountEl.innerHTML = `<span>${langDict.farmingGuideTableTitle}</span>`;
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = langDict.returnToList;
    returnTag.onclick = () => { history.back(); };
    resultsCountEl.appendChild(returnTag);

    setTimeout(adjustStickyHeaders, 0);
    setMainViewHistory('farming');
    refreshMainViewButtons();
}

/**
 * 为材料指南表格应用高亮效果。
 * @param {HTMLElement} cell - 被悬停或点击的单元格。
 */
function applyHighlight(cell) {
    if (uiElements.farmingGuideView.classList.contains('hidden') || !cell) return;
    clearFarmGuideHighlight();
    const row = cell.parentElement;
    const table = cell.closest('table');
    const colIndex = cell.dataset.colIndex;
    if (!table || !colIndex) return;

    cell.classList.add('highlight-cell');
    const header = table.querySelector(`thead th[data-col-index="${colIndex}"]`);
    if (header) header.classList.add('highlight-axis');
    const rowLabel = row.querySelector('td:first-child');
    if (rowLabel) rowLabel.classList.add('highlight-axis');
}

/**
 * 清除材料指南表格的所有高亮效果。
 */
function clearFarmGuideHighlight() {
    if (uiElements.farmingGuideView.classList.contains('hidden')) return;
    uiElements.farmingGuideView.querySelectorAll('.highlight-axis, .highlight-cell').forEach(el => {
        el.classList.remove('highlight-axis', 'highlight-cell');
    });
}

/**
 * 初始化并显示聊天模拟器视图。
 */
function initAndShowChatSimulatorView() {
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    if (state.teamSimulatorActive) toggleTeamSimulator();
    saveCurrentViewScrollPosition();

    // 切换视图可见性
    uiElements.heroTableView.classList.add('hidden');
    uiElements.wantedMissionView.classList.add('hidden');
    uiElements.farmingGuideView.classList.add('hidden');
    uiElements.chatSimulatorView.classList.remove('hidden');

    // 恢复滚动位置
    uiElements.resultsWrapper.scrollTop = state.scrollPositions.chat.top;
    uiElements.resultsWrapper.scrollLeft = state.scrollPositions.chat.left;

    // 更新头部
    const langDict = i18n[state.currentLang];
    uiElements.resultsCountEl.innerHTML = `<span>${langDict.chatSimulatorTitle || '聊天模拟器'}</span>`;
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = langDict.returnToList;
    returnTag.onclick = () => { history.back(); };
    uiElements.resultsCountEl.appendChild(returnTag);

    setTimeout(adjustStickyHeaders, 0);
    setMainViewHistory('chat');
    refreshMainViewButtons();
}

/**
 * 显示灵魂兑换英雄列表的模态框
 */

function showSoulExchangeModal() {

    const summaryModal = uiElements.summonSummaryModal;
    // 直接通过ID获取，确保稳健性
    const scrollContainer = document.getElementById('summon-summary-scroll-container');
    if (!summaryModal || !scrollContainer) {
        return;
    }
    summaryModal.classList.remove('single-pull-result-view', 'summon-result-view');
    summaryModal.classList.add('soul-exchange-view');


    const langDict = i18n[state.currentLang];
    const modalTitle = summaryModal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = langDict.soulExchangeModalTitle;
    }

    scrollContainer.innerHTML = ''; // 清空之前的内容

    // ▼▼▼ 辅助函数：options 参数控制显示细节 ▼▼▼
    const createSoulExchangeCard = (hero, options = {}) => {
        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.elementId)}`;
        card.title = hero.name;

        if (hero.rarity === 5) {
            card.classList.add('star-5-marquee');
        }

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.elementId);

        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-hero-details'; // 使用新的 class 以便精确控制样式

        let starsContent = '';
        // ▼▼▼ 只有在 options.hideStars 不为 true 时才显示星星 ▼▼▼
        if (!options.hideStars && hero.rarity) {
            starsContent = `${hero.rarity}⭐`;
        }

        const starsHTML = starsContent
            ? `<div class="summary-hero-stars star-level-${hero.rarity}">${starsContent}</div>`
            : '';

        const colorIcon = String(hero.elementId || 'default').toLowerCase();
        const colorIconHTML = `<img loading="lazy" class="summary-color-icon" src="imgs/element/${colorIcon}.webp" decoding="async">`;

        detailsOverlay.innerHTML = `${colorIconHTML}${starsHTML}`;

        card.appendChild(avatar);
        card.appendChild(detailsOverlay);

        if (hero.type !== 'trainer' && hero.originalIndex !== undefined) {
            const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
            if (targetHero) {
                card.classList.add('is-clickable');
                card.addEventListener('click', () => {
                    summaryModal.close();
                    summaryModal.classList.add('hidden');
                    openDetailsModal(targetHero, {
                        onClose: () => {
                            summaryModal.classList.remove('hidden');
                            cancelModalClose(summaryModal);
                            summaryModal.showModal();
                            document.body.classList.add('modal-open');
                        }
                    });
                });
            }
        }
        return card;
    };

    // ▼▼▼ 手动构建每个分组并在之间添加分隔线 ▼▼▼
    const allGroups = [
        soulExchange.five,
        soulExchange.fifteen,
        soulExchange.thirty
    ];

    allGroups.forEach((heroIds, index) => {
        // 在第二个和第三个分组前添加分隔线
        if (index > 0) {
            const separator = document.createElement('hr');
            separator.className = 'soul-exchange-separator';
            scrollContainer.appendChild(separator);
        }

        const heroesContainer = document.createElement('div');
        heroesContainer.className = 'soul-exchange-heroes-container';

        heroIds.forEach(id => {
            const hero = state.heroesByIdMap.get(id);
            if (hero) {
                // 调用卡片创建函数，并传入 hideStars: true 选项
                const card = createSoulExchangeCard(hero, { hideStars: true });
                heroesContainer.appendChild(card);
            }
        });

        scrollContainer.appendChild(heroesContainer);
    });

    // 显示弹窗
    setTimeout(() => { scrollContainer.scrollTop = 0; }, 0);
    summaryModal.classList.remove('hidden');
    cancelModalClose(summaryModal);
    summaryModal.showModal();
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'summonSummary' }, null);
    state.modalStack.push('summonSummary');
}