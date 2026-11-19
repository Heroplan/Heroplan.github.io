/* lottery-ui.js — 抽奖模拟器表现层。
 *
 * 逻辑核心全部交给官方引擎 lottery-engine.js（消费 lottery_official.json）+ 官方概率
 * lottery-odds.js（消费 langs_json/odds_<码>.json）。本文件只负责 DOM / 动画 / 历史 /
 * 精选位几何 / 多语言 / 深链接等表现层。
 *
 * 对外契约（main.js / ui.js / filters.js / render.js / special-views.js 消费）：
 *   window.LotterySimulator.{initialize,toggle,handleActivityClick,renderFeaturedHeroes,
 *     orderFeaturedIdsByOfficialRule,featuredCellMap,updateSummonButtons,addHeroToFeaturedSlot}
 *   裸全局 refreshLotteryTranslations() / refreshPoolTitle()（语言切换时 ui.js 调）。
 *
 * 数据输入：initialize(officialData, displayMeta)
 *   officialData = lottery_official.json（引擎数据）
 *   displayMeta  = lottery_display.json（站点 cosmetic：order + banner/lotterybg/limitedPool）
 */
(function (global) {
    'use strict';

    const E = global.LotteryEngine;
    const Odds = global.LotteryOdds;
    const summonSound = new Audio('sounds/ui_summon-additional-draws.ogg');

    let engine = null;
    let officialData = null;
    let displayMeta = { order: [], pools: {} };
    let lotteryTitleDict = {};
    let oddsDict = {};
    let oddsLang = null;
    let oddsLoading = null;
    let oddsLoadingLang = null;

    // 奖励抽类别（引擎 result.kind）⇒ 表现层 Ex 标签 / 历史统计共用
    const BONUS_KINDS = ['bonus', 'hotm', 'mystery', 'extra'];
    const lower = s => String(s == null ? '' : s).toLowerCase();
    const esc = s => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // ────────────────────────────────────────────────────────────────────
    // 多语言
    // ────────────────────────────────────────────────────────────────────
    function refreshPoolTitle() {
        const el = document.getElementById('lottery-pool-title');
        if (el && state.currentSummonData) el.innerHTML = esc(getPoolDisplayName(state.currentSummonData));
    }

    function refreshLotteryTranslations() {
        lotteryTitleDict = (typeof Lang !== 'undefined' && Lang.get('lottery_title')) || {};
        loadOddsDict(state.currentLang);
    }

    // 文案表是奖池浮层与历史统计浮层共同的标签来源（缺失时 Odds.build 会整段丢掉奖励抽/丰收/免责行），
    // 故落地后两处都要重画。同语言在途请求复用；过期语言的响应不覆盖当前语言。
    function loadOddsDict(lang) {
        if (lang === oddsLang) return Promise.resolve();
        if (oddsLoading && oddsLoadingLang === lang) return oddsLoading;
        oddsLoadingLang = lang;
        oddsLoading = fetch(av('langs_json/odds_' + lang + '.json'))
            .then(r => (r.ok ? r.json() : {}))
            .catch(() => ({}))
            .then(d => {
                oddsLoading = null;
                if (lang !== state.currentLang) return;
                oddsDict = d || {}; oddsLang = lang;
                refreshProbabilityPanel();
                renderSummonHistory();
            });
        return oddsLoading;
    }

    // ────────────────────────────────────────────────────────────────────
    // 英雄显示桥接：引擎 id === 站点 heroId
    // ────────────────────────────────────────────────────────────────────
    function trainerDisplayName(eh) {
        const base = (typeof Lang !== 'undefined' && Lang.t('heroes_name', 'trainer')) || 'Trainer';
        return base;
    }

    /** 引擎英雄 id → 站点英雄对象（用于头像/详情）；训练师等站点未收录的用真实官方数据合成显示对象。 */
    function displayHero(id) {
        const site = state.heroesByIdMap && state.heroesByIdMap.get(id);
        const eh = engine && engine.idx.get(id);
        const elementId = eh ? lower(eh.element) : (site ? lower(site.elementId || site.element || '') : '');
        // 训练师头像/avatar 共用无稀有度后缀图像：trainer_red_epic → trainer_red（站点收录或引擎合成均归一）
        if (/^trainer_/.test(id) || (eh && eh.trainerType && eh.trainerType !== 'None')) {
            const trainerBase = id.replace(/_(common|uncommon|rare|epic|legendary)$/, '');
            const base = site || { name: trainerDisplayName(eh), rarity: eh ? eh.rarity : 0 };
            return Object.assign({}, base, {
                heroId: null, trainerId: trainerBase, type: 'trainer', family: 'trainer',
                elementId, element: elementId, image: `imgs/hero_icon/${trainerBase}.webp`,
            });
        }
        if (site) return site;
        return {
            heroId: id, name: (typeof Lang !== 'undefined' && Lang.t('heroes_name', id)) || id,
            rarity: eh ? eh.rarity : 0, elementId, element: elementId,
            family: eh ? eh.family : '', image: `imgs/hero_icon/${id}.webp`,
        };
    }

    // ────────────────────────────────────────────────────────────────────
    // 奖池标题 / 深链接
    // ────────────────────────────────────────────────────────────────────
    function getPoolTitleKey(poolConfig) {
        if (!poolConfig || !poolConfig.productType) return '';
        const special = ['BlackSummon', 'EpicHeroSummon', 'ChallengeEventSummon', 'MapSeasonSummon',
            'AllianceEventSummon', 'TowerEventSummon', 'SeasonalPremiumSummon', 'CostumeSummon'];
        return special.includes(poolConfig.productType)
            ? `lottery.title.${poolConfig.id.toLowerCase()}`
            : `lottery.title.${poolConfig.productType.toLowerCase()}`;
    }

    function getPoolDisplayName(poolConfig) {
        if (!poolConfig) return '';
        const key = resolvePoolTitleKey(poolConfig);
        if (key && lotteryTitleDict[key]) return lotteryTitleDict[key];
        return poolConfig.id.replace('lottery_', '').replace(/_/g, ' ');
    }

    // 官方产品 id 带年份后缀（_2026），而标题字典键用不带年份的 id / 类型+活动档。
    // 主键 miss 时按通用规则回落：① 去掉 trailing _YYYY；② <productType小写>_<associatedEvent>；
    // ③ 变体键 <productType小写>_<id事件段>（个别季节至尊池用此形式，按 id 后缀逐段匹配）。
    function resolvePoolTitleKey(poolConfig) {
        const primary = getPoolTitleKey(poolConfig);
        if (!primary) return '';
        if (lotteryTitleDict[primary]) return primary;
        const tail = primary.slice('lottery.title.'.length);
        const stripped = tail.replace(/_\d{4}$/, '');
        if (stripped !== tail && lotteryTitleDict['lottery.title.' + stripped]) return 'lottery.title.' + stripped;
        const pt = String(poolConfig.productType).toLowerCase();
        const ev = poolConfig.associatedEvent;
        if (ev) {
            const alt = 'lottery.title.' + pt + '_' + String(ev).toLowerCase();
            if (lotteryTitleDict[alt]) return alt;
        }
        const segs = String(poolConfig.id).toLowerCase().replace(/^lottery_/, '').replace(/_\d{4}$/, '').split('_');
        for (let i = 0; i < segs.length; i++) {
            const cand = 'lottery.title.' + pt + '_' + segs.slice(i).join('_');
            if (lotteryTitleDict[cand]) return cand;
        }
        return primary;
    }

    function poolUrlKeyOf(poolConfig) {
        const k = String(getPoolTitleKey(poolConfig) || '');
        return k.startsWith('lottery.title.') ? k.slice('lottery.title.'.length) : '';
    }

    function selectSummonPoolByUrlParam(param) {
        if (!param || !state.allSummonPools) return false;
        // 真正池 ID 优先（地址栏现行口径）；旧分享链接的标题键后缀仍兼容。
        let id = state.allSummonPools[param] ? param : null;
        if (!id) {
            for (const pid in state.allSummonPools) {
                if (poolUrlKeyOf(state.allSummonPools[pid]) === param) { id = pid; break; }
            }
        }
        if (!id) return false;
        handleActivityClick(id);
        return true;
    }

    // ────────────────────────────────────────────────────────────────────
    // 初始化
    // ────────────────────────────────────────────────────────────────────
    function buildHeroMaps() {
        state.latestHeroVersionsMap = new Map();
        state.heroesByIdMap = new Map();
        (state.allHeroes || []).forEach(hero => {
            if (!hero) return;
            if (hero.english_name && !hero.hidden && !hero.excluded) {
                const existing = state.latestHeroVersionsMap.get(hero.english_name);
                if (!existing || hero.costume_id > existing.costume_id) {
                    state.latestHeroVersionsMap.set(hero.english_name, hero);
                }
            }
            if (hero.heroId) state.heroesByIdMap.set(hero.heroId, hero);
        });
    }

    /** 从官方数据 + cosmetic 表构建在售池配置（列表顺序沿用 displayMeta.order）。 */
    function buildPools() {
        const pools = officialData.pools || {};
        const out = {};
        const order = (displayMeta.order && displayMeta.order.length)
            ? displayMeta.order
            : Object.keys(pools).filter(id => pools[id].amount === 1);
        order.forEach(id => {
            let p = pools[id];
            let baseId = id;
            // 虚拟聚合池（超级元素）：官方无聚合产品，取一个分色产品做代表。
            if (!p) {
                if (!engine.resolveAggregate(id)) return;
                baseId = Object.keys(pools).find(k => pools[k].amount === 1 && k.indexOf(id + '_') === 0);
                if (!baseId) return;
                p = pools[baseId];
            }
            if (p.amount !== 1 || !p.productType) return;
            // 只收录引擎能构建的池（有桶配置或 V1 权重）
            const hasIec = !!engine.iecByLotteryId[id];
            const hasV1 = Array.isArray(p.bucketWeights) && /^(ShadowSummon|TitanHunterSummon|PickupSummon)$/.test(p.productType);
            if (!hasIec && !hasV1 && !engine.resolveAggregate(id)) return;
            const meta = (displayMeta.pools || {})[id] || {};
            const ps = engine.getPlayerSelectedConfig(id, nowSeconds()) || {};
            const selSlots = ps.amountOfSelectableFeaturedSlots || 0;
            const selChoose = ps.entitiesToChooseFrom || [];
            const bulk10 = findBulk(baseId, 10, pools);
            const bulk30 = findBulk(baseId, 30, pools);
            out[id] = {
                id, productType: p.productType, gemPrice: p.gemPrice, amount: p.amount,
                enginePoolId: id,
                banner: meta.banner, lotterybg: meta.lotterybg,
                limitedPoolSummonConfiguration: meta.limitedPoolSummonConfiguration,
                featuredHeroNum: selSlots,
                amountOfSelectableFeaturedSlots: selSlots,
                entitiesToChooseFrom: selChoose,
                advertisedFeatured: ps.featuredHeroes || [],
                includeCostumes: p.includeCostumes === true,
                bulk10: bulk10 ? { id: bulk10.id, gemPrice: bulk10.gemPrice } : null,
                bulk30: bulk30 ? { id: bulk30.id, gemPrice: bulk30.gemPrice } : null,
                _official: p,
            };
        });
        return out;
    }

    function findBulk(id, amount, pools) {
        for (const k in pools) {
            const p = pools[k];
            if (p.sourceProductId === id && p.amount === amount) return p;
        }
        return null;
    }

    function initializeLotterySimulator(data, display) {
        officialData = data;
        displayMeta = display || { order: [], pools: {} };
        // characters 直接用站点已加载的官方角色定义
        // （utils.js loadData 暴露 state.charactersConfig），按 id 键组 heroes 供引擎过滤。
        const cc = state.charactersConfig || { heroes: [], balancedHeroes: [] };
        const heroesById = {};
        (cc.heroes || []).forEach(h => { heroesById[h.id] = h; });
        engine = E.create(Object.assign({}, data, {
            characters: { heroes: heroesById, balancedHeroes: cc.balancedHeroes || [] }
        }));

        preloadAssets(['sounds/ui_summon-additional-draws.ogg']);
        buildHeroMaps();

        state.soundEnabled = getCookie('lotterySoundEnabled') !== 'false';
        const modes = ['full', 'skip', 'silent'];
        const savedMode = getCookie('lotteryAnimationMode');
        state.lotteryAnimationMode = modes.includes(savedMode) ? savedMode : 'full';
        state.summonHistory = [];
        state.showAllSummonHistory = getCookie('lotteryShowAllHistory') === 'true';
        state.customFeaturedHeroes = [];
        state.currentSummonData = null;
        state.activeHeroSubset = null;
        state.featuredDisplayIds = [];
        state.featuredGroupSizes = [0, 0];
        state.featuredPortraitsReadByRow = false;

        // 声音开关
        const soundToggleButton = document.getElementById('toggle-sound-btn');
        if (soundToggleButton) {
            const updateSoundButtonUI = () => {
                soundToggleButton.textContent = state.soundEnabled ? '🔊' : '🔇';
                const d = i18n[state.currentLang] || {};
                soundToggleButton.title = state.soundEnabled ? (d.muteSound || 'Mute') : (d.unmuteSound || 'Unmute');
            };
            updateSoundButtonUI();
            soundToggleButton.addEventListener('click', () => {
                state.soundEnabled = !state.soundEnabled;
                setCookie('lotterySoundEnabled', state.soundEnabled, 365);
                updateSoundButtonUI();
            });
        }
        // 动画模式开关
        const animationToggleButton = document.getElementById('toggle-animation-btn');
        if (animationToggleButton) {
            const icons = ['▶️', '⏩', '⏭️'];
            const getTitles = () => {
                const d = i18n[state.currentLang] || {};
                return {
                    full: d.playMode_full || 'Play Full Animation',
                    skip: d.playMode_skip || 'Skip Animation',
                    silent: d.playMode_silent || 'Direct to History',
                };
            };
            const updateAnimationButtonUI = () => {
                const idx = modes.indexOf(state.lotteryAnimationMode);
                animationToggleButton.textContent = icons[idx] || icons[0];
                animationToggleButton.title = getTitles()[state.lotteryAnimationMode] || '';
            };
            updateAnimationButtonUI();
            animationToggleButton.addEventListener('click', () => {
                let idx = modes.indexOf(state.lotteryAnimationMode);
                state.lotteryAnimationMode = modes[(idx + 1) % modes.length];
                setCookie('lotteryAnimationMode', state.lotteryAnimationMode, 365);
                updateAnimationButtonUI();
            });
        }

        refreshLotteryTranslations();
        state.allSummonPools = buildPools();
        renderActivityList();
        loadHistoryFromLocalStorage();
        renderSummonHistory();
        migrateLegacyHistoryPoolKeys();

        document.getElementById('single-summon-btn')?.addEventListener('click', () => performSummon(1));
        document.getElementById('ten-summon-btn')?.addEventListener('click', () => performSummon(10));
        document.getElementById('thirty-summon-btn')?.addEventListener('click', () => performSummon(30));

        // 结果弹窗 OK：走 history.back() → 全局 handlePopState 弹栈关弹窗（与详情/筛选弹窗同一契约）。
        const summaryCloseBtn = document.getElementById('summary-close-btn');
        if (summaryCloseBtn) {
            summaryCloseBtn.addEventListener('click', () => {
                const m = document.getElementById('summon-summary-modal');
                if (m && !m.classList.contains('hidden') && !m.classList.contains('closing')) history.back();
            });
        }

        const clearHistoryBtn = document.getElementById('clear-history-btn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                const d = i18n[state.currentLang] || {};
                if (state.summonHistory.length === 0) return;
                if (state.showAllSummonHistory) {
                    if (confirm(d.confirmClearHistory || '确定要清空所有召唤历史记录吗？')) {
                        state.summonHistory = [];
                        saveHistoryToLocalStorage();
                        renderSummonHistory();
                    }
                } else {
                    const name = getPoolDisplayName(state.currentSummonData);
                    const key = getPoolTitleKey(state.currentSummonData);
                    if (confirm(d.confirmClearCurrentHistory || `确定要清空【${name}】的召唤记录吗？`)) {
                        state.summonHistory = state.summonHistory.filter(
                            g => !isCurrentPoolHistoryGroup(g, key, name));
                        saveHistoryToLocalStorage();
                        renderSummonHistory();
                    }
                }
            });
        }

        const toggleHistoryCheckbox = document.getElementById('toggle-history-view-checkbox');
        if (toggleHistoryCheckbox) {
            // 刷新后按持久化偏好恢复开关与视图（浏览器表单回填会让 checkbox 残留勾选，
            // 必须用 cookie 同步 state，避免开关 ON 但视图仍是当前池）。
            toggleHistoryCheckbox.checked = state.showAllSummonHistory;
            toggleHistoryCheckbox.addEventListener('change', () => {
                state.showAllSummonHistory = toggleHistoryCheckbox.checked;
                setCookie('lotteryShowAllHistory', state.showAllSummonHistory, 365);
                renderSummonHistory();
            });
        }

        // 移动端 tabs
        const tabs = document.querySelectorAll('.lottery-mobile-tabs .tab-button');
        const panels = document.querySelectorAll('.lottery-panel');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('active')) return;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.dataset.tabTarget;
                // 移动端面板显隐由 CSS `.active`（display:flex !important）驱动，不是 hidden 类。
                panels.forEach(p => p.classList.remove('active'));
                const targetPanel = document.querySelector(targetId);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });

        setupProbabilityTooltips();
    }

    // ────────────────────────────────────────────────────────────────────
    // 活动列表
    // ────────────────────────────────────────────────────────────────────
    function renderActivityList() {
        const listContainer = document.getElementById('lottery-activity-list');
        if (!listContainer || !state.allSummonPools) return;
        listContainer.innerHTML = '';
        Object.values(state.allSummonPools).forEach(pool => {
            const li = document.createElement('li');
            li.dataset.poolId = pool.id;
            const displayName = esc(getPoolDisplayName(pool));
            if (pool.banner) {
                li.style.backgroundImage = `url('imgs/lottery/banner/${pool.banner}.webp')`;
                li.style.backgroundSize = 'cover';
                li.style.backgroundRepeat = 'no-repeat';
                li.style.color = '#fff';
                li.style.textShadow = '1px 1px 2px black';
                li.innerHTML = displayName;
            } else {
                li.innerHTML = displayName + ' (No Banner)';
            }
            li.addEventListener('click', () => handleActivityClick(pool.id));
            listContainer.appendChild(li);
        });
    }

    // ────────────────────────────────────────────────────────────────────
    // 选中奖池
    // ────────────────────────────────────────────────────────────────────
    function nowSeconds() { return Math.floor(Date.now() / 1000); }

    function currentOpts() {
        const selected = (state.customFeaturedHeroes || []).filter(Boolean).map(h => h.heroId).filter(Boolean);
        return { time: nowSeconds(), selectedFeatured: selected };
    }

    async function handleActivityClick(poolId) {
        const existingWrapper = document.getElementById('lottery-title-wrapper');
        if (existingWrapper) {
            const titleEl = existingWrapper.querySelector('#lottery-pool-title');
            if (titleEl) existingWrapper.parentNode.insertBefore(titleEl, existingWrapper);
            existingWrapper.remove();
        }
        document.querySelectorAll('#lottery-activity-list li').forEach(li => {
            li.classList.toggle('active', li.dataset.poolId === poolId);
        });

        const poolConfig = state.allSummonPools?.[poolId];
        if (!poolConfig) return;
        state.currentSummonData = poolConfig;
        state.selectedElementalColor = null;
        poolConfig.enginePoolId = poolConfig.id;

        if (typeof urlWithParams === 'function') {
            // 地址栏一律用真正池 ID（如 lottery_league_default），不用标题键后缀。
            const pk = poolConfig.id || null;
            history.replaceState(Object.assign({}, history.state, { pool: pk }), '', urlWithParams({ pool: pk }));
        }

        // 超级元素：用户选色 ⇒ 引擎切到该色独立产品
        if (poolConfig.productType === 'SuperElementalSummon') {
            const elementalModal = document.getElementById('elemental-modal');
            elementalModal.classList.remove('hidden');
            cancelModalClose(elementalModal);
            elementalModal.showModal();
            document.body.classList.add('modal-open');
            const userChoice = await new Promise(resolve => {
                const container = document.querySelector('.elemental-selection-container');
                const handler = event => {
                    const target = event.target.closest('.elemental-icon');
                    if (target && target.dataset.element) {
                        container.removeEventListener('click', handler);
                        elementalModal.close();
                        elementalModal.classList.add('hidden');
                        document.body.classList.remove('modal-open');
                        resolve(target.dataset.element);
                    }
                };
                container.addEventListener('click', handler);
            });
            state.selectedElementalColor = userChoice;
            poolConfig.enginePoolId = poolConfig.id + '_' + userChoice;
        }

        // 精选位：官方引擎当期 featured（含轮换/月英闸）
        const built = engine.buildBuckets(poolConfig.enginePoolId, nowSeconds(), {});
        const featuredIds = (built && built.ctx.expectedFeatured) || [];
        const playerSelectedFeatured = (poolConfig.amountOfSelectableFeaturedSlots || 0) > 0
            || (poolConfig.entitiesToChooseFrom || []).length > 0;
        state.customFeaturedHeroes = [];
        let featuredDisplayIds;
        if (playerSelectedFeatured) {
            // 自选精选池 = 左列 k 个玩家自选槽 + 右列固定精选（引擎当期 featured）。竖排表下
            // 自选槽填 0..k-1（左列），固定精选从 max(k, ceil(N/2)) 格起（右列），不可移除。
            // 自选槽源 = playerSelected.featuredHeroes（宣传精选，生日/拟态兽为空）。
            const k = poolConfig.amountOfSelectableFeaturedSlots || 0;
            featuredDisplayIds = orderFeaturedIdsByOfficialRule(featuredIds);
            const fixedHeroes = featuredDisplayIds.map(id => state.heroesByIdMap.get(id) || null).filter(Boolean);
            const advertised = (poolConfig.advertisedFeatured || []).map(id => state.heroesByIdMap.get(id) || null);
            state.featuredPortraitsReadByRow = false;
            state.featuredGroupSizes = [k, fixedHeroes.length];
            for (let i = 0; i < k; i++) state.customFeaturedHeroes.push(advertised[i] || null);
            fixedHeroes.forEach(h => state.customFeaturedHeroes.push(h));
        } else {
            featuredDisplayIds = orderFeaturedIdsByOfficialRule(featuredIds);
            const heroesForSlots = featuredDisplayIds.map(id => state.heroesByIdMap.get(id) || null);
            const numSlots = featuredSlotCount(poolConfig, featuredDisplayIds.length);
            for (let i = 0; i < heroesForSlots.length && i < numSlots; i++) {
                state.customFeaturedHeroes.push(heroesForSlots[i]);
            }
            while (state.customFeaturedHeroes.length < numSlots) state.customFeaturedHeroes.push(null);
        }
        state.featuredDisplayIds = featuredDisplayIds;

        const titleEl = document.getElementById('lottery-pool-title');
        const backgroundEl = document.getElementById('lottery-background-image');
        const portalContainer = document.getElementById('lottery-portal-container');
        if (titleEl) titleEl.innerHTML = esc(getPoolDisplayName(poolConfig));

        // 三国限定池按钮（兑换名单）：官方 limitedPoolSummonConfiguration 挂在当期 recurring 条目上。
        if (poolId === 'lottery_mercenary_war_default') {
            const wctx = engine.buildContext(poolConfig.enginePoolId, nowSeconds(), {});
            const limited = (wctx && wctx.entry && wctx.entry.limitedPoolSummonConfiguration)
                || poolConfig.limitedPoolSummonConfiguration;
            if (limited && limited.enabled && limited.heroes) {
                const heroesToShow = limited.heroes.map(id => state.heroesByIdMap.get(id)).filter(Boolean);
                if (titleEl && heroesToShow.length > 0) {
                    const titleWrapper = document.createElement('div');
                    titleWrapper.id = 'lottery-title-wrapper';
                    titleWrapper.style.display = 'flex';
                    titleWrapper.style.flexDirection = 'column';
                    titleWrapper.style.alignItems = 'center';
                    titleEl.parentNode.insertBefore(titleWrapper, titleEl);
                    titleWrapper.appendChild(titleEl);
                    const w3kButton = document.createElement('button');
                    w3kButton.id = 'w3k-limited-pool-btn';
                    w3kButton.className = 'theme-toggle-btn';
                    w3kButton.title = (i18n[state.currentLang] || {}).w3kLimitedPoolTitle;
                    w3kButton.innerHTML = `<img loading="lazy" src="imgs/coins/red_lucky.webp" decoding="async" style="width: 28px; height: 28px;">`;
                    w3kButton.style.marginTop = '1px';
                    w3kButton.addEventListener('click', () => {
                        showSummaryModal(heroesToShow.map(hero => ({ hero, bucket: 'w3k_limited' })));
                    });
                    titleWrapper.appendChild(w3kButton);
                }
            }
        }

        if (backgroundEl) {
            if (poolConfig.lotterybg) {
                backgroundEl.style.backgroundImage = `url('imgs/lottery/lotterybg/${poolConfig.lotterybg}.webp')`;
            } else {
                backgroundEl.style.backgroundImage = 'none';
                backgroundEl.style.backgroundColor = '#222';
            }
        }

        if (portalContainer) {
            portalContainer.querySelector('.probability-info-icon')?.remove();
            portalContainer.querySelectorAll('.guide-button').forEach(btn => btn.remove());
            buildProbabilityPanel(portalContainer, poolConfig);
            buildGuideButtons(portalContainer, poolConfig);
        }

        state.activeHeroSubset = getPoolSubset(poolConfig);
        state.currentSort = { key: 'Release date', direction: 'desc' };
        applyFiltersAndRender();
        renderFeaturedHeroes();
        updateSummonButtons();
        renderSummonHistory();
    }

    /** 官方池内容（桶成员并集 → 站点英雄），供英雄表复用。 */
    function getPoolSubset(poolConfig) {
        if (!poolConfig) return [];
        const built = engine.buildBuckets(poolConfig.enginePoolId, nowSeconds(), currentOpts());
        if (!built) return [];
        const ids = new Set();
        built.buckets.forEach(b => b.entries.forEach(e => ids.add(e.id)));
        // 玩家自选精选候选（拟态兽/黑色生日）：精选桶初始为空，候选不在桶成员里，
        // 须并入网格才能点选入槽（对齐旧 getAllHeroesInPool 的 entitiesToChooseFrom 注入）。
        (poolConfig.entitiesToChooseFrom || []).forEach(id => ids.add(id));
        let heroes = [];
        ids.forEach(id => { const h = state.heroesByIdMap.get(id); if (h) heroes.push(h); });
        // 排除近期英雄开关（超级元素/丰收）：仅影响表格展示，不改官方抽取逻辑
        const toggle = document.getElementById('exclude-recent-heroes-toggle');
        if (toggle && toggle.checked && /^(SuperElementalSummon|HarvestSummon)$/.test(poolConfig.productType)) {
            const cutoff = Date.now() - 180 * 86400000;
            heroes = heroes.filter(h => {
                const d = h.releaseDate || h['Release date'];
                if (!d) return true;
                const t = Date.parse(String(d).replace(' ', 'T') + 'Z');
                return isNaN(t) ? true : t < cutoff;
            });
        }
        return heroes;
    }

    // ────────────────────────────────────────────────────────────────────
    // 官方概率浮层
    // ────────────────────────────────────────────────────────────────────
    function oddsLineLabel(line, percent, noAsterisks) {
        const tpl = oddsDict[line.key];
        let text;
        if (tpl != null) {
            if (line.params) {
                text = Odds.render(tpl, line.params);
            } else {
                text = Odds.render(tpl, percent != null ? [percent] : []);
                // 统计浮层只要桶名（经验百分比另列）：去掉模板里的 {0}% 残留与冒号（含全角）。
                if (percent == null) text = text.replace(/%\s*$/, '').replace(/[:：]\s*$/, '').trim();
            }
        } else {
            text = percent != null ? line.key + ': ' + percent + '%' : line.key;
        }
        if (!noAsterisks && line.asterisks && line.asterisks.length) {
            // 官方逐个裹 asterisk.trailing.N（"{0} "+N 星），非 *1/*2 数字。
            for (const n of line.asterisks) {
                const at = oddsDict['asterisk.trailing.' + n];
                text = at != null ? Odds.render(at, [text]) : text + ' ' + '*'.repeat(n);
            }
        }
        return esc(text);
    }

    // 排除近期英雄由官方桶级配置承担（youngest/oldestCharacterAgeInDays，引擎已生效）；
    // 手动 180 天开关仅作调试覆盖，默认不渲染（?debug=1 或 window.ENABLE_LOTTERY_DEBUG 才显示）。
    function lotteryDebugEnabled() {
        try {
            return window.ENABLE_LOTTERY_DEBUG === true || new URLSearchParams(location.search).get('debug') === '1';
        } catch (e) { return false; }
    }

    function renderOddsHTML(poolConfig) {
        const d = i18n[state.currentLang] || {};
        const odds = Odds.build(engine, poolConfig.enginePoolId,
            Object.assign({ oddsText: oddsDict }, currentOpts()));
        let toggleHTML = '';
        if (lotteryDebugEnabled() && /^(SuperElementalSummon|HarvestSummon)$/.test(poolConfig.productType)) {
            const label = d.exclude180DaysRule || '启用排除180天内英雄规则';
            toggleHTML = `<div class="probability-toggle-rule"><input type="checkbox" id="exclude-recent-heroes-toggle"><label for="exclude-recent-heroes-toggle">${label}</label></div>`;
        }
        if (!odds) {
            return `<div class="probability-tooltip" popover="manual">${toggleHTML}<h4>${d.probabilityInfoTitle || '概率详情'}</h4></div>`;
        }
        const renderLines = (lines) => lines.map(line => line.isDescription
            ? `<li class="probability-desc">${oddsLineLabel(line, null)}</li>`
            : `<li><span>${oddsLineLabel(line, line.percent)}</span></li>`).join('');
        const renderAster = (asterisks) => asterisks.length ? '<ul class="probability-asterisks">' + asterisks.map((a, i) => {
            const tpl = oddsDict[a.key];
            const txt = tpl != null ? Odds.render(tpl, a.params) : a.key;
            // 官方脚注前缀 asterisk.leading.N（N 星+" {0}"），N=脚注序号。
            const lt = oddsDict['asterisk.leading.' + (i + 1)];
            const labeled = lt != null ? Odds.render(lt, [txt]) : '*'.repeat(i + 1) + ' ' + txt;
            return `<li>${esc(labeled)}</li>`;
        }).join('') + '</ul>' : '';
        const sectionTitle = (key, fallback) => {
            const tpl = oddsDict[key];
            return esc(tpl != null ? Odds.render(tpl, []) : fallback);
        };
        let bodyHTML;
        if (odds.extraLines && odds.extraLines.length) {
            bodyHTML = `<h5 class="probability-section-title">${sectionTitle('odds.details.odds_normal', 'Odds')}</h5>`
                + `<ul>${renderLines(odds.lines)}</ul>${renderAster(odds.asterisks)}`
                + `<h5 class="probability-section-title">${sectionTitle('odds.details.odds_extra', 'Bonus draw odds')}</h5>`
                + `<ul>${renderLines(odds.extraLines)}</ul>${renderAster(odds.extraAsterisks)}`;
        } else {
            bodyHTML = `<ul>${renderLines(odds.lines)}</ul>${renderAster(odds.asterisks)}`;
        }
        let bonusHTML = '';
        if (odds.bonusLines && odds.bonusLines.length) {
            const items = odds.bonusLines.map(bl => {
                const tpl = oddsDict[bl.key];
                if (tpl == null) return '';
                const heroName = (typeof Lang !== 'undefined' && Lang.t('heroes_name', bl.heroId)) || bl.heroId;
                return `<li><span>${esc(Odds.render(tpl, [bl.params[0], heroName]))}</span></li>`;
            }).join('');
            bonusHTML = `<h5 class="probability-section-title">${sectionTitle(odds.bonusTitleKey, 'Bonus Draw')}</h5><ul class="probability-bonus">${items}</ul>`;
        }
        let disclaimerHTML = '';
        if (odds.disclaimers.length) {
            const items = odds.disclaimers.map(k => {
                const tpl = oddsDict[k];
                const txt = tpl != null ? Odds.render(tpl, []) : k;
                return `<li>${esc(txt)}</li>`;
            }).join('');
            disclaimerHTML = `<h5 class="probability-section-title">${sectionTitle(odds.disclaimerTitleKey, 'Extra Info')}</h5><ul class="probability-disclaimer">${items}</ul>`;
        }
        let harvestHTML = '';
        if (odds.harvestDraw) {
            const hLines = odds.harvestDraw.body.split('\n').filter(ln => ln.trim())
                .map(ln => `<li><span>${esc(Odds.render(ln, []))}</span></li>`).join('');
            harvestHTML = `<h5 class="probability-section-title">${sectionTitle(odds.harvestDraw.titleKey, '丰收额外抽卡')}</h5><ul class="probability-harvest">${hLines}</ul>`;
        }
        return `
            <div class="probability-tooltip" popover="manual">
                ${toggleHTML}
                <h4>${d.probabilityInfoTitle || '概率详情'}</h4>
                ${bodyHTML}
                ${harvestHTML}
                ${bonusHTML}
                ${disclaimerHTML}
            </div>`;
    }

    function buildProbabilityPanel(portalContainer, poolConfig) {
        const infoIcon = document.createElement('div');
        infoIcon.className = 'probability-info-icon';
        infoIcon.textContent = 'ⓘ';
        infoIcon.style.position = 'absolute';
        infoIcon.style.top = '10px';
        infoIcon.style.left = '10px';
        infoIcon.title = (i18n[state.currentLang] || {}).probabilityInfoTitle || '查看概率详情';
        infoIcon.innerHTML += renderOddsHTML(poolConfig);
        const contentOverlay = portalContainer.querySelector('.lottery-content-overlay');
        (contentOverlay || portalContainer).appendChild(infoIcon);
        setTimeout(() => {
            const excludeToggle = document.getElementById('exclude-recent-heroes-toggle');
            if (excludeToggle) {
                excludeToggle.addEventListener('change', () => {
                    state.activeHeroSubset = getPoolSubset(poolConfig);
                    applyFiltersAndRender();
                });
            }
        }, 0);
    }

    /** 语言切换 / 数据就绪后重画当前池概率浮层（保留图标位置）。 */
    function refreshProbabilityPanel() {
        const poolConfig = state.currentSummonData;
        if (!poolConfig) return;
        const icon = document.querySelector('.probability-info-icon');
        if (!icon) return;
        const tooltip = icon.querySelector('.probability-tooltip');
        if (tooltip) tooltip.outerHTML = renderOddsHTML(poolConfig);
        if (icon.classList.contains('pinned')) positionProbabilityTooltip(icon);
        const excludeToggle = document.getElementById('exclude-recent-heroes-toggle');
        if (excludeToggle) {
            excludeToggle.addEventListener('change', () => {
                state.activeHeroSubset = getPoolSubset(poolConfig);
                applyFiltersAndRender();
            });
        }
    }

    // 概率浮层 fixed 定位（逃逸门户 overflow:hidden 裁剪），贴靠图标并约束在视口内，
    // 长内容/长语言/移动端可在浮层内滚动完整查看。hover 与点击 pinned 均触发定位。
    // popover="manual" 把浮层提升到 top-layer，逃逸祖先层叠上下文（门户 overlay/图标 z-index），
    // 否则 fixed z-index 被困在低优先级祖先上下文内、被 sticky 表头遮挡。元素仍留 DOM 原位。
    const supportsPopover = 'popover' in HTMLElement.prototype;
    function openTip(tip) {
        if (supportsPopover && tip && !tip.matches(':popover-open')) tip.showPopover();
    }
    function closeTip(tip) {
        if (supportsPopover && tip && tip.matches(':popover-open')) tip.hidePopover();
    }
    function positionProbabilityTooltip(icon) {
        const tip = icon.querySelector('.probability-tooltip');
        if (!tip) return;
        openTip(tip); // 先入 top-layer（closed 时 display:none 量不到尺寸）再定位
        const r = icon.getBoundingClientRect();
        const tw = tip.offsetWidth, th = tip.offsetHeight;
        const pad = 8;
        let left = r.left;
        let top = r.bottom + 6;
        if (left + tw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - pad - tw);
        if (left < pad) left = pad;
        if (top + th > window.innerHeight - pad) top = Math.max(pad, r.top - 6 - th);
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }

    function setupProbabilityTooltips() {
        const sel = '.probability-info-icon, .history-probability-icon';
        const pinnedSel = '.probability-info-icon.pinned, .history-probability-icon.pinned';
        const tipOf = icon => icon.querySelector('.probability-tooltip');
        document.addEventListener('mouseover', (e) => {
            const icon = e.target.closest(sel);
            if (icon) positionProbabilityTooltip(icon);
        });
        document.addEventListener('mouseout', (e) => {
            const icon = e.target.closest(sel);
            if (!icon || icon.classList.contains('pinned')) return;
            if (e.relatedTarget && icon.contains(e.relatedTarget)) return; // 移入浮层（DOM 子元素）不关闭
            closeTip(tipOf(icon));
        });
        document.addEventListener('click', (e) => {
            const icon = e.target.closest(sel);
            if (icon) {
                if (e.target.closest('.probability-tooltip')) return; // 浮层内交互（排除规则开关等）不关闭
                icon.classList.toggle('pinned');
                if (icon.classList.contains('pinned')) positionProbabilityTooltip(icon);
                else closeTip(tipOf(icon));
                return;
            }
            if (!e.target.closest('.probability-tooltip')) {
                document.querySelectorAll(pinnedSel).forEach(el => { el.classList.remove('pinned'); closeTip(tipOf(el)); });
            }
        });
        const reposition = () => document.querySelectorAll(pinnedSel).forEach(positionProbabilityTooltip);
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, true);
    }

    function buildGuideButtons(portalContainer, poolConfig) {
        const contentOverlay = portalContainer.querySelector('.lottery-content-overlay');
        if (!contentOverlay) return;
        let buttonPositionLeft = 48;
        const buttonGap = 38;
        let basePath;
        if (poolConfig.id === 'lottery_super_elemental' && state.selectedElementalColor) {
            basePath = `imgs/quest_event_guide/lottery_super_elemental_${state.selectedElementalColor}`;
        } else {
            basePath = `imgs/quest_event_guide/${poolConfig.id}`;
        }
        const checkFileExists = async url => {
            try { const r = await fetch(url, { method: 'HEAD' }); return r.status === 200; }
            catch (e) { return false; }
        };
        const checkAndLoop = async (index, leftPos) => {
            if (index > 5) return;
            const path = `${basePath}_${index}.webp`;
            if (await checkFileExists(path)) {
                const button = createGuideButton(path, '⚔️');
                button.style.left = `${leftPos}px`;
                contentOverlay.appendChild(button);
                await checkAndLoop(index + 1, leftPos + buttonGap);
            }
        };
        checkFileExists(`${basePath}.webp`).then(exists => {
            if (exists) {
                const baseButton = createGuideButton(`${basePath}.webp`, '⚔️');
                baseButton.style.left = `${buttonPositionLeft}px`;
                contentOverlay.appendChild(baseButton);
            } else {
                checkAndLoop(1, buttonPositionLeft);
            }
        });
    }

    function createGuideButton(imagePath, buttonText) {
        const button = document.createElement('a');
        button.href = imagePath;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.className = 'guide-button';
        button.textContent = buttonText;
        button.title = (i18n[state.currentLang] || {}).StageGuideTitle || '关卡指南';
        return button;
    }

    // ────────────────────────────────────────────────────────────────────
    // 精选位几何（官方口径）
    // ────────────────────────────────────────────────────────────────────
    function featuredSlotCount(pool, entityCount) {
        if (!pool) return 0;
        if ((pool.amountOfSelectableFeaturedSlots || 0) > 0 || (pool.entitiesToChooseFrom || []).length > 0) {
            // 自选 k 槽 + 固定精选槽（第二组条数，init 写入 featuredGroupSizes）
            return (pool.amountOfSelectableFeaturedSlots || 0) + ((state.featuredGroupSizes || [0, 0])[1] || 0);
        }
        const configured = pool.featuredHeroNum || 0;
        const entities = entityCount != null ? entityCount
            : (Array.isArray(pool.featuredHeroes) ? pool.featuredHeroes.length : 0);
        return entities || configured;
    }

    function officialNameKey(heroId) {
        const i = heroId.indexOf('_', 4);
        return i < 0 ? heroId : heroId.slice(0, i);
    }

    function orderFeaturedIdsByOfficialRule(idList) {
        state.featuredPortraitsReadByRow = false;
        const list = Array.isArray(idList) ? idList : [];
        state.featuredGroupSizes = [list.length, 0];
        if (list.length < 2) return idList;
        if (list.some(id => !state.heroesByIdMap.get(id))) return idList;
        const advertised = idList[0];
        const isAdvertised = hero => (hero.heroId === advertised ? 1 : 0);
        const cmp = (a, b) => {
            const ha = state.heroesByIdMap.get(a);
            const hb = state.heroesByIdMap.get(b);
            if (hb.rarity !== ha.rarity) return hb.rarity - ha.rarity;
            if (isAdvertised(hb) !== isAdvertised(ha)) return isAdvertised(hb) - isAdvertised(ha);
            const da = ha.releaseDate || '';
            const db = hb.releaseDate || '';
            if (da !== db) return da < db ? 1 : -1;
            const ka = officialNameKey(ha.heroId);
            const kb = officialNameKey(hb.heroId);
            if (ka !== kb) return ka < kb ? -1 : 1;
            if (ha.heroId !== hb.heroId) return ha.heroId < hb.heroId ? -1 : 1;
            return 0;
        };
        const isCostume = id => !!state.heroesByIdMap.get(id).parentHeroId;
        const costumes = list.filter(isCostume);
        const others = list.filter(id => !isCostume(id));
        const first = costumes.length >= others.length ? costumes : others;
        const second = first === costumes ? others : costumes;
        state.featuredPortraitsReadByRow = list.length === 2 || list.length === 4;
        state.featuredGroupSizes = [first.length, second.length];
        return first.slice().sort(cmp).concat(second.slice().sort(cmp));
    }

    const FEATURED_CELL_SEQUENCES = {
        default: {
            vertical: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
            horizontal: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
        },
        atlantis: {
            vertical: [[0, 0], [0, 1], [1, 0], [1, 1]],
            horizontal: [[0, 0], [0, 1], [1, 0], [1, 1]],
        },
    };

    function featuredCellSequence(pool) {
        const theme = String((pool && (pool.banner || pool.lotterybg)) || '');
        const table = /atlantis|season2/i.test(theme) ? FEATURED_CELL_SEQUENCES.atlantis : FEATURED_CELL_SEQUENCES.default;
        return table[state.featuredPortraitsReadByRow ? 'horizontal' : 'vertical'];
    }

    function featuredLitCellIndices(pool) {
        const seq = featuredCellSequence(pool);
        const sizes = state.featuredGroupSizes || [seq.length, 0];
        const [l, s] = sizes;
        const start2 = state.featuredPortraitsReadByRow ? l : Math.max(l, Math.ceil(seq.length / 2));
        const out = [];
        for (let i = 0; i < l; i++) out.push(i);
        for (let i = 0; i < s; i++) out.push(start2 + i);
        return out.filter(c => c < seq.length);
    }

    function featuredCellMap(n, pool) {
        const seq = featuredCellSequence(pool);
        const lit = featuredLitCellIndices(pool);
        const out = [];
        for (let i = 0; i < n; i++) out.push(seq[lit[i] !== undefined ? lit[i] : i % seq.length]);
        return out;
    }

    function renderFeaturedHeroes() {
        const leftColumn = document.getElementById('featured-heroes-left');
        const rightColumn = document.getElementById('featured-heroes-right');
        if (!leftColumn || !rightColumn || !state.currentSummonData) return;
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        const numFeatured = featuredSlotCount(state.currentSummonData, state.customFeaturedHeroes.length);
        const cellMap = featuredCellMap(numFeatured, state.currentSummonData);
        const columns = [[], []];
        rightColumn.style.display = cellMap.some(c => c[0] === 1) ? '' : 'none';
        const selSlots = state.currentSummonData.amountOfSelectableFeaturedSlots || 0;
        const isSelfSelect = selSlots > 0 || (state.currentSummonData.entitiesToChooseFrom || []).length > 0;
        const isFixedSlot = i => isSelfSelect && i >= selSlots;
        for (let i = 0; i < numFeatured; i++) {
            const slot = document.createElement('div');
            slot.className = 'featured-hero-slot';
            slot.dataset.slotIndex = i;
            const hero = state.customFeaturedHeroes[i] || null;
            if (hero && (hero.isFeaturedOnly || isFixedSlot(i))) slot.classList.add('non-removable');
            if (hero) {
                const avatarContainer = document.createElement('div');
                avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.elementId)}`;
                avatarContainer.style.width = '100%';
                avatarContainer.style.height = '100%';
                const avatarBackground = document.createElement('div');
                avatarBackground.className = 'hero-avatar-background';
                avatarBackground.style.background = getHeroColorLightGradient(hero.elementId);
                const avatarImg = document.createElement('img');
                avatarImg.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);
                avatarImg.className = 'hero-avatar-image';
                avatarImg.alt = hero.name;
                avatarContainer.append(avatarBackground, avatarImg);
                slot.appendChild(avatarContainer);
            }
            slot.addEventListener('dblclick', () => {
                const h = state.customFeaturedHeroes[i];
                if (h && !h.isFeaturedOnly && !isFixedSlot(i)) {
                    removeHeroFromFeaturedSlot(i);
                }
            });
            const [col, row] = cellMap[i];
            columns[col][row] = slot;
        }
        for (const [colIndex, columnEl] of [[0, leftColumn], [1, rightColumn]]) {
            for (const slot of columns[colIndex]) if (slot) columnEl.appendChild(slot);
        }
    }

    function updateSummonButtons() {
        const pool = state.currentSummonData;
        const singleBtn = document.getElementById('single-summon-btn');
        const tenBtn = document.getElementById('ten-summon-btn');
        const thirtyBtn = document.getElementById('thirty-summon-btn');
        if (!singleBtn || !tenBtn || !thirtyBtn || !pool) return;
        singleBtn.querySelector('.gem-price').textContent = pool.gemPrice;
        if (pool.bulk10) {
            tenBtn.classList.remove('hidden');
            tenBtn.querySelector('.gem-price').textContent = pool.bulk10.gemPrice;
        } else tenBtn.classList.add('hidden');
        if (pool.bulk30) {
            thirtyBtn.classList.remove('hidden');
            thirtyBtn.querySelector('.gem-price').textContent = pool.bulk30.gemPrice;
        } else thirtyBtn.classList.add('hidden');
    }

    function addHeroToFeaturedSlot(selectedHero) {
        const poolConfig = state.currentSummonData;
        const d = i18n[state.currentLang] || {};
        const explicitList = poolConfig && poolConfig.entitiesToChooseFrom && poolConfig.entitiesToChooseFrom.length > 0;
        if (explicitList) {
            // 官方显式自选名单：IsValid 只校验成员资格（名单含第一套服装），名单即权威。
            if (!poolConfig.entitiesToChooseFrom.includes(selectedHero.heroId)) {
                alert(d.featuredHeroNotAllowed || '该英雄无法在此奖池中被选为精选英雄。');
                return;
            }
        } else if (poolConfig && selectedHero.costume_id && poolConfig.includeCostumes !== true) {
            // 无显式名单的开放精选：服装须 includeCostumes 为真（官方 IsHeroEligibleForSelection）。
            alert(d.featuredHeroNotAllowed || '该英雄无法在此奖池中被选为精选英雄。');
            return;
        }
        if (selectedHero.rarity !== 5) {
            alert(d.mustSelect5StarHero || '请选择一位5星英雄。');
            return;
        }
        const emptyIndex = state.customFeaturedHeroes.findIndex(h => h === null || h === undefined);
        if (emptyIndex !== -1) {
            state.customFeaturedHeroes[emptyIndex] = selectedHero;
            renderFeaturedHeroes();
            applyFiltersAndRender();
        } else {
            alert(d.featuredSlotsFull || '所有精选英雄卡槽已满，可双击精选英雄头像移除。');
        }
    }

    function removeHeroFromFeaturedSlot(slotIndex) {
        if (state.customFeaturedHeroes[slotIndex]) {
            state.customFeaturedHeroes[slotIndex] = null;
            renderFeaturedHeroes();
            applyFiltersAndRender();
        }
    }

    // ────────────────────────────────────────────────────────────────────
    // 召唤（官方引擎）
    // ────────────────────────────────────────────────────────────────────
    async function performSummon(count) {
        const poolConfig = state.currentSummonData;
        if (!poolConfig) return;
        const d = i18n[state.currentLang] || {};
        if (poolConfig.featuredHeroNum > 0 && !state.customFeaturedHeroes.some(h => h !== null)) {
            alert(d.featuredHeroRequired);
            return;
        }
        const opts = Object.assign(currentOpts(), { count });
        const res = engine.summon(poolConfig.enginePoolId, opts);
        if (!res || res.error || !res.results || res.results.length === 0) return;

        // 引擎结果 → 表现层 {hero, bucket, kind}
        const flat = res.results.map(r => {
            const hero = displayHero(r.id);
            const bucket = r.bonus ? (r.kind || 'bonus') : 'main';
            return { hero, bucket, kind: r.kind || null, source: r.source || null, bucketIndex: r.bucketIndex, id: r.id, pullIndex: r.pullIndex, triggerIndex: r.triggerIndex };
        });
        // 奖励抽回到触发它的主抽之后展示（引擎按官方次序尾部追加，triggerIndex 记录触发主抽序号）。
        const mains = flat.filter(r => r.bucket === 'main');
        const mainIdx = new Set(mains.map(m => m.pullIndex));
        const byTrigger = new Map();
        const orphans = [];
        flat.forEach(r => {
            if (r.bucket === 'main') return;
            if (r.triggerIndex != null && mainIdx.has(r.triggerIndex)) {
                if (!byTrigger.has(r.triggerIndex)) byTrigger.set(r.triggerIndex, []);
                byTrigger.get(r.triggerIndex).push(r);
            } else orphans.push(r);
        });
        const groupedResults = mains.map(m => [m, ...(byTrigger.get(m.pullIndex) || [])]);
        if (orphans.length) groupedResults.push(orphans);
        const totalSummonedResults = groupedResults.flat();

        if (state.lotteryAnimationMode === 'silent') {
            updateSummonHistory(groupedResults, count);
            return;
        }
        if (state.lotteryAnimationMode === 'skip') {
            updateSummonHistory(groupedResults, count);
            if (count === 1) showSinglePullResultsModal(totalSummonedResults);
            else showSummaryModal(totalSummonedResults);
            return;
        }

        // full 模式
        const animationViewport = document.getElementById('lottery-hero-display-area');
        const blockerOverlay = document.getElementById('animation-blocker-overlay');
        const buttonParentContainer = document.getElementById('lottery-simulator-wrapper');
        const titleElement = document.getElementById('lottery-pool-title');
        const portalContainer = document.getElementById('lottery-portal-container');
        if (!titleElement || !portalContainer || !animationViewport || !blockerOverlay || !buttonParentContainer) {
            updateSummonHistory(groupedResults, count);
            if (count === 1) showSinglePullResultsModal(totalSummonedResults);
            else showSummaryModal(totalSummonedResults);
            return;
        }
        const skipButton = document.createElement('button');
        blockerOverlay.classList.remove('hidden');
        skipButton.id = 'skip-animation-btn';
        skipButton.textContent = d.skipAnimation || '跳过动画';
        skipButton.className = 'action-button';
        const parentRect = buttonParentContainer.getBoundingClientRect();
        const titleRect = titleElement.getBoundingClientRect();
        const portalRect = portalContainer.getBoundingClientRect();
        skipButton.style.position = 'absolute';
        skipButton.style.top = `${titleRect.bottom + 15 - parentRect.top}px`;
        skipButton.style.left = `${portalRect.left + portalRect.width / 2 - parentRect.left}px`;
        skipButton.style.transform = 'translateX(-50%)';
        buttonParentContainer.appendChild(skipButton);
        let skip = false;
        const skipHandler = () => {
            skip = true;
            if (buttonParentContainer.contains(skipButton)) buttonParentContainer.removeChild(skipButton);
            blockerOverlay.classList.add('hidden');
        };
        skipButton.addEventListener('click', skipHandler, { once: true });
        for (const result of totalSummonedResults) {
            if (skip) break;
            await showSingleSummonAnimation(result.hero, animationViewport, BONUS_KINDS.includes(result.bucket));
        }
        blockerOverlay.classList.add('hidden');
        if (buttonParentContainer.contains(skipButton)) buttonParentContainer.removeChild(skipButton);
        updateSummonHistory(groupedResults, count);
        if (count === 1) showSinglePullResultsModal(totalSummonedResults);
        else showSummaryModal(totalSummonedResults);
    }

    function showSingleSummonAnimation(hero, animationViewport, isBonusDraw = false) {
        if (state.soundEnabled) {
            summonSound.currentTime = 0;
            summonSound.play();
        }
        return new Promise(resolve => {
            animationViewport.innerHTML = '';
            const heroAvatarContainer = document.createElement('div');
            const heroImage = document.createElement('img');
            const lightEffect = document.createElement('div');
            heroImage.style.width = '100%';
            heroImage.style.height = '100%';
            heroImage.style.objectFit = 'contain';
            lightEffect.className = 'summon-animation-element';
            lightEffect.innerHTML = `<img loading="lazy" src="imgs/lottery/gate/lottery_animation_light.webp" decoding="async" class="anim-light-img">`;
            lightEffect.style.filter = `drop-shadow(0 0 15px ${getColorHex(hero.elementId)})`;
            const playAnimation = () => {
                if (isBonusDraw) {
                    const bonusImg = document.createElement('img');
                    bonusImg.src = 'imgs/lottery/gate/lottery_animation_bonus.webp';
                    bonusImg.className = 'bonus-summon-overlay';
                    animationViewport.appendChild(bonusImg);
                }
                animationViewport.appendChild(lightEffect);
                animationViewport.appendChild(heroAvatarContainer);
                setTimeout(() => { animationViewport.innerHTML = ''; resolve(); }, 1200);
            };
            const baseIconId = hero.heroId || hero.trainerId || null;
            if (baseIconId) {
                // 训练师全稀有度共用 avatar（无稀有度后缀）：trainer_red_common → trainer_red
                const avatarId = /^trainer_/.test(baseIconId)
                    ? baseIconId.replace(/_(common|uncommon|rare|epic|legendary)$/, '')
                    : baseIconId;
                const avatarSrc = `imgs/avatar/${avatarId}.webp`;
                const iconSrc = `imgs/hero_icon/${baseIconId}.webp`;
                heroImage.onload = () => {
                    heroAvatarContainer.removeAttribute('style');
                    heroAvatarContainer.className = 'summon-animation-element anim-hero-art is-avatar';
                    heroAvatarContainer.appendChild(heroImage);
                    playAnimation();
                };
                heroImage.onerror = () => {
                    heroAvatarContainer.removeAttribute('style');
                    heroAvatarContainer.className = `summon-animation-element anim-hero-art ${getColorGlowClass(hero.elementId)}`;
                    heroAvatarContainer.style.background = getHeroColorLightGradient(hero.elementId);
                    heroImage.onload = null;
                    heroImage.src = iconSrc;
                    heroImage.onerror = null;
                    heroAvatarContainer.appendChild(heroImage);
                    playAnimation();
                };
                heroImage.src = avatarSrc;
            } else {
                heroAvatarContainer.className = `summon-animation-element anim-hero-art ${getColorGlowClass(hero.elementId)}`;
                heroAvatarContainer.style.background = getHeroColorLightGradient(hero.elementId);
                heroImage.src = hero.image || '';
                heroAvatarContainer.appendChild(heroImage);
                playAnimation();
            }
        });
    }

    // ────────────────────────────────────────────────────────────────────
    // 结果弹窗
    // ────────────────────────────────────────────────────────────────────
    function buildResultCard(result, clickable) {
        const hero = result.hero;
        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.elementId)}`;
        card.title = hero.name;
        if (hero.rarity === 5) card.classList.add('star-5-marquee');
        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.elementId);
        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        if (lower(hero.family) === 'trainer') avatarImage.src = hero.image;
        else avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        avatar.appendChild(avatarImage);
        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-details-overlay';
        let starsHTML = '';
        if (hero.rarity) {
            for (let i = 0; i < hero.rarity; i++) {
                starsHTML += `<img loading="lazy" src="imgs/other/star.webp" decoding="async" alt="star">`;
            }
        }
        const colorIcon = lower(hero.elementId || 'default');
        detailsOverlay.innerHTML = `
            <img loading="lazy" class="summary-color-icon" src="imgs/element/${colorIcon}.webp" decoding="async">
            <div class="summary-hero-stars star-level-${hero.rarity}">${starsHTML}</div>`;
        card.appendChild(avatar);
        card.appendChild(detailsOverlay);
        if (BONUS_KINDS.includes(result.bucket)) {
            const exLabel = document.createElement('div');
            exLabel.className = 'summary-ex-label';
            exLabel.textContent = 'Ex';
            card.appendChild(exLabel);
        }
        if (clickable && hero.type !== 'trainer' && hero.originalIndex !== undefined && hero['Release date']) {
            const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
            if (targetHero) {
                card.classList.add('is-clickable');
                card.addEventListener('click', () => {
                    const summaryEl = document.getElementById('summon-summary-modal');
                    summaryEl.close();
                    summaryEl.classList.add('hidden');
                    openDetailsModal(targetHero, {
                        onClose: () => {
                            const sm = document.getElementById('summon-summary-modal');
                            if (sm) {
                                sm.classList.remove('hidden');
                                cancelModalClose(sm);
                                sm.showModal();
                                document.body.classList.add('modal-open');
                            }
                        },
                    });
                });
            }
        }
        return card;
    }

    function openResultModal(results, viewClass) {
        const summaryModal = document.getElementById('summon-summary-modal');
        const scrollContainer = document.getElementById('summon-summary-scroll-container');
        if (!summaryModal || !scrollContainer) return;
        const d = i18n[state.currentLang] || {};
        const modalTitle = summaryModal.querySelector('h3');
        if (modalTitle) modalTitle.textContent = d.summonResultsTitle;
        summaryModal.classList.remove('single-pull-result-view', 'summon-result-view', 'soul-exchange-view');
        summaryModal.classList.add(viewClass);
        scrollContainer.innerHTML = '';
        results.forEach(result => scrollContainer.appendChild(buildResultCard(result, true)));
        setTimeout(() => { scrollContainer.scrollTop = 0; }, 0);
        summaryModal.classList.remove('hidden');
        cancelModalClose(summaryModal);
        summaryModal.showModal();
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'summonSummary' }, null);
        state.modalStack.push('summonSummary');
    }

    function showSummaryModal(results) { openResultModal(results, 'summon-result-view'); }
    function showSinglePullResultsModal(results) { openResultModal(results, 'single-pull-result-view'); }

    // ────────────────────────────────────────────────────────────────────
    // 历史记录
    // ────────────────────────────────────────────────────────────────────
    function heroSnapshot(hero) {
        return {
            heroId: hero.heroId || null, trainerId: hero.trainerId || null,
            name: hero.name, rarity: hero.rarity, elementId: hero.elementId, element: hero.element,
            family: hero.family, type: hero.type || null, image: hero.image,
            originalIndex: hero.originalIndex, 'Release date': hero['Release date'],
            releaseDate: hero.releaseDate,
        };
    }

    function updateSummonHistory(groupedResults, count) {
        if (groupedResults.length > 0) {
            const flat = groupedResults.flat();
            state.summonHistory.unshift({
                count,
                results: flat.map(r => ({ hero: heroSnapshot(r.hero), bucket: r.bucket, kind: r.kind || null, source: r.source || null, bucketIndex: r.bucketIndex })),
                groupedResults: groupedResults.map(grp => grp.map(r => ({ hero: heroSnapshot(r.hero), bucket: r.bucket, kind: r.kind || null, source: r.source || null, bucketIndex: r.bucketIndex }))),
                poolKey: getPoolTitleKey(state.currentSummonData),
                poolName: getPoolDisplayName(state.currentSummonData),
            });
            if (state.summonHistory.length > 1000) state.summonHistory.pop();
            saveHistoryToLocalStorage();
        }
        renderSummonHistory();
    }

    function resolveHistoryHero(snapshot) {
        if (!snapshot) return null;
        const live = snapshot.heroId && state.heroesByIdMap.get(snapshot.heroId);
        const tid = snapshot.trainerId || (/^trainer_/.test(snapshot.heroId || '') ? snapshot.heroId : '');
        if (tid) {
            const base = tid.replace(/_(common|uncommon|rare|epic|legendary)$/, '');
            return Object.assign({}, live || snapshot, {
                heroId: null, trainerId: base, type: 'trainer', family: 'trainer',
                image: `imgs/hero_icon/${base}.webp`,
            });
        }
        return live || snapshot;
    }

    function isCurrentPoolHistoryGroup(group, currentPoolKey, currentPoolName) {
        if (!group) return false;
        if (group.poolKey) return !!currentPoolKey && group.poolKey === currentPoolKey;
        return !!currentPoolName && group.poolName === currentPoolName;
    }

    function renderSummonHistory() {
        const historyContainer = document.getElementById('summon-history-list');
        const titleElement = document.getElementById('summon-history-title');
        const headerElement = document.querySelector('.summon-history-header');
        if (!historyContainer || !titleElement || !headerElement) return;
        historyContainer.innerHTML = '';
        const existingIcon = headerElement.querySelector('.history-probability-icon');
        if (existingIcon) headerElement.removeChild(existingIcon);

        const d = i18n[state.currentLang] || {};
        const currentPoolName = getPoolDisplayName(state.currentSummonData);
        const currentPoolKey = getPoolTitleKey(state.currentSummonData);
        let historyToRender;
        if (state.showAllSummonHistory) {
            historyToRender = state.summonHistory;
            titleElement.textContent = d.summonHistoryTitleAll || '全部召唤历史记录';
        } else {
            historyToRender = state.summonHistory.filter(g => isCurrentPoolHistoryGroup(g, currentPoolKey, currentPoolName));
            const totalPulls = historyToRender.reduce((s, g) => s + (g.count || 0), 0);
            titleElement.innerHTML = d.summonHistoryTitleCurrent
                ? d.summonHistoryTitleCurrent(currentPoolName, totalPulls)
                : `${currentPoolName} (${totalPulls})`;
        }

        // 统计行的标签全部来自异步文案表：未就绪时先不建浮层，等 loadOddsDict 落地后的重画补上，
        // 否则会先显示 odds.hero.* 原始键再被替换。
        if (!state.showAllSummonHistory && historyToRender.length > 0 && state.currentSummonData
            && oddsLang === state.currentLang) {
            const stats = calculateStats(historyToRender, state.currentSummonData);
            if (stats) {
                const infoIcon = document.createElement('div');
                infoIcon.className = 'history-probability-icon';
                infoIcon.textContent = 'ⓘ';
                infoIcon.title = d.calculatedProbabilitiesTitle;
                infoIcon.innerHTML += renderStatsHTML(stats, d);
                headerElement.insertBefore(infoIcon, titleElement);
            }
        }

        if (historyToRender.length === 0) {
            historyContainer.innerHTML = `<div class="feature-incomplete-message">${d.noSummonHistory || '没有召唤历史'}</div>`;
            return;
        }
        historyToRender.forEach(group => {
            const resultsToRender = group.results || [];
            if (resultsToRender.length === 0) return;
            const groupContainer = document.createElement('div');
            groupContainer.className = 'summon-history-group';
            const header = document.createElement('h5');
            const summonTypeTitle = `${d.summonOnce || '召唤'} x${group.count}`;
            const groupTitle = group.poolKey
                ? (lotteryTitleDict[group.poolKey] || group.poolName || '')
                : (group.poolName || '');
            header.textContent = groupTitle ? `${groupTitle} - ${summonTypeTitle}` : summonTypeTitle;
            const avatarsContainer = document.createElement('div');
            avatarsContainer.className = 'summon-history-avatars';
            resultsToRender.forEach(result => {
                const hero = resolveHistoryHero(result.hero);
                if (!hero) return;
                const avatarContainer = document.createElement('div');
                avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.elementId)}`;
                avatarContainer.title = hero.name;
                if (hero.rarity === 5) avatarContainer.classList.add('star-5-marquee');
                const avatarBackground = document.createElement('div');
                avatarBackground.className = 'hero-avatar-background';
                avatarBackground.style.background = getHeroColorLightGradient(hero.elementId);
                avatarContainer.appendChild(avatarBackground);
                const avatar = document.createElement('img');
                if (lower(hero.family) === 'trainer') avatar.src = hero.image;
                else avatar.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
                avatar.className = 'hero-avatar-image';
                avatar.alt = hero.name;
                avatarContainer.appendChild(avatar);
                if (hero.type !== 'trainer' && hero.originalIndex !== undefined && hero['Release date']) {
                    const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
                    if (targetHero) {
                        avatarContainer.classList.add('is-clickable');
                        avatarContainer.addEventListener('click', () => openDetailsModal(targetHero));
                    }
                }
                if (BONUS_KINDS.includes(result.bucket)) {
                    const exLabel = document.createElement('div');
                    exLabel.className = 'history-ex-label';
                    exLabel.textContent = 'Ex';
                    avatarContainer.appendChild(exLabel);
                }
                if (hero.rarity) {
                    const rarityLabel = document.createElement('div');
                    rarityLabel.className = `history-hero-stars star-level-${hero.rarity}`;
                    rarityLabel.innerHTML = `${hero.rarity}⭐`;
                    avatarContainer.appendChild(rarityLabel);
                }
                avatarsContainer.appendChild(avatarContainer);
            });
            groupContainer.append(header, avatarsContainer);
            historyContainer.appendChild(groupContainer);
        });
    }

    /** 经验概率统计：主抽按官方概率行归组，奖励抽按类别（hotm/mystery/bonus/extra）。 */
    function calculateStats(historyToRender, poolConfig) {
        const allResults = historyToRender.flatMap(g => g.results || (g.groupedResults ? g.groupedResults.flat() : []));
        if (allResults.length === 0) return null;
        // 丰收 additionalDraw 从主桶产出 ⇒ 计入主概率；暗影/哥布林 bonus 与额外桶(extraBuckets)不计入。
        const mainResults = allResults.filter(r => r.bucket === 'main' || r.source === 'additionalDraw');
        const denom = mainResults.length;
        const count = kind => allResults.filter(r => r.bucket === kind).length;

        // 主抽按桶 index 归组 → 映射到官方概率行标签
        const odds = Odds.build(engine, poolConfig.enginePoolId, Object.assign({ oddsText: oddsDict }, currentOpts()));
        const bucketToLine = {};
        if (odds) odds.lines.forEach(line => line.bucketIndexes.forEach(bi => { bucketToLine[bi] = line; }));
        const lineCounts = new Map();
        mainResults.forEach(r => {
            const line = bucketToLine[r.bucketIndex];
            const key = line ? line.key : ('b' + r.bucketIndex);
            if (!lineCounts.has(key)) lineCounts.set(key, { line, count: 0 });
            lineCounts.get(key).count++;
        });
        // 按官方概率行顺序输出（含 0% 条目），标签去星号/百分号；未映射的桶追加在末尾。
        const mainLines = [];
        const usedKeys = new Set();
        if (odds) odds.lines.forEach(line => {
            if (line.isDescription) return; // 描述行非概率桶（奖池面板亦单列无百分比），不进经验统计
            usedKeys.add(line.key);
            const c = lineCounts.get(line.key);
            mainLines.push({ label: oddsLineLabel(line, null, true), count: c ? c.count : 0 });
        });
        lineCounts.forEach((v, key) => {
            if (usedKeys.has(key)) return;
            mainLines.push({ label: v.line ? oddsLineLabel(v.line, null, true) : key, count: v.count });
        });

        // 额外抽（extraBuckets，如元素人训练师）：按官方 extraLines 归组实证。官方额外概率口径是
        // "每次单抽触发该额外产出的概率"（各行之和=触发率，非额外抽内分布），故 denom=主抽次数。
        const extraResults = allResults.filter(r => r.bucket === 'extra' && r.source === 'extraBuckets');
        let extraLines = [], extraDenom = 0;
        if (odds && odds.extraLines && odds.extraLines.length) {
            const eBucketToLine = {};
            odds.extraLines.forEach(line => line.bucketIndexes.forEach(bi => { eBucketToLine[bi] = line; }));
            const eCounts = new Map();
            extraResults.forEach(r => {
                const line = eBucketToLine[r.bucketIndex];
                const key = line ? line.key : ('b' + r.bucketIndex);
                if (!eCounts.has(key)) eCounts.set(key, { line, count: 0 });
                eCounts.get(key).count++;
            });
            const eUsed = new Set();
            odds.extraLines.forEach(line => {
                eUsed.add(line.key);
                const c = eCounts.get(line.key);
                extraLines.push({ label: oddsLineLabel(line, null, true), count: c ? c.count : 0 });
            });
            eCounts.forEach((v, key) => {
                if (eUsed.has(key)) return;
                extraLines.push({ label: v.line ? oddsLineLabel(v.line, null, true) : key, count: v.count });
            });
            extraDenom = denom;
        }

        // 丰收额外抽卡：实证"每次主抽触发 k 次额外抽"的分布（与官方同口径，各行和=100%），denom=主抽次数。
        // 标签取官方本地化行前缀（去掉百分比），百分比用记录实证，不照搬官方理论值。
        let harvestLines = [], harvestDenom = 0, harvestTitleKey = null;
        if (odds && odds.harvestDraw && odds.harvestDraw.body) {
            harvestTitleKey = odds.harvestDraw.titleKey;
            // 存储的 results 不含 pullIndex/triggerIndex；groupedResults 已按"主抽+其触发的额外抽"分组，
            // 每组的 additionalDraw 成员数即该次主抽触发的额外抽次数。
            const nCounts = new Map();
            let baseCount = 0;
            historyToRender.forEach(g => (g.groupedResults || []).forEach(grp => {
                if (!grp || !grp.length || !grp[0] || grp[0].bucket !== 'main') return;
                baseCount++;
                const n = grp.slice(1).filter(r => r.source === 'additionalDraw').length;
                if (n > 0) nCounts.set(n, (nCounts.get(n) || 0) + 1);
            }));
            odds.harvestDraw.body.split('\n').filter(ln => ln.trim()).forEach((ln, i) => {
                const label = esc(Odds.render(ln, []).replace(/[:：][^:：]*$/, '').trim());
                harvestLines.push({ label, count: nCounts.get(i + 1) || 0 });
            });
            harvestDenom = baseCount;
        }

        // 月英/秘密英雄奖励抽（官方独立段，标题 odds.additional_draw="额外抽卡"）：按官方 bonusLines 逐行实证，
        // 池有该奖励抽就展示（含 0%，与主抽/额外抽同口径）。标签用官方模板代入英雄名、剥百分比，对齐奖池面板。
        const bonusLines = [];
        if (odds && odds.bonusLines && odds.bonusLines.length) {
            odds.bonusLines.forEach(bl => {
                const heroName = (typeof Lang !== 'undefined' && Lang.t('heroes_name', bl.heroId)) || bl.heroId;
                const tpl = oddsDict[bl.key];
                const label = tpl != null
                    ? Odds.render(tpl, [null, heroName]).replace(/%\s*$/, '').replace(/[:：]\s*$/, '').trim()
                    : bl.key;
                bonusLines.push({ label: esc(label), count: count(bl.kind) });
            });
        }

        // 奖励传奇（BonusPullConfig）触发机会
        let bonusLegendary = null;
        const bonusCfg = engine.bonusByLotteryId[poolConfig.id];
        if (bonusCfg) {
            const minRarity = bonusCfg.triggersOnMinCharacterRarity || 0;
            const eventOnly = !!bonusCfg.triggersOnEventCharactersOnly;
            const product = poolConfig._official || {};
            let triggers = 0;
            mainResults.forEach(r => {
                const h = state.heroesByIdMap.get(r.id) || (engine.idx.get(r.id));
                if (!h || h.rarity < minRarity) return;
                if (eventOnly && String(h.origin) !== String(product.associatedEvent)) return;
                triggers++;
            });
            const amount = bonusCfg.pullAmount || 1;
            bonusLegendary = { success: count('bonus'), triggers: triggers * amount };
        }
        return {
            totalHeroesDrawn: allResults.length,
            denom,
            mainLines,
            bonusLines,
            extraLines, extraDenom,
            harvestLines, harvestDenom, harvestTitleKey,
            bonusLegendary,
        };
    }

    function renderStatsHTML(stats, d) {
        const fmt = (c, total) => {
            const p = total > 0 ? (c / total) * 100 : 0;
            return `${p < 10 ? '&nbsp;' : ''}${p.toFixed(2)}`;
        };
        let listItems = '';
        stats.mainLines.forEach(l => {
            listItems += `<li><span>${l.label}</span><span>${fmt(l.count, stats.denom)}%</span></li>`;
        });
        const secT = (key, fallback) => {
            const tpl = oddsDict[key];
            return esc(tpl != null ? Odds.render(tpl, []) : fallback);
        };
        // 分组标题统一用奖池面板的 .probability-section-title（h5）样式，与奖池概率浮层一致。
        const secCls = 'probability-section-title';
        // 额外抽（元素人训练师等 extraBuckets）：按官方额外桶归组的实证百分比，denom=主抽次数。
        let extraHTML = '';
        if (stats.extraLines && stats.extraLines.length) {
            const items = stats.extraLines.map(l => `<li><span>${l.label}</span><span>${fmt(l.count, stats.extraDenom)}%</span></li>`).join('');
            extraHTML = `<h5 class="${secCls}">${secT('odds.details.odds_extra', '额外抽卡几率')}</h5><ul>${items}</ul>`;
        }
        // 丰收额外抽卡：实证"每次主抽触发 k 次额外抽"分布（标签官方本地化、百分比来自记录）。
        let harvestHTML = '';
        if (stats.harvestLines && stats.harvestLines.length) {
            const items = stats.harvestLines.map(l => `<li><span>${l.label}</span><span>${fmt(l.count, stats.harvestDenom)}%</span></li>`).join('');
            harvestHTML = `<h5 class="${secCls}">${secT(stats.harvestTitleKey, '丰收额外抽卡')}</h5><ul>${items}</ul>`;
        }
        // 月英/秘密英雄奖励抽：官方"额外抽卡"段，逐行实证（含 0%），标题对齐奖池 odds.additional_draw。
        let bonusHTML = '';
        if (stats.bonusLines && stats.bonusLines.length) {
            const items = stats.bonusLines.map(l => `<li><span>${l.label}</span><span>${fmt(l.count, stats.denom)}%</span></li>`).join('');
            bonusHTML = `<h5 class="${secCls}">${secT('odds.additional_draw', '额外抽卡')}</h5><ul>${items}</ul>`;
        }
        const bt = d.lottery_bonus_translations || {};
        let legendaryHTML = '';
        if (stats.bonusLegendary && stats.bonusLegendary.triggers > 0) {
            legendaryHTML = `
                <h5 class="${secCls}">${bt.bonusLegendaryProbabilityTitle || '奖励传奇英雄'}</h5>
                <ul><li><span>${bt.bonusLegendaryHeroChancePerMil || 'Bonus Probability'}</span><span>${fmt(stats.bonusLegendary.success, stats.bonusLegendary.triggers)}%</span></li></ul>`;
        }
        const totalText = d.totalHeroesCountText ? d.totalHeroesCountText(stats.totalHeroesDrawn) : `(共 ${stats.totalHeroesDrawn} 位)`;
        return `
            <div class="probability-tooltip" popover="manual">
                <h4>${d.calculatedProbabilitiesTitle || '计算概率'} ${totalText}</h4>
                <ul>${listItems}</ul>
                ${extraHTML}
                ${harvestHTML}
                ${bonusHTML}
                ${legendaryHTML}
            </div>`;
    }

    function saveHistoryToLocalStorage() {
        try { localStorage.setItem('summonHistory', JSON.stringify(state.summonHistory)); }
        catch (e) { /* 配额满忽略 */ }
    }

    function migrateLegacyHeroKeys(hero) {
        if (!hero || typeof hero !== 'object') return hero;
        if (hero.rarity === undefined && hero.star !== undefined) hero.rarity = hero.star;
        if (hero.elementId === undefined && hero.colorId !== undefined) hero.elementId = hero.colorId;
        if (hero.element === undefined && hero.color !== undefined) hero.element = hero.color;
        return hero;
    }

    function loadHistoryFromLocalStorage() {
        try {
            const json = localStorage.getItem('summonHistory');
            if (json) {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed)) {
                    state.summonHistory = parsed;
                    state.summonHistory.forEach(rec => {
                        if (!rec) return;
                        (rec.results || []).forEach(r => migrateLegacyHeroKeys(r && r.hero));
                        (rec.groupedResults || []).forEach(grp => (grp || []).forEach(r => migrateLegacyHeroKeys(r && r.hero)));
                    });
                } else state.summonHistory = [];
            } else state.summonHistory = [];
        } catch (e) { state.summonHistory = []; }
    }

    const _legacyPoolTitleToKey = {};
    let _legacyPoolKeyMigrating = false;
    async function migrateLegacyHistoryPoolKeys() {
        if (_legacyPoolKeyMigrating) return;
        const legacy = (state.summonHistory || []).filter(g => g && !g.poolKey);
        if (legacy.length === 0) return;
        _legacyPoolKeyMigrating = true;
        try {
            if (Object.keys(_legacyPoolTitleToKey).length === 0) {
                const langs = (typeof Lang !== 'undefined' && Lang.LANGS) || ['cn', 'en'];
                await Promise.all(langs.map(async lg => {
                    try {
                        const r = await fetch(av('langs_json/lottery_title_' + lg + '.json'));
                        if (!r.ok) return;
                        const dd = await r.json();
                        for (const k in dd) {
                            const v = dd[k];
                            if (v && _legacyPoolTitleToKey[v] === undefined) _legacyPoolTitleToKey[v] = k;
                        }
                    } catch (e) { /* 单语言失败忽略 */ }
                }));
            }
            let changed = 0;
            (state.summonHistory || []).forEach(g => {
                if (!g || g.poolKey || !g.poolName) return;
                const k = _legacyPoolTitleToKey[g.poolName];
                if (k) { g.poolKey = k; changed++; }
            });
            if (changed) { saveHistoryToLocalStorage(); renderSummonHistory(); }
        } finally { _legacyPoolKeyMigrating = false; }
    }

    // ────────────────────────────────────────────────────────────────────
    // 视图切换
    // ────────────────────────────────────────────────────────────────────
    function toggleLotterySimulator() {
        state.lotterySimulatorActive = !state.lotterySimulatorActive;
        const isActive = state.lotterySimulatorActive;
        const wrapper = document.getElementById('lottery-simulator-wrapper');
        if (isActive) {
            if (state.teamSimulatorActive) toggleTeamSimulator();
            uiElements.wantedMissionView.classList.add('hidden');
            uiElements.farmingGuideView.classList.add('hidden');
            if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
            uiElements.heroTableView.classList.remove('hidden');
            wrapper.classList.remove('hidden');
            uiElements.headerInfoContainer.classList.add('hidden');
            uiElements.donationlistcontainer.classList.add('hidden');
            document.body.classList.add('lottery-mode-active');
            refreshLotteryTranslations();
            renderActivityList();
            resetAllFilters();
            const activityList = document.getElementById('lottery-activity-list-container');
            const historyList = document.getElementById('summon-history-list-container');
            if (activityList) activityList.scrollTop = 0;
            if (historyList) historyList.scrollTop = 0;
            if (state.allSummonPools) {
                const poolParam = new URLSearchParams(window.location.search).get('pool');
                const firstPoolId = Object.keys(state.allSummonPools)[0];
                if (!(poolParam && selectSummonPoolByUrlParam(poolParam))) {
                    if (firstPoolId) handleActivityClick(firstPoolId);
                    else applyFiltersAndRender();
                }
            } else applyFiltersAndRender();
            setMainViewHistory('lotterySimulator');
        } else {
            wrapper.classList.add('hidden');
            uiElements.headerInfoContainer.classList.remove('hidden');
            if (!isDonateHidden()) uiElements.donationlistcontainer.classList.remove('hidden');
            document.body.classList.remove('lottery-mode-active');
            state.activeHeroSubset = null;
            applyFiltersAndRender();
            if (typeof syncViewUrlAfterToggle === 'function') syncViewUrlAfterToggle();
        }
        if (typeof refreshMainViewButtons === 'function') refreshMainViewButtons();
    }

    // ────────────────────────────────────────────────────────────────────
    // 对外契约
    // ────────────────────────────────────────────────────────────────────
    global.LotterySimulator = {
        initialize: initializeLotterySimulator,
        toggle: toggleLotterySimulator,
        handleActivityClick,
        renderFeaturedHeroes,
        orderFeaturedIdsByOfficialRule,
        featuredCellMap,
        updateSummonButtons,
        addHeroToFeaturedSlot,
    };
    global.refreshLotteryTranslations = refreshLotteryTranslations;
    global.refreshPoolTitle = refreshPoolTitle;
    global.renderActivityList = renderActivityList;
    global.renderFeaturedHeroes = renderFeaturedHeroes;
    global.renderSummonHistory = renderSummonHistory;
})(window);