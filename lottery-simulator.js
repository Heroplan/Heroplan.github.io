// lottery-simulator.js: 抽奖模拟器的所有逻辑
// ⚠ 抽奖池标题已**分离到 `langs_json/lottery_title_<码>.json`**：
//   原来这里硬编码了 cn/tc/en 三份（其余 17 语言只能回落英文），现由
//   `_tools/_lottery_titles.py` 从官方语言字典生成 20 份，经 `langs.js` 的 TABLES 载入。
// 将需要从外部文件（如 main.js）调用的函数组织起来，避免污染全局作用域
const LotterySimulator = {
    initialize: initializeLotterySimulator,
    toggle: toggleLotterySimulator,
    handleActivityClick: handleActivityClick,
    renderFeaturedHeroes: renderFeaturedHeroes,
    orderFeaturedIdsByOfficialRule: orderFeaturedIdsByOfficialRule,
    featuredCellMap: featuredCellMap,
    updateSummonButtons: updateSummonButtons,
    addHeroToFeaturedSlot: addHeroToFeaturedSlot,
};

const summonSound = new Audio('sounds/ui_summon-additional-draws.ogg');

// --- 状态与配置 (State & Config) ---
let lotteryPoolsData = null; // 用于存储处理过的奖池数据
let lotteryTitleDict = {}; // 用于存储当前语言的标题字典
let summonPoolDetails = {}; // 用于存储奖池的详细配置
let bonusTranslations = {};

/**
 * 重新取抽奖模拟器里**按语言缓存**的两个字典。
 *
 * ⚠ 为什么必须有它：`Lang.loadAll()` 切换语言时会**重建** `_tables` 对象
 *   （`langs.js` 里 `_tables = {}` 再逐个填）⇒ `initializeLotterySimulator` 一次性捕获的
 *   `lotteryTitleDict` / `bonusTranslations` 会**一直指着旧语言的对象**，
 *   表现为"切了语言但抽奖池标题不变"。切换语言后必须调这里重新取。
 */
/**
 * 只重渲染奖池标题（语言切换路径用）。
 * ⚠ 标题原先**只**在 `handleActivityClick` 里写一次 ⇒ 无缝切语言时卡池列表/精选/历史都刷新了，
 *   唯独 `#lottery-pool-title` 停在旧语言（用户报的"带参数进抽奖后标题没跟着换语言"就是它）。
 */
function refreshPoolTitle() {
    const el = document.getElementById('lottery-pool-title');
    if (el && state.currentSummonData) el.innerHTML = getPoolDisplayName(state.currentSummonData);
}

function refreshLotteryTranslations() {
    lotteryTitleDict = (typeof Lang !== 'undefined' && Lang.get('lottery_title')) || {};
    bonusTranslations = (i18n[state.currentLang] || {}).lottery_bonus_translations || {};
}

/**
 * 根据奖池配置返回允许的最大 costume_id
 * @param {object} poolConfig - 奖池配置对象
 * @returns {number} 允许的最大 costume_id（包含该值），默认 Infinity 表示无限制
 */
function getMaxAllowedCostumeId(poolConfig) {
    const restrictedSeasonPools = ['lottery_season_atlantis', 'lottery_season_valhalla'];
    if (restrictedSeasonPools.includes(poolConfig.id)) {
        return 1;
    }
    return Infinity;
}

// --- 官方服装口径（libil2cpp.so 2026-10-04 版，dump.cs 同版本） ---
// `SummonExclusiveTagType { None=0, Wardrobe1=1, Wardrobe2=2 }`（dump.cs:253198）
// `IncludedCostumeType { None=0, Exclusive=1, NonExclusive=2 }`（dump.cs:253186 附近）
//
// ① `BucketIncludedEntryConfiguration.IsCostumeIncluded` RVA 0x1C6C518 —— 只对服装角色调用
//    （本体恒通过），按桶的 `includedCostume` 判：
//      None      → 服装全部排除
//      Exclusive → 服装 tag == None，或 tag == 产品 `SummonExclusiveTag`
//      NonExclusive → 服装 tag == None
// ② `BucketIncludedEntryConfiguration.IsCharacterIncluded` RVA 0x1C6BE68 ——
//    `minParentCharacterCostumeCount` 不区分本体/服装：父角色 = 服装的 `ParentPlayerCharacterId`、
//    本体取自己 `Id`，再要求 `GetAvailableCostumeConfigs(parentId, time, product).Count >= N`（0x1C6C090）。
// ③ `GetAvailableCostumeConfigs` RVA 0x1DFC0FC —— 产品 tag == None 时不筛 tag（0x1DFC344 分支），
//    否则只收 tag == None 或 == 产品 tag 的服装，且必须 `CanBeReceived(time)`（0x1DFC398）。
// ④ `CostumeSummonProductDefinition.Init` RVA 0x1C594F4 —— 产品 tag 不是序列化字段，而是拿产品 id 比
//    `shopConfig.lottery.costumeSummonId`（→Wardrobe1）/ `costume2SummonId`（→Wardrobe2），其余产品为 None。
// ⑤ 选精选英雄：基类 `LotteryProductDefinitionV1.IsHeroEligibleForSelection` RVA 0x1CBC880
//    （Deluxe/Ascension 等未覆写）里 `IsCostume()` 直接不合格 ⇒ 服装一律不能选；
//    `AllianceEventSummon` 覆写 RVA 0x1C52A90 放宽成 `IsCostume() && !IncludeCostumes` 才不合格。
//    两者并起来 = 服装只在 `includeCostumes` 为真时可选。它只管"选进精选位"，不筛抽取桶。

/** 英雄的官方服装标签（`None` 归一成 ''） */
function heroExclusiveTag(hero) {
    const tag = String((hero && hero.exclusiveTag) || '');
    return tag === 'None' ? '' : tag;
}

/** 产品侧的 `SummonExclusiveTag`（见 ④：按产品 id 映射，其余产品为 None） */
function getPoolSummonExclusiveTag(poolConfig) {
    if (!poolConfig) return '';
    if (poolConfig.id === 'lottery_costume_wardrobe2') return 'Wardrobe2';
    if (poolConfig.id === 'lottery_costume_default') return 'Wardrobe1';
    return '';
}

/** 单个英雄是否通过桶的 `includedCostume` 规则（本体恒通过） */
function isCostumeAllowedByRule(hero, includedCostume, poolConfig) {
    if (!hero || !hero.costume_id) return true;
    const tag = heroExclusiveTag(hero);
    switch (includedCostume) {
        case 'None':
            return false;
        case 'NonExclusive':
            return tag === '';
        case 'Exclusive': {
            const productTag = getPoolSummonExclusiveTag(poolConfig);
            return tag === '' || (productTag !== '' && tag === productTag);
        }
        default:
            return true;
    }
}

/**
 * 每个角色「可获得服装数」= 官方 `GetAvailableCostumeConfigs(parentId, …).Count`（见 ③）。
 * 统计范围是**全量英雄池**（不是某个桶），因为官方查的是父角色自己的服装清单。
 * @returns {Map<string, number>} english_name（角色归并键）→ 服装数
 */
function countAvailableCostumes(poolConfig) {
    const productTag = getPoolSummonExclusiveTag(poolConfig);
    const baseDate = getBaseDateForAgeRules(poolConfig);
    const counts = new Map();
    getSimHeroPool().forEach(h => {
        if (!h || !h.costume_id) return;
        const tag = heroExclusiveTag(h);
        if (productTag !== '' && tag !== '' && tag !== productTag) return;
        const date = parseReleaseDate(h['Release date']);
        if (date && baseDate && date > baseDate) return;
        const key = h.english_name;
        counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
}

/**
 * 处理 lottery_config_extra.json 中的补充规则，建立 lotteryId -> bucketIncludedEntryConfigs 映射
 * @param {object} extraConfigs - 从 lottery_config_extra.json 解析的对象
 */
function processExtraConfigs(extraConfigs) {
    //console.log("[processExtraConfigs] 接收到的 extraConfigs:", extraConfigs);
    extraBucketConfigsMap = {};
    if (!extraConfigs || !extraConfigs.lotteryIncludedEntryConfigs) {
        //console.warn("[processExtraConfigs] extraConfigs 缺少 lotteryIncludedEntryConfigs 字段");
        return;
    }
    extraConfigs.lotteryIncludedEntryConfigs.forEach(entry => {
        const lotteryId = entry.lotteryId;
        if (!extraBucketConfigsMap[lotteryId]) {
            extraBucketConfigsMap[lotteryId] = [];
        }
        const configs = entry.bucketIncludedEntryConfigs || [];
        configs.sort((a, b) => a.index - b.index);
        extraBucketConfigsMap[lotteryId] = configs;
        //console.log(`[processExtraConfigs] 为 ${lotteryId} 添加 ${configs.length} 条规则`);
    });
    //console.log("[processExtraConfigs] 最终映射:", extraBucketConfigsMap);
}

// --- 初始化与数据处理 ---

/**
 * 初始化抽奖模拟器
 * @param {Array} allPoolsConfig - 来自“全抽奖配置.json”的数据
 * @param {object} summonTypesConfig - 来自“奖池种类.json”的数据
 */
function initializeLotterySimulator(allPoolsConfig, summonTypesConfig, extraConfigs) {
    state.showAllSummonHistory = false;
    //console.log("[initializeLotterySimulator] 接收到的 extraConfigs:", extraConfigs);
    // ▼▼▼ 预加载动画资源 ▼▼▼
    const assetsToPreload = [
        'sounds/ui_summon-additional-draws.ogg',
        'imgs/lottery/gate/lottery_animation_light.webp',
        'imgs/lottery/gate/lottery_animation_bonus.webp'
    ];
    preloadAssets(assetsToPreload);
    const soundToggleButton = document.getElementById('toggle-sound-btn');
    const langDict = i18n[state.currentLang] || {};

    if (soundToggleButton) {
        state.soundEnabled = getCookie('lotterySoundEnabled') !== 'false';

        const updateSoundButtonUI = () => {
            if (state.soundEnabled) {
                soundToggleButton.classList.remove('sound-off');
                soundToggleButton.title = langDict.muteSound || '静音';
            } else {
                soundToggleButton.classList.add('sound-off');
                soundToggleButton.title = langDict.unmuteSound || '取消静音';
            }
        };

        updateSoundButtonUI();

        soundToggleButton.addEventListener('click', () => {
            state.soundEnabled = !state.soundEnabled;
            setCookie('lotterySoundEnabled', state.soundEnabled, 365);
            updateSoundButtonUI();
        });
    }
    const animationToggleButton = document.getElementById('toggle-animation-btn');
    if (animationToggleButton) {
        const modes = ['full', 'skip', 'silent'];
        const icons = ['▶️', '⏩', '⏭️'];
        const getTitles = () => ({
            full: (i18n[state.currentLang] || {}).playMode_full || 'Play Full Animation',
            skip: (i18n[state.currentLang] || {}).playMode_skip || 'Skip Animation',
            silent: (i18n[state.currentLang] || {}).playMode_silent || 'Direct to History'
        });

        state.lotteryAnimationMode = getCookie('lotteryAnimationMode') || 'full';

        const updateAnimationButtonUI = () => {
            const modeIndex = modes.indexOf(state.lotteryAnimationMode);
            const titles = getTitles();
            animationToggleButton.textContent = icons[modeIndex];
            animationToggleButton.title = titles[state.lotteryAnimationMode];
        };
        updateAnimationButtonUI();

        animationToggleButton.addEventListener('click', () => {
            let currentIndex = modes.indexOf(state.lotteryAnimationMode);
            currentIndex = (currentIndex + 1) % modes.length;
            state.lotteryAnimationMode = modes[currentIndex];
            setCookie('lotteryAnimationMode', state.lotteryAnimationMode, 365);
            updateAnimationButtonUI();
        });
    }

    // 抽奖池标题：由 `langs.js` 从 `langs_json/lottery_title_<码>.json` 载入（20 语言齐全，
    //   生成时已对缺项做过英文回落 ⇒ 这里不再需要 `|| lotteryTitles.en`）。
    refreshLotteryTranslations();
    // 处理补充配置，建立映射
    processExtraConfigs(extraConfigs);
    processSummonData(allPoolsConfig, summonTypesConfig);
    renderActivityList();
    loadHistoryFromLocalStorage();
    renderSummonHistory();
    // 旧版记录（只有本地化标题）异步溯源补上稳定标识；完成后自行重渲染。
    migrateLegacyHistoryPoolKeys();

    document.getElementById('single-summon-btn')?.addEventListener('click', () => performSummon(1));
    document.getElementById('ten-summon-btn')?.addEventListener('click', () => performSummon(10));
    document.getElementById('thirty-summon-btn')?.addEventListener('click', () => performSummon(30));

    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            const langDict = i18n[state.currentLang] || {};
            if (state.summonHistory.length === 0) return;

            if (state.showAllSummonHistory) {
                if (confirm(langDict.confirmClearHistory || '确定要清空所有召唤历史记录吗？')) {
                    state.summonHistory = [];
                    saveHistoryToLocalStorage();
                    renderSummonHistory();
                }
            } else {
                const currentPoolName = getPoolDisplayName(state.currentSummonData);
                const currentPoolKey = getPoolTitleKey(state.currentSummonData);
                if (confirm(langDict.confirmClearCurrentHistory || `确定要清空【${currentPoolName}】的召唤记录吗？`)) {
                    state.summonHistory = state.summonHistory.filter(
                        group => !isCurrentPoolHistoryGroup(group, currentPoolKey, currentPoolName));
                    saveHistoryToLocalStorage();
                    renderSummonHistory();
                }
            }
        });
    }

    const closeSummaryModal = () => {
        if (uiElements.summonSummaryModal && !uiElements.summonSummaryModal.classList.contains('hidden')) {
            history.back();
        }
    };
    document.getElementById('summary-close-btn').addEventListener('click', closeSummaryModal);
    if (uiElements.summonSummaryModalOverlay) {
        uiElements.summonSummaryModalOverlay.addEventListener('click', closeSummaryModal);
    }

    const toggleHistoryCheckbox = document.getElementById('toggle-history-view-checkbox');
    if (toggleHistoryCheckbox) {
        toggleHistoryCheckbox.checked = state.showAllSummonHistory;
        toggleHistoryCheckbox.addEventListener('change', () => {
            state.showAllSummonHistory = toggleHistoryCheckbox.checked;
            renderSummonHistory();
        });
    }

    const tabs = document.querySelectorAll('.lottery-mobile-tabs .tab-button');
    const panels = document.querySelectorAll('.lottery-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) {
                return;
            }
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.dataset.tabTarget;
            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            const targetPanel = document.querySelector(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    document.addEventListener('keydown', function (event) {
        if (state.lotterySimulatorActive && event.key === 'Enter') {
            event.preventDefault();
            const activeElement = document.activeElement;
            const isInputFocused = activeElement &&
                (activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable);
        }
    });
}

/**
 * 将两个JSON文件的数据整合为一个更易于使用的结构
 */
/**
 * 抽奖模拟器里可用的英雄池：**排除 `hidden`**。
 *
 * `hidden` = `utils.js::isHiddenHero()` 运行时判定（2200 年 / id 含 trainer|guestip|temp1）
 *          ∪ **`hero.excluded`（id 命中 `utils.js::EXCLUDED_ID_KEYWORDS`，如 `_temp1`）**。
 *
 * ⚠ 抽奖模式原本会**绕过**列表的隐藏过滤（`filters.js` 里 `state.lotterySimulatorActive` 那条豁免），
 *   所以这里必须单独排一次 —— 否则被排除的英雄仍会出现在奖池里。
 * 所有"**构造奖池**"的地方都要用它；按 id / originalIndex **查单个英雄**的地方仍用 `state.allHeroes`。
 */
function getSimHeroPool() {
    return (state.allHeroes || []).filter(h => h && !h.hidden && !h.excluded);
}

// 「已经出过任何服装的本体英雄 id」集合。按 `state.allHeroes` 数组身份缓存：
//   换语言 / 重载数据时它是新数组 ⇒ 自动重建，不必手动失效；模拟里每发一次奖励都要查，别每次重扫 2121 行。
let _costumeParentCache = { src: null, set: null };
function costumeParentIdSet() {
    if (_costumeParentCache.src !== state.allHeroes) {
        const s = new Set();
        (state.allHeroes || []).forEach(h => { if (h && h.parentHeroId) s.add(h.parentHeroId); });
        _costumeParentCache = { src: state.allHeroes, set: s };
    }
    return _costumeParentCache.set;
}

/**
 * 月英（HOTM）额外奖励的人选：**当月最新、且没有任何服装的月英本体**。
 *   ① 先按 `isFavoritable`（= 已过发布日期）过滤，再取发布日期最大的 ——
 *      旧实现把「没有发布日期」的排在**最前** ⇒ 会抽出尚未发布的月英。
 *   ② 服装行不能进奖励池（38 行）；**已经出过服装的本体也不行**（28 行）：
 *      奖励只发"干净的月英本体"，同一只月英不会以两种形态出现。
 *      ⇒ 若当月最新那只已经有服装，就顺位取上一只符合条件的。
 * @param {object} hotmInfo - `summonPoolDetails.hotm`（用它的 `family`）
 * @returns {object|null} 选中的英雄，池子里没有符合条件的人选时返回 null
 */
function pickHotmBonusHero(hotmInfo) {
    const _hotmFam = String((hotmInfo && hotmInfo.family) || '');
    const _isHotmFam = (f) => String(f) === _hotmFam
        || (/^hotm/i.test(_hotmFam) && /^hotm/i.test(String(f)));
    const _cbParents = costumeParentIdSet();
    const hotmPool = getSimHeroPool().filter(h =>
        _isHotmFam(h.family)
        && !h.parentHeroId
        && !_cbParents.has(h.heroId)
        && (typeof isFavoritable !== 'function' || isFavoritable(h)));
    if (!hotmPool.length) return null;
    // `Release date` 是 `YYYY-MM-DD` 字符串 ⇒ 字典序即时间序
    return hotmPool.reduce((best, h) =>
        (!best || String(h['Release date'] || '') > String(best['Release date'] || '')) ? h : best, null);
}

function processSummonData(allPoolsConfig, summonTypesConfig) {
    lotteryPoolsData = {};
    summonPoolDetails = summonTypesConfig.SummonPool;

    const now = new Date();

    const disableIfAllExpired = (mysteryConfig) => {
        if (!mysteryConfig) return;
        const family = String(mysteryConfig.family).toLowerCase();
        const allHeroesOfFamily = getSimHeroPool().filter(h => String(h.family).toLowerCase() === family);
        if (allHeroesOfFamily.length === 0) return;
        const hasAvailable = allHeroesOfFamily.some(hero => {
            const dateStr = hero['Release date'];
            if (!dateStr) return true;
            const parts = dateStr.split('-');
            if (parts.length !== 3) return false;
            const releaseDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
            const expiryDate = new Date(releaseDate);
            expiryDate.setUTCDate(expiryDate.getUTCDate() + 1);
            expiryDate.setUTCHours(7, 0, 0, 0);
            return now < expiryDate;
        });
        if (!hasAvailable) {
            mysteryConfig.ChancePerMil = "0";
        }
    };
    disableIfAllExpired(summonPoolDetails.MysteryHero);

    state.globalExcludeFamilies = (summonPoolDetails.exclude_for_all || []).map(f => f.toLowerCase());
    state.latestHeroVersionsMap = new Map();
    state.heroesByIdMap = new Map();
    state.allHeroes.forEach(hero => {
        if (hero.english_name && !hero.hidden && !hero.excluded) {   // 被排除的英雄不进「最新版本」表 ⇒ 不会进奖池
            const existing = state.latestHeroVersionsMap.get(hero.english_name);
            if (!existing || hero.costume_id > existing.costume_id) {
                state.latestHeroVersionsMap.set(hero.english_name, hero);
            }
        }
        if (hero.heroId) {
            state.heroesByIdMap.set(hero.heroId, hero);
        }
    });

    allPoolsConfig.forEach(pool => {
        if (pool.amount === 1) {
            const details = summonPoolDetails[pool.id] || {};
            const productType = summonTypesConfig.SummonConfig[pool.productType] || {};
            const bulk10 = allPoolsConfig.find(p => p.sourceProductId === pool.id && p.amount === 10);
            const bulk30 = allPoolsConfig.find(p => p.sourceProductId === pool.id && p.amount === 30);

            // 获取 extra 配置
            const extraConfigs = extraBucketConfigsMap[pool.id] || null;
            //console.log(`[processSummonData] 奖池 ${pool.id} 的 extraConfigs:`, extraConfigs);

            lotteryPoolsData[pool.id] = {
                ...pool,
                ...details,
                ...productType,
                bulk10: bulk10 || null,
                bulk30: bulk30 || null,
                _extraBucketConfigs: extraConfigs, // 附加补充配置
            };
        }
    });

    if (lotteryPoolsData['lottery_pickup_default']) {
        const pool = lotteryPoolsData['lottery_pickup_default'];
        const featuredHeroesObj = pool.featuredHeroes;
        if (featuredHeroesObj && typeof featuredHeroesObj === 'object' && !Array.isArray(featuredHeroesObj)) {
            const now = new Date();
            const utcYear = now.getUTCFullYear();
            const utcMonth = now.getUTCMonth();
            const utcDay = now.getUTCDate();
            const utcHours = now.getUTCHours();
            let targetDate = new Date(Date.UTC(utcYear, utcMonth, utcDay));
            if (utcHours < 7) {
                targetDate.setUTCDate(targetDate.getUTCDate() - 1);
            }
            const dateKey = targetDate.toISOString().split('T')[0];
            const dailyHeroes = featuredHeroesObj[dateKey];
            if (dailyHeroes && Array.isArray(dailyHeroes)) {
                pool.featuredHeroes = dailyHeroes;
                //console.log(`[lottery_pickup_default] 使用日期 ${dateKey} 的英雄列表:`, dailyHeroes);
            } else {
                //console.warn(`[lottery_pickup_default] 未找到日期 ${dateKey} 的英雄列表，使用空数组`);
                pool.featuredHeroes = [];
            }
        }
    }

    state.allSummonPools = lotteryPoolsData;
}

// --- 核心逻辑辅助函数 ---

/**
 * 应用服装规则（官方 `IsCostumeIncluded` 口径，见上方 ①）。
 * 站点把"角色 + 各套服装"按 `english_name` 归并成一行 ⇒ 先按标签筛掉不允许的服装，
 * 再在允许的版本里保留最新的一套（没有服装就保留本体）。
 * @param {Array} heroes - 英雄数组
 * @param {string} includedCostume - "None" | "Exclusive" | "NonExclusive"
 * @param {object} poolConfig - 奖池配置（产品 tag 取自它）
 * @returns {Array} 过滤后的英雄数组
 */
function applyCostumeRule(heroes, includedCostume, poolConfig) {
    if (!includedCostume) {
        return heroes;
    }
    const maxCostumeId = getMaxAllowedCostumeId(poolConfig);
    const map = new Map();
    heroes.forEach(h => {
        if (h.costume_id > maxCostumeId) return;
        if (!isCostumeAllowedByRule(h, includedCostume, poolConfig)) return;
        const key = h.english_name;
        const existing = map.get(key);
        if (!existing || h.costume_id > existing.costume_id) {
            map.set(key, h);
        }
    });
    return Array.from(map.values());
}

/**
 * 强制过滤掉发布日期晚于 baseDate 的英雄
 * @param {Array} heroes - 英雄数组
 * @param {Date} baseDate - 基准日期
 * @returns {Array} 过滤后的数组
 */
function filterByDateCutoff(heroes, baseDate) {
    if (!baseDate) return heroes;
    return heroes.filter(h => {
        const date = parseReleaseDate(h['Release date']);
        if (!date) return false; // 无发布日期则排除
        return date <= baseDate;
    });
}

/** 根据年龄规则筛选英雄 */
function filterByAge(heroes, baseDate, oldestDays, youngestDays) {
    // oldestDays: 排除比 baseDate - oldestDays 更老的英雄（即只保留较新的）
    // youngestDays: 排除比 baseDate - youngestDays 更新的英雄（即只保留较老的）
    let filtered = heroes;
    if (oldestDays !== undefined && oldestDays > 0) {
        const cutoff = new Date(baseDate);
        cutoff.setUTCDate(cutoff.getUTCDate() - oldestDays);
        filtered = filtered.filter(h => {
            const date = parseReleaseDate(h['Release date']);
            return date && date >= cutoff;
        });
    }
    if (youngestDays !== undefined && youngestDays > 0) {
        const cutoff = new Date(baseDate);
        cutoff.setUTCDate(cutoff.getUTCDate() - youngestDays);
        filtered = filtered.filter(h => {
            const date = parseReleaseDate(h['Release date']);
            return date && date <= cutoff;
        });
    }
    return filtered;
}

/** 解析发布日期 */
function parseReleaseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
}

/** 获取用于年龄规则的基准日期（优先 latestIncludedHeroDate，否则今日） */
function getBaseDateForAgeRules(poolConfig) {
    if (poolConfig.latestIncludedHeroDate) {
        const parts = poolConfig.latestIncludedHeroDate.split('-');
        if (parts.length === 3) {
            return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        }
    }
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** 去重（基于 heroId） */
function deduplicateHeroes(heroes) {
    const map = new Map();
    heroes.forEach(h => {
        if (h && h.heroId) {
            if (!map.has(h.heroId)) {
                map.set(h.heroId, h);
            }
        }
    });
    return Array.from(map.values());
}

/**
 * 根据补充规则和原 bucket 字符串，生成最终的英雄池。
 * @param {string} bucketString - 如 "heroes_event_3"
 * @param {number} bucketIndex - 该 bucket 在 bucketConfig 中的索引
 * @param {object} poolConfig - 奖池配置（已附加 _extraBucketConfigs）
 * @param {Array} masterHeroPool - 主英雄池（已预先筛选）
 * @returns {Array} 符合条件的英雄数组
 */

/**
 * 根据补充规则和原 bucket 字符串，生成最终的英雄池。
 * @param {string} bucketString - 如 "heroes_event_3"
 * @param {number} bucketIndex - 该 bucket 在 bucketConfig 中的索引
 * @param {object} poolConfig - 奖池配置（已附加 _extraBucketConfigs）
 * @returns {Array} 符合条件的英雄数组
 */
/** 官方 origin（`originId`）优先；老数据没有它时回退站点归并后的 `sourceId`。 */
function heroOriginKey(hero) {
    return String((hero && (hero.originId || hero.sourceId)) || '').toLowerCase();
}

/**
 * 合成某个稀有度的 5 色训练师英雄（与 getAllHeroesInPool 的 allowsTrainerCharacter 同形）。
 * 官方 `includeTrainers` 的桶里，训练师本身就是可抽到的结果。
 */
function buildSyntheticTrainers(star) {
    const colors = [
        { name: '红', id: 'red' },
        { name: '蓝', id: 'blue' },
        { name: '绿', id: 'green' },
        { name: '黄', id: 'yellow' },
        { name: '紫', id: 'purple' }
    ];
    return colors.map((color, idx) => ({
        name: `${star}* ${color.name}训练师英雄`,
        rarity: star,
        element: color.name,
        family: 'trainer',
        source: 'trainer',
        heroId: `trainer_${star}_${color.id}`,
        originalIndex: -1 * (1000 + star * 10 + idx),
        displayStats: { power: 300 + star * 50, attack: 100, defense: 100, health: 100 },
        image: 'imgs/hero_icon/trainer_rainbow.webp'
    }));
}

function getHeroPoolForBucketWithExtra(bucketString, bucketIndex, poolConfig) {
    const extraRules = poolConfig._extraBucketConfigs ? poolConfig._extraBucketConfigs.find(rule => rule.index === bucketIndex) : null;

    let pool = [];

    if (extraRules) {
        // ★ 有 extra 规则：直接从全英雄池构建 ★
        const targetStar = extraRules.rarity;
        const baseHeroPool = getSimHeroPool();

        // 1. 处理 includedFamilies
        if (extraRules.includedFamilies && extraRules.includedFamilies.length > 0) {
            const families = extraRules.includedFamilies.map(f => String(f).toLowerCase());
            let candidates = baseHeroPool.filter(h => h.rarity === targetStar && families.includes(String(h.family).toLowerCase()));
            pool = pool.concat(candidates);
        }
        // 2. 处理 includedOrigins
        if (extraRules.includedOrigins && extraRules.includedOrigins.length > 0) {
            const origins = extraRules.includedOrigins.map(o => String(o).toLowerCase());
            let candidates = baseHeroPool.filter(h => {
                const heroOrigin = heroOriginKey(h);
                return heroOrigin && h.rarity === targetStar && origins.includes(heroOrigin);
            });
            pool = pool.concat(candidates);
        }
        // 3. 没有任何 include 条件 ⇒ 官方语义是该稀有度的**全部英雄**，
        //    再由 excluded*/服装/年龄收窄（旧实现退回 bucket 的旧语义，
        //    会让 black r5 漏 classic、ascension/league 抽到错误池）
        const hasIncludedConditions = (extraRules.includedFamilies && extraRules.includedFamilies.length > 0)
            || (extraRules.includedOrigins && extraRules.includedOrigins.length > 0);
        if (!hasIncludedConditions && targetStar !== undefined) {
            pool = baseHeroPool.filter(h => h.rarity === targetStar);
        }

        // 3.5 全局排除家族（exclude_for_all，如 mystery），显式 include 的除外
        if (state.globalExcludeFamilies && state.globalExcludeFamilies.length > 0) {
            const explicitFamilies = new Set((extraRules.includedFamilies || []).map(f => String(f).toLowerCase()));
            pool = pool.filter(h => {
                const fam = String(h.family || '').toLowerCase();
                return !state.globalExcludeFamilies.includes(fam) || explicitFamilies.has(fam);
            });
        }

        // 4. ★ 新增：SuperElementalSummon 颜色过滤 ★
        // 必须在服装、年龄等过滤之前先按颜色筛选，确保后续操作只针对当前元素
        if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
            const targetColor = String(state.selectedElementalColor).toLowerCase();
            pool = pool.filter(h => {
                const heroColor = String(h.elementId || '').toLowerCase();
                if (!heroColor) return false;
                return heroColor === targetColor;
            });
        }

        // 5. 排除来源（excludedOrigins）
        if (extraRules.excludedOrigins && extraRules.excludedOrigins.length > 0) {
            const exOrigins = extraRules.excludedOrigins.map(o => String(o).toLowerCase());
            pool = pool.filter(h => {
                const heroOrigin = heroOriginKey(h);
                return !heroOrigin || !exOrigins.includes(heroOrigin);
            });
        }

        // 5.5 排除家族（excludedFamilies）
        if (extraRules.excludedFamilies && extraRules.excludedFamilies.length > 0) {
            const exFamilies = extraRules.excludedFamilies.map(f => String(f).toLowerCase());
            pool = pool.filter(h => !exFamilies.includes(String(h.family || '').toLowerCase()));
        }

        // 6. 应用服装规则（includedCostume）
        if (extraRules.includedCostume) {
            pool = applyCostumeRule(pool, extraRules.includedCostume, poolConfig);
        }

        // 6.5 minParentCharacterCostumeCount（见上方 ②）：父角色可获得服装数必须 >= N。
        //     官方对本体/服装一视同仁（本体取自己 Id 当父角色）⇒ 按 english_name 归并键统计即可。
        const minParentCostumes = extraRules.minParentCharacterCostumeCount || 0;
        if (minParentCostumes > 0) {
            const availableCounts = countAvailableCostumes(poolConfig);
            pool = pool.filter(h => (availableCounts.get(h.english_name) || 0) >= minParentCostumes);
        }

        // 7. 应用年龄规则（在包含/排除之后）
        if (extraRules.oldestCharacterAgeInDays !== undefined || extraRules.youngestCharacterAgeInDays !== undefined) {
            const baseDate = getBaseDateForAgeRules(poolConfig);
            if (baseDate) {
                pool = filterByAge(pool, baseDate, extraRules.oldestCharacterAgeInDays, extraRules.youngestCharacterAgeInDays);
            }
        }

        // 8. 强制截止过滤（对 extra 规则构建的池也生效）
        if (poolConfig.latestIncludedHeroDate) {
            const baseDate = getBaseDateForAgeRules(poolConfig);
            if (baseDate) {
                pool = filterByDateCutoff(pool, baseDate);
            }
        }

        // 9. includeTrainers：官方桶允许训练师进入抽取（mimic 的 3★/4★）
        //    放在服装/年龄之后——合成训练师没有服装和发布日期，会被这些规则误杀
        if (extraRules.includeTrainers && (targetStar === 3 || targetStar === 4)) {
            pool = pool.concat(buildSyntheticTrainers(targetStar));
        }
    } else {
        // 无 extra 规则，使用原逻辑（原逻辑内部已包含 SuperElementalSummon 的颜色处理）
        pool = getHeroPoolForBucket(bucketString, poolConfig);
        // 但仍需应用强制截止过滤（如果有 latestIncludedHeroDate）
        if (poolConfig.latestIncludedHeroDate) {
            const baseDate = getBaseDateForAgeRules(poolConfig);
            if (baseDate) {
                pool = filterByDateCutoff(pool, baseDate);
            }
        }
    }

    // 去重
    const result = deduplicateHeroes(pool);
    return result;
}

/**
 * 服装召唤（`CostumeSummon`）的抽取池：官方桶规则 = 家族筛选 + `includedCostume` +
 * `minParentCharacterCostumeCount`（两个池的 4 个桶规则完全一致，取 index 0 即可）。
 * 旧实现按 `costume_id === 2` / `costume_id <= 1` 猜"第几套"，与实际标签不符：
 * 站点 2121 行里第 1 套标签 None 354 / Wardrobe1 66 / Wardrobe2 2，第 2 套 Wardrobe1 66 / Wardrobe2 46，
 * 第 3 套起全是 Wardrobe1 ⇒ 猜"第 2 套"会把 66 件 Wardrobe1 也放进 wardrobe2 池。
 */
function buildCostumeSummonPool(poolConfig) {
    const families = (Array.isArray(poolConfig.AssociatedFamilies) && poolConfig.AssociatedFamilies.length)
        ? poolConfig.AssociatedFamilies.map(f => String(f).toLowerCase())
        : ['classic'];
    const rules = poolConfig._extraBucketConfigs || [];
    const baseRule = rules[0] || {};
    const includedCostume = baseRule.includedCostume || 'Exclusive';

    let pool = getSimHeroPool().filter(h => {
        if (!h.costume_id) return false;
        if (!families.includes(String(h.family || '').toLowerCase())) return false;
        return isCostumeAllowedByRule(h, includedCostume, poolConfig);
    });

    const minParentCostumes = baseRule.minParentCharacterCostumeCount || 0;
    if (minParentCostumes > 0) {
        const availableCounts = countAvailableCostumes(poolConfig);
        pool = pool.filter(h => (availableCounts.get(h.english_name) || 0) >= minParentCostumes);
    }

    const latest = new Map();
    pool.forEach(h => {
        const existing = latest.get(h.english_name);
        if (!existing || h.costume_id > existing.costume_id) {
            latest.set(h.english_name, h);
        }
    });
    return Array.from(latest.values());
}

/**
 * 根据权重数组，随机返回一个索引
 * @param {number[]} weights - 权重数组
 * @returns {number} - 选中的索引
 */
function selectWeightedIndex(weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + (weight || 0), 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
        if (random < (weights[i] || 0)) {
            return i;
        }
        random -= (weights[i] || 0);
    }
    return -1;
}

/**
 * 奖池的**实际**桶权重：lottery.json 原值 → 补充规则覆盖。
 * 抽取、概率提示、模拟历史三处必须共用这一份，否则会出现「抽的和显示的不一样」。
 * @param {object} poolConfig - 奖池配置
 * @returns {number[]} 与 bucketConfig 等长的权重数组
 */
function getEffectiveBucketWeights(poolConfig) {
    if (!poolConfig) return [];
    let base = poolConfig.bucketWeights;
    let usedElemental = false;
    // 超级元素人召唤：官方拆成 5 个奖池（lottery_super_elemental_<color>），权重表不同 ——
    // yellow 的 3★ 桶是 643 + SuperElemental 桶 67，其余四色是 710 + 0。
    if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor
        && poolConfig.elementalBucketWeights) {
        const perColor = poolConfig.elementalBucketWeights[String(state.selectedElementalColor).toLowerCase()];
        if (Array.isArray(perColor)) {
            base = perColor;
            usedElemental = true;
        }
    }
    if (!Array.isArray(base)) return [];
    const weights = base.slice();
    // 补充规则里的 weight 抄的是黄池口径，按颜色选表时不能再覆盖
    if (!usedElemental && Array.isArray(poolConfig._extraBucketConfigs)) {
        poolConfig._extraBucketConfigs.forEach(rule => {
            if (rule && rule.weight !== undefined && Number.isInteger(rule.index) && rule.index >= 0) {
                weights[rule.index] = rule.weight;
            }
        });
    }
    return weights;
}

/**
 * 获取奖池的本地化标题
 * @param {object} poolConfig - 奖池配置对象
 * @returns {string} - 显示的标题
 */
/**
 * 奖池的**稳定标识**（= `lottery_title_<码>.json` 里的键）。
 *
 * ⚠ 这是**跨语言不变**的归组依据：召唤历史按它归组/筛选/清除。
 *   旧实现用「当前语言的标题」当标识 ⇒ 切换语言后旧记录全部对不上（历史"消失"）。
 * @param {object} poolConfig - 奖池配置对象
 * @returns {string} - 形如 `lottery.title.xxx`；无法判定时返回 ''
 */
function getPoolTitleKey(poolConfig) {
    if (!poolConfig || !poolConfig.productType) return '';
    const specialProductTypes = ['BlackSummon', 'EpicHeroSummon', 'ChallengeEventSummon', 'MapSeasonSummon', 'AllianceEventSummon', 'TowerEventSummon', 'SeasonalPremiumSummon', 'CostumeSummon'];
    return specialProductTypes.includes(poolConfig.productType)
        ? `lottery.title.${poolConfig.id.toLowerCase()}`
        : `lottery.title.${poolConfig.productType.toLowerCase()}`;
}

/**
 * 获取奖池的本地化标题
 * @param {object} poolConfig - 奖池配置对象
 * @returns {string} - 显示的标题
 */
function getPoolDisplayName(poolConfig) {
    if (!poolConfig) return '';
    const titleKey = getPoolTitleKey(poolConfig);
    if (titleKey && lotteryTitleDict[titleKey]) {
        return lotteryTitleDict[titleKey];
    }
    return poolConfig.id.replace('lottery_', '').replace(/_/g, ' ');
}

/**
 * 历史分组是否属于**当前奖池**。
 * · 新记录带 `poolKey`（稳定标识）⇒ 直接比 key；
 * · 旧记录只有 `poolName`（当时的本地化标题）⇒ 退回按标题比（迁移完成后也会带上 `poolKey`）。
 */
function isCurrentPoolHistoryGroup(group, currentPoolKey, currentPoolName) {
    if (!group) return false;
    if (group.poolKey) return !!currentPoolKey && group.poolKey === currentPoolKey;
    return !!currentPoolName && group.poolName === currentPoolName;
}

// 旧记录迁移用：任意语言的奖池标题 → 稳定标识（`poolKey`）
const _legacyPoolTitleToKey = {};
let _legacyPoolKeyMigrating = false;

/**
 * 把**旧版历史记录**（只有本地化 `poolName`、没有 `poolKey`）溯源成稳定标识并回写。
 *
 * 做法：一次性拉取 **20 语言** 的 `lottery_title_<码>.json`，建「标题 → poolKey」反查表，
 * 再按旧记录里的标题找回它的 poolKey（无论当时用的是哪种语言）⇒ 写回并持久化，
 * 此后与新版记录完全一致。
 * ⚠ 仅在确实存在旧记录时才触发（正常用户零额外请求）；单语言失败忽略。
 */
async function migrateLegacyHistoryPoolKeys() {
    if (_legacyPoolKeyMigrating) return;
    const legacy = (state.summonHistory || []).filter(g => g && !g.poolKey);
    if (legacy.length === 0) return;
    _legacyPoolKeyMigrating = true;
    try {
        if (Object.keys(_legacyPoolTitleToKey).length === 0) {
            const langs = (typeof Lang !== 'undefined' && Lang.LANGS) || ['cn', 'en'];
            await Promise.all(langs.map(async (lg) => {
                try {
                    // ⚠ 这条原先**完全不带版本串**：加了 `_headers` 的长缓存后它会变成陈旧源，
                    //   所以一并走 av()（表里没登记时退回 Date.now()，行为不比原来差）。
                    const r = await fetch(av('langs_json/lottery_title_' + lg + '.json'));
                    if (!r.ok) return;
                    const d = await r.json();
                    for (const k in d) {
                        const v = d[k];
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
        if (changed) {
            saveHistoryToLocalStorage();
            renderSummonHistory();
        }
    } finally {
        _legacyPoolKeyMigrating = false;
    }
}

/**
 * 获取当前活动的主卡池，并根据活动类型应用所有特殊规则。
 * @returns {Array} 经过筛选后的英雄对象数组。
 */
function getFilteredMasterPool() {
    const poolConfig = state.currentSummonData;
    if (!poolConfig) return [];

    let masterHeroPool = getAllHeroesInPool(poolConfig);

    switch (poolConfig.productType) {
        case 'SuperElementalSummon':
            const associatedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
            // 从配置读取天数，如果配置不存在则默认为 60
            const days = poolConfig.latestIncludedNonEventHeroAgeInDays || 60;
            const cutoffDate = new Date();
            cutoffDate.setHours(0, 0, 0, 0);
            cutoffDate.setDate(cutoffDate.getDate() - days);

            masterHeroPool = masterHeroPool.filter(hero => {
                const heroFamily = String(hero.family || '').toLowerCase();
                if (associatedFamilies.includes(heroFamily)) {
                    return true;
                }
                const releaseDateStr = hero['Release date'];
                if (!releaseDateStr) {
                    return true;
                }
                const parts = releaseDateStr.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    const releaseDate = new Date(year, month, day);
                    return releaseDate < cutoffDate;
                }
                return true;
            });
            break;
    }
    return masterHeroPool;
}


/**
 * 根据 bucket 字符串和奖池配置，构建一个临时的英雄池 (最终修正版)
 * @param {string} bucketString - 例如 "heroes_event_3"
 * @param {object} poolConfig - 当前的奖池配置
 * @returns {Array} - 符合条件的英雄对象数组
 */
function getHeroPoolForBucket(bucketString, poolConfig) {
    const baseHeroPool = poolConfig.masterPool || getSimHeroPool();

    const explicitlyIncludedFamilies = new Set();
    if (poolConfig.AssociatedFamilies) {
        poolConfig.AssociatedFamilies.forEach(f => explicitlyIncludedFamilies.add(String(f).toLowerCase()));
    }
    if (poolConfig.includedOrigins) {
        poolConfig.includedOrigins.forEach(origin => {
            const originKey = origin.toLowerCase();
            if (originToFamiliesMap[originKey]) {
                originToFamiliesMap[originKey].forEach(family => explicitlyIncludedFamilies.add(family));
            }
        });
    }

    const starMatch = bucketString.match(/_(\d+)$/);
    if (!starMatch) return [];
    const star = parseInt(starMatch[1], 10);

    // ▼▼▼ 提前处理 bucketRules ▼▼▼
    // 必须在遍历英雄之前，将 bucketRules 中指定的家族添加到 explicitlyIncludedFamilies。
    // 这样做的目的是为了让这些家族（例如 mimic）能够通过后续的 (!isGloballyExcluded || isExplicitlyIncluded) 检查。
    // 否则，因为 mimic 在全局排除列表中，它们会被直接过滤掉。
    if (poolConfig.bucketRules && Array.isArray(poolConfig.bucketRules)) {
        const rule = poolConfig.bucketRules.find(r => r.includedRarities && r.includedRarities.includes(star));
        if (rule && rule.includedFamilies) {
            rule.includedFamilies.forEach(f => explicitlyIncludedFamilies.add(String(f).toLowerCase()));
        }
    }

    let bucketType = 'unknown';
    let isExtraAssociatedBucket = (bucketType === 'extraAssociatedFamilies');
    if (bucketString.startsWith('heroes_event_')) bucketType = 'event';
    else if (bucketString.startsWith('heroes_listed_')) bucketType = 'listed';
    else if (bucketString.startsWith('heroes_ex_s1_')) bucketType = 'ex_s1';
    else if (bucketString.startsWith('heroes_s1_')) bucketType = 's1';
    else if (bucketString.startsWith('heroes_extraAssociatedFamilies_')) bucketType = 'extraAssociatedFamilies';

    // ▼▼▼ SuperElementalSummon 对 listed 桶的特殊处理 ▼▼▼
    if (poolConfig.productType === 'SuperElementalSummon' && bucketType === 'listed') {
        // 对于 SuperElementalSummon 的 listed 桶，直接查找所有英雄的最新版本（包括服装）
        // 并且排除S1英雄
        const eligibleHeroes = baseHeroPool.filter(hero => {
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            // 颜色检查逻辑
            const targetColor = state.selectedElementalColor ? String(state.selectedElementalColor).toLowerCase() : '';

            const heroColor = String(hero.elementId || '').toLowerCase();
            if (!heroColor) return false; // 没有颜色的英雄直接排除

            // 如果颜色不匹配，直接排除
            if (heroColor !== targetColor) {
                return false;
            }

            // 2. 其他常规检查
            return hero.rarity === star &&
                heroFamily !== 'classic' && // 排除 classic 家族
                !state.globalExcludeFamilies.includes(heroFamily);
        });

        const uniqueLatestHeroes = new Map(); // 使用 Map 存储每个英文名的最新版本英雄
        eligibleHeroes.forEach(hero => {
            // 特殊处理：Mimic 和 Trainer 不需要 english_name 也可以进入
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            if (heroFamily === 'mimic' || heroFamily === 'trainer') {
                // 使用 heroId 作为唯一键，避免被覆盖
                uniqueLatestHeroes.set(hero.heroId, hero);
                return;
            }

            if (hero.english_name) {
                const existingHero = uniqueLatestHeroes.get(hero.english_name);
                // 如果当前英雄是服装，或者比现有英雄版本新，则更新
                if (!existingHero || hero.costume_id > (existingHero.costume_id || 0) || (hero.costume_id === 0 && existingHero.costume_id !== 0 && !uniqueLatestHeroes.has(hero.english_name + '_costume'))) {
                    // 简单地用 latestHeroVersionsMap 中的最新版本替换
                    const latestVersion = state.latestHeroVersionsMap.get(hero.english_name);
                    if (latestVersion) {
                        uniqueLatestHeroes.set(hero.english_name, latestVersion);
                    } else {
                        uniqueLatestHeroes.set(hero.english_name, hero);
                    }
                }
            }
        });
        return Array.from(uniqueLatestHeroes.values());
    }

    if (bucketType === 'listed') {
        const finalPool = [];
        const processedNames = new Set();
        const includedIds = poolConfig.includedHeroes || [];
        if (includedIds.length > 0) {
            includedIds.forEach(heroId => {
                const exactHero = state.heroesByIdMap.get(heroId);
                if (exactHero && exactHero.rarity === star) {
                    finalPool.push(exactHero);
                    if (exactHero.english_name) {
                        processedNames.add(exactHero.english_name);
                    }
                }
            });
        }
        const listedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
        if (listedFamilies.length > 0) {
            baseHeroPool.forEach(hero => {
                const heroFamily = String(hero.family || '').toLowerCase();
                if (hero.rarity === star && listedFamilies.includes(heroFamily) && !state.globalExcludeFamilies.includes(heroFamily)) {
                    if (hero.english_name && !processedNames.has(hero.english_name)) {
                        processedNames.add(hero.english_name);
                        const latestVersion = state.latestHeroVersionsMap.get(hero.english_name);
                        if (latestVersion) {
                            finalPool.push(latestVersion);
                        }
                    }
                }
            });
        }
        return finalPool;
    }

    const processedHeroNames = new Set();
    const initialPool = [];

    baseHeroPool.forEach(hero => {
        const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
        let matches = false;

        const isGloballyExcluded = state.globalExcludeFamilies.includes(heroFamily);
        const isExplicitlyIncluded = explicitlyIncludedFamilies.has(heroFamily);
        if (isGloballyExcluded && isExplicitlyIncluded) {
            // Log for exemption is kept for debugging
        }

        // 因为我们在前面将 mimic 加入了 explicitlyIncludedFamilies，
        // 所以 (!isGloballyExcluded || isExplicitlyIncluded) 现在对 mimic 家族返回 true。
        if (hero.rarity === star && (!isGloballyExcluded || isExplicitlyIncluded)) {
            switch (bucketType) {
                case 's1':
                    matches = (heroFamily === 'classic');
                    break;
                case 'ex_s1':
                    matches = (heroFamily !== 'classic');
                    break;
                case 'event':
                    // 直接使用包含了 bucketRules 中家族的 explicitlyIncludedFamilies 列表
                    let eventFamilies = Array.from(explicitlyIncludedFamilies);

                    // 如果存在 bucketRules，我们实际上希望严格遵守规则中的家族列表，
                    // 而不是包含所有 AssociatedFamilies。
                    // 之前的逻辑已经将规则家族添加到了 explicitlyIncludedFamilies 以通过外层检查。
                    // 如果使用了规则，matches 应该只匹配规则内的家族。
                    if (poolConfig.bucketRules && Array.isArray(poolConfig.bucketRules)) {
                        const rule = poolConfig.bucketRules.find(r => r.includedRarities && r.includedRarities.includes(star));
                        if (rule && rule.includedFamilies) {
                            // 覆盖 eventFamilies，仅使用规则指定的家族
                            eventFamilies = rule.includedFamilies.map(f => f.toLowerCase());
                        }
                    }

                    // ▼▼▼ 如果奖池允许训练师，则将'trainer'家族视为活动家族 ▼▼▼
                    if (poolConfig.allowsTrainerCharacter) {
                        eventFamilies.push('trainer');
                    }
                    matches = eventFamilies.includes(heroFamily);

                    if (matches && poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
                        const heroColor = String(hero.elementId || '').toLowerCase();
                        const targetColor = String(state.selectedElementalColor || '').toLowerCase();
                        matches = (heroColor === targetColor);
                    }
                    break;
                case 'listed':
                    const listedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
                    const includedIds = poolConfig.includedHeroes || [];
                    matches = listedFamilies.includes(heroFamily) || includedIds.includes(hero.heroId);
                    break;
                case 'extraAssociatedFamilies':
                    const extraFamilies = (poolConfig.extraAssociatedFamilies || []).map(f => String(f).toLowerCase());
                    matches = extraFamilies.includes(heroFamily);
                    break;
            }
        }

        // ▼▼▼ SuperElementalSummon 通用颜色检查 ▼▼▼
        // 将颜色检查移出 switch，确保无论英雄是通过 event, ex_s1, 还是其他方式选中的，
        // 只要是在元素人召唤中，都必须匹配选定的颜色。
        if (matches && poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
            const targetColor = String(state.selectedElementalColor).toLowerCase();

            const heroColor = String(hero.elementId || '').toLowerCase();
            if (!heroColor) {
                matches = false;
            } else {
                if (heroColor !== targetColor) {
                    matches = false;
                }
            }
        }

        if (matches) {
            // ▼▼▼ 如果是 "mimic" 或 "trainer" 家族，则直接添加，不进行名称去重 ▼▼▼
            if (heroFamily === 'mimic' || heroFamily === 'trainer') {
                initialPool.push(hero);
                return; // 跳过后续的名称去重逻辑
            }
            const heroName = hero.english_name;
            if (heroName && !processedHeroNames.has(heroName)) {
                processedHeroNames.add(heroName);
                const baseVersion = getSimHeroPool().find(h => h.english_name === heroName && h.costume_id === 0);
                if (baseVersion) {
                    initialPool.push(baseVersion);
                }
            }
        }
    });

    // 在 map 之前获取 extraAssociatedFamilies 数组（小写）
    const extraFamilies = (poolConfig.extraAssociatedFamilies || []).map(f => String(f).toLowerCase());
    const maxCostumeId = getMaxAllowedCostumeId(poolConfig);

    return initialPool.map(baseHero => {
        if (poolConfig.productType === 'MimicSummon') {
            return baseHero;
        }
        // ▼▼▼ 如果是 "mimic" 或 "trainer" 家族，直接返回本身，不去查找“最新版本” ▼▼▼
        const baseHeroFamily = String(baseHero.family || '').toLowerCase();
        if (baseHeroFamily === 'mimic' || baseHeroFamily === 'trainer') {
            return baseHero;
        }
        if (baseHeroFamily === 'classic') {
            return baseHero;
        }

        const allVersionsInPool = baseHeroPool.filter(h => h.english_name === baseHero.english_name);

        // 判断该英雄的家族是否属于 extraAssociatedFamilies
        const isExtraFamily = extraFamilies.includes(baseHeroFamily);

        let selectedVersion;
        if (isExtraFamily) {
            // extraAssociatedFamilies 原本限制 costume_id < 2，现在同时应用赛季限制（取交集）
            let allowedVersions = allVersionsInPool.filter(v => v.costume_id < 2);
            if (maxCostumeId < Infinity) {
                allowedVersions = allowedVersions.filter(v => v.costume_id <= maxCostumeId);
            }
            if (allowedVersions.length === 0) {
                selectedVersion = baseHero;
            } else {
                selectedVersion = allowedVersions.reduce((latest, current) => {
                    return (current.costume_id > latest.costume_id) ? current : latest;
                }, allowedVersions[0]);
            }
        } else {
            // 普通情况：先应用赛季限制（如果有限制），再取最新版本
            let validVersions = allVersionsInPool;
            if (maxCostumeId < Infinity) {
                validVersions = validVersions.filter(v => v.costume_id <= maxCostumeId);
            }
            if (validVersions.length === 0) {
                // 如果没有符合 costume_id 限制的版本，降级使用 baseHero（可能是旧版，但通常不会发生）
                selectedVersion = baseHero;
            } else {
                selectedVersion = validVersions.reduce((latest, current) => {
                    return (current.costume_id > latest.costume_id) ? current : latest;
                }, validVersions[0]);
            }
        }
        return selectedVersion;
    });
}

/**
 * 获取指定奖池中所有可能抽到的英雄的完整、去重列表
 * @param {object} poolConfig - 奖池配置对象
 * @returns {Array} - 所有可能英雄的对象数组
 */
function getAllHeroesInPool(poolConfig) {
    if (!poolConfig) return [];

    const masterPoolForBuckets = getSimHeroPool();
    //console.log(`[getAllHeroesInPool] 奖池: ${poolConfig.id}, 英雄总数: ${masterPoolForBuckets.length}`);

    // ---- 服装召唤特殊处理 ----
    if (poolConfig.productType === 'CostumeSummon') {
        return buildCostumeSummonPool(poolConfig);
    }

    let allPossibleHeroes = [];
    const maxCostumeId = getMaxAllowedCostumeId(poolConfig);

    // 精选英雄列表
    if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
        const heroesFromFeaturedList = poolConfig.featuredHeroes
            .map(heroId => state.heroesByIdMap.get(heroId))
            .filter(hero => hero && hero.costume_id <= maxCostumeId);
        allPossibleHeroes.push(...heroesFromFeaturedList);
        //console.log(`[getAllHeroesInPool] 从 featuredHeroes 添加 ${heroesFromFeaturedList.length} 个`);
    }

    // entitiesToChooseFrom（用于精选卡槽选择）
    if (poolConfig.entitiesToChooseFrom && Array.isArray(poolConfig.entitiesToChooseFrom)) {
        const choosableEntities = poolConfig.entitiesToChooseFrom
            .map(heroId => state.heroesByIdMap.get(heroId))
            .filter(hero => hero && hero.costume_id <= maxCostumeId);
        allPossibleHeroes.push(...choosableEntities);
        //console.log(`[getAllHeroesInPool] 从 entitiesToChooseFrom 添加 ${choosableEntities.length} 个`);
    }

    // 遍历 bucketConfig
    if (poolConfig.bucketConfig) {
        const effectiveWeights = getEffectiveBucketWeights(poolConfig);
        poolConfig.bucketConfig.forEach((bucketString, index) => {
            if (!bucketString) return;

            // 该桶实际生效的权重（补充规则/元素颜色覆盖后）
            const weight = effectiveWeights[index] || 0;
            if (weight === 0) {
                return;
            }
            // trainer 桶：只添加权重大于 0 的
            if (bucketString.startsWith('trainer')) {
                const starMatch = bucketString.match(/_(\d+)$/);
                if (starMatch) {
                    const star = parseInt(starMatch[1], 10);
                    const isChinese = state.currentLang === 'cn' || state.currentLang === 'tc';
                    const colors = [
                        { cn: '烈火', en: 'Fire', id: 'fire' },
                        { cn: '冰雪', en: 'Ice', id: 'ice' },
                        { cn: '自然', en: 'Nature', id: 'nature' },
                        { cn: '神圣', en: 'Holy', id: 'holy' },
                        { cn: '暗黑', en: 'Dark', id: 'dark' }
                    ];
                    colors.forEach((color, idx) => {
                        const colorName = isChinese ? color.cn : color.en;
                        const heroType = isChinese ? '训练师英雄' : 'Trainer';
                        const trainerHero = {
                            name: `${star}* ${colorName} ${heroType}`,
                            rarity: star,
                            element: color.id,
                            family: 'trainer',
                            source: 'trainer',
                            heroId: `trainer_${star}_${color.id}`,
                            originalIndex: -1 * (2000 + star * 10 + idx),
                            displayStats: { power: 300 + star * 50, attack: 100, defense: 100, health: 100 },
                            image: `imgs/hero_icon/trainer_rainbow.webp`
                        };
                        allPossibleHeroes.push(trainerHero);
                    });
                    //console.log(`[getAllHeroesInPool] 添加训练师桶 ${bucketString}`);
                }
            } else if (bucketString === 'featuredHero') {
                //console.log(`[getAllHeroesInPool] 跳过 featuredHero 桶`);
            } else {
                // ★ 调用新函数，不再传入 masterPool ★
                const heroesFromBucket = getHeroPoolForBucketWithExtra(bucketString, index, poolConfig);
                //console.log(`[getAllHeroesInPool] 桶 ${bucketString} 返回英雄数: ${heroesFromBucket.length}`);
                allPossibleHeroes.push(...heroesFromBucket);
            }
        });
    }

    // 非精选传奇英雄（年龄限制）处理
    if (poolConfig.nonFeaturedLegendaryHeroesAgeInDays > 0) {
        const explicitlyIncludedFamilies = new Set();
        if (poolConfig.AssociatedFamilies) {
            poolConfig.AssociatedFamilies.forEach(f => explicitlyIncludedFamilies.add(String(f).toLowerCase()));
        }
        const days = poolConfig.nonFeaturedLegendaryHeroesAgeInDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(new Date().getDate() - days);
        const olderHeroes = getSimHeroPool().filter(hero => {
            if (!hero['Release date']) return false;
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            const isGloballyExcluded = state.globalExcludeFamilies.includes(heroFamily);
            const isExplicitlyIncluded = explicitlyIncludedFamilies.has(heroFamily);
            const isAllowed = !isGloballyExcluded || isExplicitlyIncluded;
            return hero.rarity === 5 &&
                hero.costume_id === 0 &&
                new Date(hero['Release date']) < cutoffDate &&
                heroFamily !== 'classic' &&
                !state.globalExcludeFamilies.includes(heroFamily);
        });
        allPossibleHeroes.push(...olderHeroes);
        //console.log(`[getAllHeroesInPool] 添加 nonFeaturedLegendary 英雄 ${olderHeroes.length} 个`);
    }

    // allowsTrainerCharacter 规则
    if (poolConfig.allowsTrainerCharacter) {
        const stars = [3, 4];
        const colors = [
            { name: '红', id: 'red' },
            { name: '蓝', id: 'blue' },
            { name: '绿', id: 'green' },
            { name: '黄', id: 'yellow' },
            { name: '紫', id: 'purple' }
        ];
        stars.forEach(star => {
            colors.forEach((color, idx) => {
                const trainerHero = {
                    name: `${star}* ${color.name}训练师英雄`,
                    rarity: star,
                    element: color.name,
                    family: 'trainer',
                    source: 'trainer',
                    heroId: `trainer_${star}_${color.id}`,
                    originalIndex: -1 * (1000 + star * 10 + idx),
                    displayStats: { power: 300 + star * 50, attack: 100, defense: 100, health: 100 },
                    image: `imgs/hero_icon/trainer_rainbow.webp`
                };
                allPossibleHeroes.push(trainerHero);
            });
        });
        //console.log(`[getAllHeroesInPool] 通过 allowsTrainerCharacter 添加训练师`);
    }

    // 去重
    const finalUniqueHeroes = new Map();
    allPossibleHeroes.forEach(hero => {
        if (hero && hero.heroId) {
            if (!finalUniqueHeroes.has(hero.heroId)) {
                finalUniqueHeroes.set(hero.heroId, hero);
            }
        }
    });

    let resultHeroes = Array.from(finalUniqueHeroes.values());
    //console.log(`[getAllHeroesInPool] 最终去重后英雄数: ${resultHeroes.length}`);

    // 特殊过滤
    if (poolConfig.id === 'lottery_black_solstice_default') {
        resultHeroes = resultHeroes.filter(hero => {
            return hero.costume_id !== 2 && hero.costume_id !== 5;
        });
        //console.log(`[getAllHeroesInPool] 至日召唤过滤后: ${resultHeroes.length}`);
    }

    return resultHeroes;
}


// --- UI 渲染与事件处理 ---

/**
 * 渲染左侧的活动列表
 */
function renderActivityList() {
    const listContainer = document.getElementById('lottery-activity-list');
    if (!listContainer || !state.allSummonPools) return;
    listContainer.innerHTML = '';
    const originalOrderPools = Object.values(state.allSummonPools);
    originalOrderPools.forEach(pool => {
        const listItem = document.createElement('li');
        listItem.dataset.poolId = pool.id;
        const displayName = getPoolDisplayName(pool);
        if (pool.banner) {
            listItem.style.backgroundImage = `url('imgs/lottery/banner/${pool.banner}.webp')`;
            listItem.style.backgroundSize = 'cover';
            listItem.style.backgroundRepeat = 'no-repeat';
            listItem.style.color = '#fff';
            listItem.style.textShadow = '1px 1px 2px black';
            listItem.innerHTML = displayName;
        } else {
            listItem.innerHTML = displayName + ' (No Banner)';
        }
        listItem.addEventListener('click', () => handleActivityClick(pool.id));
        listContainer.appendChild(listItem);
    });
}

/**
 * 当用户点击活动列表时，更新所有相关UI并设置状态
 * @param {string} poolId - 被选中的奖池ID
 */
/**
 * 奖池 → 地址参数值：官方标题键 `lottery.title.<x>` 去掉前缀后的 `<x>`
 *   （就是 `langs_json/lottery_title_<码>.json` 里的键后缀，用户在奖池标题上看到的那份 ID）。
 * 实测 52 个在售池（`amount === 1`）的后缀互不重复 ⇒ 能唯一定位。
 */
function poolUrlKeyOf(poolConfig) {
    const k = String(getPoolTitleKey(poolConfig) || '');
    return k.startsWith('lottery.title.') ? k.slice('lottery.title.'.length) : '';
}

/**
 * 按深链接参数选中奖池：`?pool=<后缀>`（也兼容直接写池 id，如 `?pool=lottery_season_atlantis`）。
 * ⚠ 同步返回是否命中；选中动作沿用既有写法**不等** `handleActivityClick` 的异步尾巴。
 * @param {string} param
 * @returns {boolean}
 */
function selectSummonPoolByUrlParam(param) {
    if (!param || !state.allSummonPools) return false;
    let id = null;
    for (const pid in state.allSummonPools) {
        if (poolUrlKeyOf(state.allSummonPools[pid]) === param) { id = pid; break; }
    }
    if (!id && state.allSummonPools[param]) id = param;
    if (!id) return false;
    handleActivityClick(id);
    return true;
}

async function handleActivityClick(poolId) {
    // ▼▼▼ 新增代码：在处理新奖池前，先移除可能存在的旧的特殊按钮和其包装容器 ▼▼▼
    const existingWrapper = document.getElementById('lottery-title-wrapper');
    if (existingWrapper) {
        const titleEl = existingWrapper.querySelector('#lottery-pool-title');
        if (titleEl) {
            existingWrapper.parentNode.insertBefore(titleEl, existingWrapper); // 将标题移回原位
        }
        existingWrapper.remove(); // 移除包装容器
    }

    document.querySelectorAll('#lottery-activity-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.poolId === poolId);
    });

    const poolConfig = state.allSummonPools?.[poolId];
    if (!poolConfig) return;

    state.currentSummonData = poolConfig;
    state.selectedElementalColor = null;
    // 地址带上当前奖池 ⇒ 复制地址就能分享"这个池子"（`?pool=` 见 `poolUrlKeyOf`）。
    //   用 replace：换池子不该往历史栈里堆记录（后退应该退出抽奖，而不是回到上一个池）。
    if (typeof urlWithParams === 'function') {
        const _pk = poolUrlKeyOf(poolConfig);
        history.replaceState(Object.assign({}, history.state, { pool: _pk || null }), '', urlWithParams({ pool: _pk || null }));
    }

    if (poolConfig.productType === 'SuperElementalSummon') {
        const elementalModal = document.getElementById('elemental-modal');
        const elementalOverlay = document.getElementById('elemental-modal-overlay');
        elementalModal.classList.remove('hidden');
        elementalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');

        const userChoice = await new Promise(resolve => {
            const elementalContainer = document.querySelector('.elemental-selection-container');
            const handler = (event) => {
                const target = event.target.closest('.elemental-icon');
                if (target && target.dataset.element) {
                    elementalContainer.removeEventListener('click', handler);
                    elementalModal.classList.add('hidden');
                    elementalOverlay.classList.add('hidden');
                    document.body.classList.remove('modal-open');
                    resolve(target.dataset.element);
                }
            };
            elementalContainer.addEventListener('click', handler);
        });
        state.selectedElementalColor = userChoice;
    }

    const numSlots = featuredSlotCount(poolConfig);
    let heroesForSlots = [];
    // 本次奖池"官方口径"的精选 id 顺序，渲染格子时要用它判断读取方向
    let featuredDisplayIds = [];

    // 仅从 featuredHeroes 列表中选取英雄进行初始填充
    if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
        // 对于超级元素召唤，处理动态的 featuredHeroes 列表
        const dynamicKey = `featuredHeroes_${state.selectedElementalColor}`;
        const heroIdList = poolConfig[dynamicKey];
        if (heroIdList && Array.isArray(heroIdList)) {
            featuredDisplayIds = orderFeaturedIdsByOfficialRule(heroIdList);
            heroesForSlots = featuredDisplayIds.map(heroId => state.heroesByIdMap.get(heroId) || null);
        }
    } else {
        // 对于普通召唤，仅使用 featuredHeroes 列表（如果存在）
        if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
            featuredDisplayIds = orderFeaturedIdsByOfficialRule(poolConfig.featuredHeroes);
            heroesForSlots = featuredDisplayIds.map(heroId => state.heroesByIdMap.get(heroId) || null);
        }
    }
    state.featuredDisplayIds = featuredDisplayIds;

    // 初始化精选英雄数组：用 featuredHeroes 列表的英雄填充前部，剩余位置为 null
    state.customFeaturedHeroes = [];
    // 1. 填充来自 featuredHeroes 列表的英雄
    for (let i = 0; i < heroesForSlots.length && i < numSlots; i++) {
        state.customFeaturedHeroes.push(heroesForSlots[i]);
    }
    // 2. 将剩余卡槽填充为 null
    while (state.customFeaturedHeroes.length < numSlots) {
        state.customFeaturedHeroes.push(null);
    }

    const titleEl = document.getElementById('lottery-pool-title');
    const backgroundEl = document.getElementById('lottery-background-image');
    const portalContainer = document.getElementById('lottery-portal-container');


    if (titleEl) titleEl.innerHTML = getPoolDisplayName(poolConfig);
    // ▼▼▼ 检查是否为三国召唤，并处理其特殊规则 ▼▼▼
    if (poolId === 'lottery_mercenary_war_default') {
        const limitedPoolConfig = poolConfig.limitedPoolSummonConfiguration;
        if (limitedPoolConfig && limitedPoolConfig.enabled && limitedPoolConfig.heroes) {
            const heroIds = limitedPoolConfig.heroes;
            const heroesToShow = heroIds.map(id => state.heroesByIdMap.get(id)).filter(Boolean);

            if (titleEl && heroesToShow.length > 0) {
                // 创建一个包装容器用于居中标题和新按钮
                const titleWrapper = document.createElement('div');
                titleWrapper.id = 'lottery-title-wrapper';
                titleWrapper.style.display = 'flex';
                titleWrapper.style.flexDirection = 'column'; // 设置为垂直布局
                titleWrapper.style.alignItems = 'center';    // 保持水平居中

                // 将原标题移入包装容器
                titleEl.parentNode.insertBefore(titleWrapper, titleEl);
                titleWrapper.appendChild(titleEl);

                // 创建并设置新按钮
                const w3kButton = document.createElement('button');
                w3kButton.id = 'w3k-limited-pool-btn';
                w3kButton.className = 'theme-toggle-btn';
                w3kButton.title = (i18n[state.currentLang] || {}).w3kLimitedPoolTitle;
                w3kButton.innerHTML = `<img loading="lazy" src="imgs/coins/red_lucky.webp" decoding="async" style="width: 28px; height: 28px;">`;
                w3kButton.style.marginTop = '1px'; // 添加上边距

                // 为按钮添加点击事件
                w3kButton.addEventListener('click', () => {
                    const resultsForModal = heroesToShow.map(hero => ({ hero: hero, bucket: 'w3k_limited' }));
                    showSummaryModal(resultsForModal);
                });

                // 将按钮添加到包装容器中
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
        // 移除所有旧的战斗指南按钮
        portalContainer.querySelectorAll('.guide-button').forEach(btn => btn.remove());
        if (poolConfig.bucketConfig && poolConfig.bucketWeights) {
            const infoIcon = document.createElement('div');
            infoIcon.className = 'probability-info-icon';
            infoIcon.textContent = 'ⓘ';
            infoIcon.style.position = 'absolute';
            infoIcon.style.top = '10px';
            infoIcon.style.left = '10px';
            infoIcon.title = i18n[state.currentLang].probabilityInfoTitle || '查看概率详情';
            const formatPercentage = (rawValue) => {
                const percentageNum = parseFloat(rawValue) / 10;
                const prefix = percentageNum < 10 ? '&nbsp;' : '';
                return `${prefix}${percentageNum.toFixed(2)}`;
            };

            const bucketTranslations = i18n[state.currentLang].lottery_bucket_translations || {};
            const bonusTranslations = i18n[state.currentLang].lottery_bonus_translations || {};

            let listItems = '';
            const effectiveWeights = getEffectiveBucketWeights(poolConfig);
            poolConfig.bucketConfig.forEach((bucketName, index) => {
                const weight = effectiveWeights[index];
                if (weight > 0) {
                    const percentage = (weight / 10).toFixed(1);
                    const translatedName = bucketTranslations[bucketName] || bucketName;
                    listItems += `<li><span>${translatedName}</span><span>${percentage}%</span></li>`;
                }
            });

            let bonusListItems = '';
            let legendaryBonusItems = '';

            if (poolConfig.bonusLegendaryHeroChancePerMil) {
                const typeName = bonusTranslations.bonusLegendaryHeroType || 'Bonus Hero Type';
                const typeValueKey = poolConfig.bonusLegendaryHeroPullTriggersOnEventHeroesOnly ? "eventHeroesOnly" : "NonClassicHero";
                const typeValue = (i18n[state.currentLang].lottery_bonus_values || {})[typeValueKey] || typeValueKey;
                legendaryBonusItems += `<li><span>${typeName}</span><span>${typeValue}</span></li>`;
                const probName = bonusTranslations.bonusLegendaryHeroChancePerMil || 'Bonus Probability';
                const percentage = formatPercentage(poolConfig.bonusLegendaryHeroChancePerMil);
                legendaryBonusItems += `<li><span>${probName}</span><span>${percentage}%</span></li>`;
                if (poolConfig.bonusLegendaryHeroPullAmount) {
                    const amountName = bonusTranslations.bonusLegendaryHeroPullAmount || 'Pull Amount';
                    const amountValue = poolConfig.bonusLegendaryHeroPullAmount;
                    legendaryBonusItems += `<li><span>${amountName}</span><span>${amountValue}</span></li>`;
                }
            }
            const hotmInfo = summonPoolDetails.hotm;
            if (hotmInfo && hotmInfo.ChancePerMil && poolConfig.hasMysteryHeroBonusRoll) {
                const percentage = (parseInt(hotmInfo.ChancePerMil, 10) / 10).toFixed(1);
                const name = bonusTranslations.hotm || 'HOTM';
                bonusListItems += `<li><span>${name}</span><span>${percentage}%</span></li>`;
            }

            if (poolConfig.hasMysteryHeroBonusRoll) {
                const mysteryInfo = poolConfig.productType === 'LegendsSummon'
                    ? summonPoolDetails.LegendsSummonMysteryHero
                    : summonPoolDetails.MysteryHero;
                if (mysteryInfo && mysteryInfo.ChancePerMil && parseInt(mysteryInfo.ChancePerMil, 10) > 0) {
                    const percentage = (parseInt(mysteryInfo.ChancePerMil, 10) / 10).toFixed(1);
                    const dictKey = poolConfig.productType === 'LegendsSummon' ? 'LegendsSummonMysteryHero' : 'MysteryHero';
                    const name = bonusTranslations[dictKey] || 'Mystery Hero';
                    bonusListItems += `<li><span>${name}</span><span>${percentage}%</span></li>`;
                }
            }

            if (poolConfig.additionalDrawWeights && poolConfig.additionalDrawWeights.length > 0) {
                const percentages = poolConfig.additionalDrawWeights.map((w, i) => {
                    const numberLabel = i + 1;
                    const numberPrefix = numberLabel < 10 ? '&nbsp;&nbsp;' : '';
                    return `${numberPrefix}${numberLabel} - ${formatPercentage(w)}%`;
                }).join('<br>');
                const name = bonusTranslations.additionalDrawWeights || 'Additional Draws';
                bonusListItems += `<li><span>${name}</span><span>${percentages}</span></li>`;
            }

            let toggleHTML = '';
            if (poolConfig.productType === 'SuperElementalSummon1' || poolConfig.productType === 'HarvestSummon1') {
                const toggleId = 'exclude-recent-heroes-toggle';
                const labelText = i18n[state.currentLang].exclude180DaysRule || '启用排除180天内英雄规则';
                toggleHTML = `
                    <div class="probability-toggle-rule">
                        <input type="checkbox" id="${toggleId}">
                        <label for="${toggleId}">${labelText}</label>
                    </div>
                `;
            }

            let specialNoticeHTML = '';
            const langDict = i18n[state.currentLang] || {};
            let noticeText = '';
            if (poolConfig.latestIncludedHeroAgeInDays > 0) {
                // 检查是否存在这条新规则
                if (langDict.latestHeroAgeNotice) {
                    noticeText = langDict.latestHeroAgeNotice(poolConfig.latestIncludedHeroAgeInDays);
                }
            } else if (poolConfig.productType === 'SuperElementalSummon') {
                // 如果没有新规则，再检查是否为超级元素人奖池
                // 读取配置的天数并调用新的多语言函数
                const days = poolConfig.latestIncludedNonEventHeroAgeInDays || 60;
                if (langDict.superElementalExclusionNotice) {
                    noticeText = langDict.superElementalExclusionNotice(days);
                }
            }
            // 如果生成了说明文本，则创建HTML
            if (noticeText) {
                specialNoticeHTML = `<p style="font-size: 0.7em; color: var(--md-sys-color-primary); margin: 10px 5px 0 5px; text-align: left;">${noticeText}</p>`;
            }
            // ▼▼▼ 检查是否包含训练师英雄 ▼▼▼
            if (poolConfig.allowsTrainerCharacter) {
                const trainerNoticeText = langDict.includesTrainerNotice || '';
                if (trainerNoticeText) {
                    // 将训练师说明追加到 HTML 中
                    specialNoticeHTML += `<p style="font-size: 0.7em; color: var(--md-sys-color-primary); margin: 10px 5px 0 5px; text-align: left;">${trainerNoticeText}</p>`;
                }
            }
            // 如果该奖池不包含神话/神秘英雄的额外抽取机会，则添加特别说明
            if (!poolConfig.hasMysteryHeroBonusRoll) {
                const noMysteryBonusNoticeText = langDict.noMysteryBonusNotice || '';
                if (noMysteryBonusNoticeText) {
                    // 将“无法获得”的说明追加到 HTML 中
                    specialNoticeHTML += `<p style="font-size: 0.7em; color: var(--md-sys-color-primary); margin: 10px 5px 0 5px; text-align: left;">* ${noMysteryBonusNoticeText}</p>`;
                }
            }

            const tooltipHTML = `
                <div class="probability-tooltip">
                    ${toggleHTML}
                    <h4>${i18n[state.currentLang].probabilityInfoTitle || '概率详情'}</h4>
                    <ul>
                        ${listItems}
                    </ul>
                    ${bonusListItems ? `
                        <h4 style="margin-top:10px; padding-top:5px; border-top:1px dashed #fff;">${bonusTranslations.bonusProbabilityTitle || '额外概率'}</h4>
                        <ul>${bonusListItems}</ul>
                    ` : ''}
                    
                    ${legendaryBonusItems ? `
                        <h4 style="margin-top:10px; padding-top:5px; border-top:1px dashed #fff;">${bonusTranslations.bonusLegendaryProbabilityTitle || '奖励传奇英雄'}</h4>
                        <ul>${legendaryBonusItems}</ul>
                    ` : ''}
                    ${specialNoticeHTML}
                </div>
            `;
            infoIcon.innerHTML += tooltipHTML;

            setTimeout(() => {
                const excludeToggle = document.getElementById('exclude-recent-heroes-toggle');
                if (excludeToggle) {
                    excludeToggle.addEventListener('change', () => {
                        state.activeHeroSubset = getFilteredMasterPool();
                        applyFiltersAndRender();
                    });
                }
            }, 0);

            // 将图标添加到 .lottery-content-overlay 内部，
            // 而不是 portalContainer，以确保它们在同一个堆叠上下文中。
            const contentOverlay = portalContainer.querySelector('.lottery-content-overlay');
            if (contentOverlay) {
                contentOverlay.appendChild(infoIcon);

                // 添加战斗指南按钮 (A/B 路径逻辑)
                let buttonPositionLeft = 48; // infoIcon.left (10) + infoIcon.width (30) + gap (8)
                const buttonGap = 38; // width (30) + gap (8)
                let basePath;
                if (poolConfig.id === 'lottery_super_elemental' && state.selectedElementalColor) {
                    // 特殊格式: lottery_super_elemental_颜色.webp
                    basePath = `imgs/quest_event_guide/lottery_super_elemental_${state.selectedElementalColor}`;
                } else {
                    basePath = `imgs/quest_event_guide/${poolConfig.id}`;
                }

                // --- 辅助函数：用于检查文件是否存在 ---
                const checkFileExists = async (url) => {
                    try {
                        const response = await fetch(url, { method: 'HEAD' });
                        return response.status === 200;
                    } catch (error) {
                        return false;
                    }
                };

                // --- 辅助函数：用于路径B的循环检查 ---
                const checkAndLoop = async (index, leftPos) => {
                    if (index > 5) return; // 最多检查5个 (e.g., _1 到 _5)

                    const path = `${basePath}_${index}.webp`;

                    // 检查文件是否存在
                    const exists = await checkFileExists(path);
                    if (exists) {
                        // 文件存在! 添加按钮
                        const button = createGuideButton(path, '⚔️');
                        button.style.left = `${leftPos}px`;
                        contentOverlay.appendChild(button);

                        // 检查下一个
                        await checkAndLoop(index + 1, leftPos + buttonGap);
                    }
                    // 文件不存在则停止循环
                };

                // --- 启动逻辑：首先检查基础文件 (路径A) ---
                const baseGuidePath = `${basePath}.webp`;

                checkFileExists(baseGuidePath).then(exists => {
                    if (exists) {
                        // 路径 A: 基础文件存在。添加按钮。
                        const baseButton = createGuideButton(baseGuidePath, '⚔️');
                        baseButton.style.left = `${buttonPositionLeft}px`;
                        contentOverlay.appendChild(baseButton);
                    } else {
                        // 路径 B: 基础文件不存在。启动循环检查 _1。
                        checkAndLoop(1, buttonPositionLeft);
                    }
                });

            } else {
                portalContainer.appendChild(infoIcon);
            }
        }
    }

    state.activeHeroSubset = getFilteredMasterPool();
    state.currentSort = { key: 'Release date', direction: 'desc' };
    applyFiltersAndRender();
    LotterySimulator.renderFeaturedHeroes();
    LotterySimulator.updateSummonButtons();
    renderSummonHistory();
}


/**
 * 展示用的格子数。官方是"只点亮有内容的格子"（`HideAllFeaturedPortraits()` 后按实体数写格子），
 * 所以**没有可选槽的池子按精选实体数自适应**，不再拿 `featuredHeroNum` 补空格子；
 * 只有带自选槽的池子（`amountOfSelectableFeaturedSlots` > 0 或有 `entitiesToChooseFrom`）才保留
 * 配置的槽位数 —— 那些空槽是留给玩家自选英雄的。
 */
function featuredSlotCount(pool) {
    if (!pool) return 0;
    const configured = pool.featuredHeroNum || 0;
    if ((pool.amountOfSelectableFeaturedSlots || 0) > 0 || (pool.entitiesToChooseFrom || []).length > 0) {
        return configured;
    }
    const entities = Array.isArray(pool.featuredHeroes) ? pool.featuredHeroes.length : 0;
    return entities || configured;
}

/**
 * 官方精选英雄的**展示顺序**。证据（libil2cpp.so，dump.cs 同版本 2026-10-04）：
 *   `SummonViewController.SetFeaturedPortraitsIfNeeded` RVA 0x1ACBA54 ——
 *     OrderByDescending(Rarity) → ThenByDescending(Id == 宣传位) →
 *     ThenByDescending(CanBeReceivedDate) → ThenBy(NameKey)
 *     键取自 `FeaturedSummonEntity` 字段 0x10/0x8/0x20/0x3C（反编译 `FeaturedSummonEntity..ctor` 0x1AD4ADC）
 *   宣传位 = `LotteryProductDefinition.GetAdvertisedEntry` RVA 0x1C3E20C：列表非空时**直接返回 ids[0]**，
 *     也就是配置 `featuredHeroes` 的第 0 项；它只在同稀有度里把这位"钉"到最前，跨稀有度仍按稀有度。
 *   `GetAllFeatureableEntities` RVA 0x1AD0DC0 只是 LINQ `Where + Select` ⇒ **不改顺序**，只剔除取不到配置的 id。
 *   LINQ 的 OrderBy 是**稳定**排序 ⇒ 四个键全等时回到配置原序（这里靠 `Array.prototype.sort` 的稳定性，ES2019 起保证）。
 *
 * ⚠ **皮肤也参与排序**（2026-10-17 用游戏内截图复核后推翻了我原先的读法）：
 *   谓词 0x1AD3CFC / 0x1AD3D6C 确实把 `parentHeroId` 非空的条目排除在 A/B 两个分组之外，
 *   但两张实测样本都表明**展示顺序仍按同一套比较器排**：
 *     · `lottery_season_untold_tales2`（3 格全皮肤）配置 `[holy, omen, guardian]` → 游戏 `[holy, guardian, omen]`
 *       = 宣传位 + `canBeReceivedDate` 降序（2026-10-16 / 2026-02-18 / 2025-10-15）；
 *     · `lottery_covenant_default` 6 格里的 `elemental_desmond_costume_assassin` 也按自身日期(2026-09-10)参与排序。
 *   ⇒ 只有"站点取不到这条 id 的配置"时才退回配置原序（那种情况官方 `GetAllFeatureableEntities` 会把它剔除）。
 */
function orderFeaturedIdsByOfficialRule(idList) {
    state.featuredPortraitsReadByRow = false;
    const list = Array.isArray(idList) ? idList : [];
    state.featuredGroupSizes = [list.length, 0];
    if (list.length < 2) return idList;
    // 取不到配置的条目 ⇒ 官方那边这条根本进不了 entities 列表，站点无法定序 ⇒ 整表保持配置原序
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
        // 官方第四键 = NameKey.Id，而 `Language.GetHeroNameKey` RVA 0x1B94B70 的实现是
        //   key = 前缀 + id.Substring(0, id.IndexOf("_", 4))（找不到就整串）⇒ 比的是"id 头部的家族段"，不是整条 id。
        //   另有一条 `Contains(常量)` 的特殊分支（常量真值未取，命中的是皮肤那一类 ⇒ 走不到）。
        const ka = officialNameKey(ha.heroId);
        const kb = officialNameKey(hb.heroId);
        if (ka !== kb) return ka < kb ? -1 : 1;
        // 家族段相同（例：同族几件皮肤）⇒ 再按自身日期降序；仍相等就靠稳定排序回到配置原序
        if (ha.heroId !== hb.heroId) return ha.heroId < hb.heroId ? -1 : 1;
        return 0;
    };
    // **分组**（`v29`/`v36` = 谓词 0x1AD3CFC / 0x1AD3D6C）：一组 = 皮肤（`parentHeroId` 非空），另一组 = 非皮肤。
    // `v40`：条目多的那组先写格子；**平手时先写皮肤组**（S2 池 2 皮肤 + 2 本体，截图实测皮肤占左边两格；
    // 谓词 `b__99_0` 的返回值在伪代码里被优化掉了 ⇒ 极性只能靠这个样本定）。
    // 另一组从 `max(L, ceil(N/2))` 格起（`v94`；横排时就是 `L`）。
    const isCostume = id => !!state.heroesByIdMap.get(id).parentHeroId;
    const costumes = idList.filter(isCostume);
    const others = idList.filter(id => !isCostume(id));
    const first = costumes.length >= others.length ? costumes : others;
    const second = first === costumes ? others : costumes;
    // `v87`（选横排还是竖排表）：站点按**总展示数 ∈ {2, 4}** 判 ⇒ 横排表 = sib[0,1,2,3,…] 逐行左右交替。
    //   反编译里这个判据挂在 `v86` 上（我读成"多的那组的条数"），但用户实测**"无论什么情况，2 个都是左右各一"**
    //   ⇒ 1 本体 + 1 皮肤（两组各 1，`v86` 只等于 1）也必须是横排 ⇒ 判据实际等价于**总展示数**。
    //   在"只有一组非空"的常见池子上两种读法同值，差别只出现在混合池 ⇒ 以实测为准。
    // 结果：2 个 = 左右各一、3 个 = 单列竖排、4 个 = 2×2、6 个 = 两列各 3。
    state.featuredPortraitsReadByRow = idList.length === 2 || idList.length === 4;
    // 两组各自的条数 ⇒ 交给 `featuredLitCellIndices` 算"第二组从第几格起"（会出现左 2 右 1 这种留空格的形状）
    state.featuredGroupSizes = [first.length, second.length];
    return first.slice().sort(cmp).concat(second.slice().sort(cmp));
}

/**
 * 官方"被点亮的格子序号"：第一组占 `0 .. L-1`，第二组从 `v94` 起 ——
 *   `v94 = 横排 ? L : max(L, ceil(N/2))`（`N` = 该主题格子表的长度）
 * ⇒ 例：默认容器（N=6，half=3）里 **2 个本体 + 1 个皮肤** 会点亮 0、1、3 格 =
 *   左列上两格 + 右列第一格 = **左 2 右 1**，中间第 2 格留空（官方 `HideAllFeaturedPortraits()` 后不写它就一直是关的）。
 * 返回长度 = 实体数的数组：第 i 个实体的格子序号。
 */
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

/** `Language.GetHeroNameKey`（0x1B94B70）里决定 `ThenBy` 的那段：取第 4 个字符之后第一个 '_' 以前的部分。 */
function officialNameKey(heroId) {
    const i = heroId.indexOf('_', 4);
    return i < 0 ? heroId : heroId.slice(0, i);
}

/**
 * 官方格子的**读取方向**（同一个 0x1ACBA54 + 从 bundle 里扫出的各主题格子表）：
 *   portraits = GetCustomFeaturedPortraits() ?? (竖排 ? _featuredPortraitsInVerticalOrder : _featuredPortraitsInHorizontalOrder)
 *   ⇒ **有自定义表的主题根本不看横排/竖排那个分支**，直接用自定义表的顺序。各主题的表是扫序列化字节得到的
 *   （脚本 `配置数据更新/逆向取证/_all_lists.py`；bundle 无 TypeTree，AssetStudioCLI 也只认类名）：
 *     · 默认容器（`SummonViewController` 两张 6 元素表）= 2 列 × 3 行，x = ±120、y = -260/-520/-780，
 *       横排表 = 子节点 [0,1,2,3,4,5]（逐行左右交替）、竖排表 = [0,2,4,1,3,5]（先填满一列 3 格）
 *     · `AtlantisShowcaseController`（S2 主题）= **4 格一行**：`HeroLeft(100,-130) HeroLeftSmall(270,-120)
 *       HeroRightSmall(-270,-120) HeroRight(-100,-130)`；但这四个 x 是**边锚**的偏移，不是中心锚：
 *       HeroLeft/HeroLeftSmall 的 anchor=(0,1)（左上角起算，x 越大越靠内），HeroRight/HeroRightSmall 的
 *       anchor=(1,1)（右上角起算，x 越负越靠内）⇒ 屏幕 L→R 恰好等于序列化表序（见下）。
 *     · `LeagueShowcaseController` = 6 格，但顺序是**先右列 3 格再左列 3 格**（站点暂无 League 池，未接）
 *     · `UnderwildShowcaseController` / `EventLimitedPoolSummonPreview` = 3 格单列（与默认竖排 3 格等效）
 *   默认容器的 6 格是中心锚（±120），实测 x>0 在屏幕上**偏左**（容器镜像）⇒ 横排表第 0 项落在站点左列，
 *   与盟约截图一致；S2 是边锚，不能把这条套过来。
 *   选横排表的判据 `v86 == 4`：`v86` = 展示条目数。
 */
/*
 * 各主题的**格子表**（站点坐标 = [列(0=左), 行(0=顶)]）：
 *   · 默认容器 `SummonViewController`：两张 6 元素表（偏移 0x0E8 = 横排、0x134 = 竖排，按 dump.cs 声明顺序），
 *     几何 = 2 列 × 3 行（x = ±120、y = -260/-520/-780），子节点序 = (右,左)×行1..行3
 *     ⇒ 横排 = sib[0,1,2,3,4,5]（逐行左右交替）、竖排 = sib[0,2,4,1,3,5]（先填满一列 3 格）
 *   · `AtlantisShowcaseController`（S2）= 4 格一行，引擎按 `_customFeaturedPortraits` 表序依次填
 *     （`ConfigureFeaturedPortraits` 0x1AD06D0：entity[i] → portraits[startIndex+i]），边锚又让表序
 *     恰好等于屏幕 L→R ⇒ 站点左列 = 表项 0、1，右列 = 表项 2、3（不是默认容器那种 2×2 行列交替）。
 *   · `LeagueShowcaseController` = 6 格但**先填右列**（站点暂无 League 池，未接）
 *   · `UnderwildShowcaseController` / `EventLimitedPoolSummonPreview` = 3 格单列（与默认竖排前 3 格同形）
 */
const FEATURED_CELL_SEQUENCES = {
    default: {
        vertical: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
        horizontal: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
    },
    atlantis: {
        // S2 的 4 格是**一组一行**：HeroLeft/HeroLeftSmall 锚在左上角、HeroRightSmall/HeroRight 锚在右上角
        //   ⇒ 屏幕 L→R 恰好就是序列化表序 [HeroLeft, HeroLeftSmall, HeroRightSmall, HeroRight]。
        //   官方反正也不看横/竖排（有自定义表就直接按表序填 `ConfigureFeaturedPortraits`），两张表同值。
        vertical: [[0, 0], [0, 1], [1, 0], [1, 1]],
        horizontal: [[0, 0], [0, 1], [1, 0], [1, 1]],
    },
};

function featuredCellSequence(pool) {
    const theme = String((pool && (pool.banner || pool.lotterybg)) || '');
    const table = /atlantis|season2/i.test(theme) ? FEATURED_CELL_SEQUENCES.atlantis : FEATURED_CELL_SEQUENCES.default;
    return table[state.featuredPortraitsReadByRow ? 'horizontal' : 'vertical'];
}

/** 第 i 个**被点亮的格子**的 [列, 行]：官方 `HideAllFeaturedPortraits()` 后只写表的前若干格，
 *  站点渲染的格子数由 `featuredSlotCount` 决定（无可选槽 = 精选实体数）⇒ 按该主题表被点亮的顺序依次取格。 */
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

    const numFeatured = featuredSlotCount(state.currentSummonData);
    const cellMap = featuredCellMap(numFeatured, state.currentSummonData);
    const columns = [[], []];
    rightColumn.style.display = cellMap.some(c => c[0] === 1) ? '' : 'none';
    for (let i = 0; i < numFeatured; i++) {
        const slot = document.createElement('div');
        slot.className = 'featured-hero-slot';
        slot.dataset.slotIndex = i;
        const hero = state.customFeaturedHeroes[i] || null;

        if (hero && hero.isFeaturedOnly) {
            slot.classList.add('non-removable');
        }

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
            if (state.customFeaturedHeroes[i] && !state.customFeaturedHeroes[i].isFeaturedOnly) {
                removeHeroFromFeaturedSlot(i);
            }
        });

        const [col, row] = cellMap[i];
        columns[col][row] = slot;
    }
    for (const [colIndex, columnEl] of [[0, leftColumn], [1, rightColumn]]) {
        for (const slot of columns[colIndex]) {
            if (slot) columnEl.appendChild(slot);
        }
    }
}

/**
 * 更新召唤按钮的可见性和价格
 */
function updateSummonButtons() {
    const pool = state.currentSummonData;
    const singleBtn = document.getElementById('single-summon-btn');
    const tenBtn = document.getElementById('ten-summon-btn');
    const thirtyBtn = document.getElementById('thirty-summon-btn');
    if (!singleBtn || !tenBtn || !thirtyBtn) return;
    singleBtn.querySelector('.gem-price').textContent = pool.gemPrice;
    if (pool.bulk10) {
        tenBtn.classList.remove('hidden');
        tenBtn.querySelector('.gem-price').textContent = pool.bulk10.gemPrice;
    } else {
        tenBtn.classList.add('hidden');
    }
    if (pool.bulk30) {
        thirtyBtn.classList.remove('hidden');
        thirtyBtn.querySelector('.gem-price').textContent = pool.bulk30.gemPrice;
    } else {
        thirtyBtn.classList.add('hidden');
    }
}

/**
 * 将一个英雄添加到下一个可用的精选卡槽中
 * @param {object} selectedHero - 从主列表选择的英雄
 */
function addHeroToFeaturedSlot(selectedHero) {
    const poolConfig = state.currentSummonData;
    // ▼▼▼ 处理 entitiesToChooseFrom 安全校验 ▼▼▼
    if (poolConfig && poolConfig.entitiesToChooseFrom && poolConfig.entitiesToChooseFrom.length > 0) {
        if (!poolConfig.entitiesToChooseFrom.includes(selectedHero.heroId)) {
            alert("该英雄无法在此奖池中被选为精选英雄。"); // 可以后续添加到多语言
            return;
        }
    }
    // 官方精选位资格（基类 0x1CBC880 / AllianceEventSummon 覆写 0x1C52A90）：
    // 服装角色只有在产品 `includeCostumes` 为真时才允许被选为精选英雄。
    if (poolConfig && selectedHero.costume_id && poolConfig.includeCostumes !== true) {
        alert("该英雄无法在此奖池中被选为精选英雄。");
        return;
    }
    if (selectedHero.rarity !== 5) {
        alert(i18n[state.currentLang].mustSelect5StarHero || '请选择一位5星英雄。');
        return;
    }
    const emptyIndex = state.customFeaturedHeroes.findIndex(h => h === null || h === undefined);
    if (emptyIndex !== -1) {
        state.customFeaturedHeroes[emptyIndex] = selectedHero;
        renderFeaturedHeroes();
        applyFiltersAndRender();
    } else {
        alert(i18n[state.currentLang].featuredSlotsFull || '所有精选英雄卡槽已满，可双击精选英雄头像移除。');
    }
}

/**
 * 从精选卡槽中移除英雄
 * @param {number} slotIndex - 要移除英雄的卡槽索引
 */
function removeHeroFromFeaturedSlot(slotIndex) {
    if (state.customFeaturedHeroes[slotIndex]) {
        state.customFeaturedHeroes[slotIndex] = null;
        renderFeaturedHeroes();
        applyFiltersAndRender();
    }
}

// --- 动画与历史记录 ---

/**
 * 执行召唤动作
 * @param {number} count - 召唤次数
 */
async function performSummon(count) {
    const poolConfig = state.currentSummonData;
    if (poolConfig.featuredHeroNum > 0 && !state.customFeaturedHeroes.some(h => h !== null)) {
        const langDict = i18n[state.currentLang] || {};
        alert(langDict.featuredHeroRequired);
        return;
    }
    if (!poolConfig) {
        return;
    }

    // ★ 权重：补充规则覆盖 + 超级元素按颜色覆盖（与概率提示/历史统计共用）
    const bucketWeights = getEffectiveBucketWeights(poolConfig);

    const masterHeroPool = getFilteredMasterPool();
    const isCostumeSummon = poolConfig.productType === 'CostumeSummon';
    let costumePool = [];

    if (isCostumeSummon) {
        costumePool = buildCostumeSummonPool(poolConfig);
        if (costumePool.length === 0) return;
    }

    const allGroupedResults = [];

    for (let k = 0; k < count; k++) {
        const singlePullResults = [];
        let drawnHero = null;
        let bucketString = 'unknown';

        if (isCostumeSummon) {
            const bucketIndex = selectWeightedIndex(bucketWeights);
            bucketString = poolConfig.bucketConfig[bucketIndex];
            const isFeatured = bucketString === 'featuredHero';

            if (isFeatured && poolConfig.featuredHeroes && poolConfig.featuredHeroes.length > 0) {
                const featuredIds = poolConfig.featuredHeroes;
                const randomHeroId = featuredIds[Math.floor(Math.random() * featuredIds.length)];
                drawnHero = state.heroesByIdMap.get(randomHeroId);
            } else {
                const starMatch = bucketString.match(/_(\d+)$/);
                const targetStar = isFeatured ? 5 : (starMatch ? parseInt(starMatch[1], 10) : 0);
                const heroPoolOfStar = costumePool.filter(h => h.rarity === targetStar);

                if (heroPoolOfStar.length > 0) {
                    drawnHero = heroPoolOfStar[Math.floor(Math.random() * heroPoolOfStar.length)];
                }
            }
            bucketString = 'costume';
        } else {
            const bucketIndex = selectWeightedIndex(bucketWeights);
            bucketString = poolConfig.bucketConfig[bucketIndex];
            // ★ 修改：使用新函数，传入 index ★
            if (bucketString && bucketString.startsWith('trainer')) {
                const star = parseInt(bucketString.split('_')[1], 10);
                const colors = ['红', '蓝', '绿', '黄', '紫'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                drawnHero = { name: `${star}* 训练师`, type: 'trainer', rarity: star, element: randomColor, image: `imgs/hero_icon/trainer_rainbow.webp`, heroId: `trainer_rainbow` };
            } else if (bucketString === 'featuredHero') {
                const validFeatured = state.customFeaturedHeroes.filter(h => h !== null);
                if (validFeatured.length > 0) {
                    drawnHero = validFeatured[Math.floor(Math.random() * validFeatured.length)];
                } else {
                    // ★ 修改：合并 heroes_s1_3 和 heroes_ex_s1_3 作为 fallback 池 ★
                    const fallbackPool1 = getHeroPoolForBucketWithExtra('heroes_s1_3', -1, poolConfig);
                    const fallbackPool2 = getHeroPoolForBucketWithExtra('heroes_ex_s1_3', -1, poolConfig);
                    const mergedFallback = [...fallbackPool1, ...fallbackPool2];
                    const uniqueFallback = new Map();
                    mergedFallback.forEach(h => {
                        if (h && h.heroId && !uniqueFallback.has(h.heroId)) {
                            uniqueFallback.set(h.heroId, h);
                        }
                    });
                    const fallbackPool = Array.from(uniqueFallback.values());
                    //console.log(`[抽奖调试] 奖池桶无有效英雄，使用 fallback 池 (heroes_s1_3 + heroes_ex_s1_3)，大小: ${fallbackPool.length}`);
                    drawnHero = fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null;
                }
            } else if (bucketString) {
                const bucketIndex = poolConfig.bucketConfig.indexOf(bucketString);
                const heroPool = getHeroPoolForBucketWithExtra(bucketString, bucketIndex, poolConfig, masterHeroPool);
                if (heroPool.length > 0) {
                    drawnHero = heroPool[Math.floor(Math.random() * heroPool.length)];
                }
            }
        }

        if (!drawnHero) {
            // ★ 修改：合并 heroes_s1_3 和 heroes_ex_s1_3 作为 fallback 池 ★
            const fallbackPool1 = getHeroPoolForBucketWithExtra('heroes_s1_3', -1, poolConfig);
            const fallbackPool2 = getHeroPoolForBucketWithExtra('heroes_ex_s1_3', -1, poolConfig);
            const mergedFallback = [...fallbackPool1, ...fallbackPool2];
            const uniqueFallback = new Map();
            mergedFallback.forEach(h => {
                if (h && h.heroId && !uniqueFallback.has(h.heroId)) {
                    uniqueFallback.set(h.heroId, h);
                }
            });
            const fallbackPool = Array.from(uniqueFallback.values());
            // console.log(`[抽奖调试] 主抽取失败，使用 fallback 池 (heroes_s1_3 + heroes_ex_s1_3)，大小: ${fallbackPool.length}`);
            if (fallbackPool.length > 0) {
                drawnHero = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                bucketString = 'fallback_s1_3';
                // console.log(`[抽奖调试] fallback 抽到英雄: ${drawnHero.heroId || drawnHero.name}`);
            } else {
                // console.warn(`[抽奖调试] fallback 池也为空！本次抽奖无结果。`);
            }
        }

        if (drawnHero) {
            singlePullResults.push({ hero: drawnHero, bucket: isCostumeSummon ? 'costume' : (bucketString || 'unknown') });
            // 奖励传奇英雄逻辑（不变）
            const associatedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
            let shouldTriggerBonusLegendary = false;
            if (poolConfig.id === 'lottery_black_7th_birthday' && drawnHero.rarity === 5 && poolConfig.bonusLegendaryHeroChancePerMil) {
                shouldTriggerBonusLegendary = true;
            } else if ((poolConfig.productType.toLowerCase() === 'shadowsummon' && drawnHero.rarity === 5 && poolConfig.bonusLegendaryHeroChancePerMil) || (drawnHero.rarity === 5 && drawnHero.family && associatedFamilies.includes(String(drawnHero.family).toLowerCase()) && poolConfig.bonusLegendaryHeroChancePerMil)) {
                shouldTriggerBonusLegendary = true;
            }

            if (shouldTriggerBonusLegendary) {
                const isEventOnly = poolConfig.bonusLegendaryHeroPullTriggersOnEventHeroesOnly;
                let baseBonusPool;
                if (poolConfig.id === 'lottery_black_7th_birthday') {
                    const featuredHeroIds = new Set();
                    if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
                        poolConfig.featuredHeroes.forEach(id => featuredHeroIds.add(id));
                    }
                    if (state.customFeaturedHeroes) {
                        state.customFeaturedHeroes.forEach(hero => hero && hero.heroId && featuredHeroIds.add(hero.heroId));
                    }
                    baseBonusPool = masterHeroPool.filter(h =>
                        h.rarity === 5 &&
                        h.family && h.family !== 'classic' &&
                        !featuredHeroIds.has(h.heroId)
                    );
                } else if (isEventOnly) {
                    baseBonusPool = masterHeroPool.filter(h => h.rarity === 5 && h.family && associatedFamilies.includes(String(h.family).toLowerCase()));
                } else {
                    baseBonusPool = masterHeroPool.filter(h => h.rarity === 5 && h.family && h.family !== 'classic');
                }

                const awardedBonusHeroesInThisPull = [];
                for (let i = 0; i < (poolConfig.bonusLegendaryHeroPullAmount || 1); i++) {
                    if (Math.random() * 1000 < poolConfig.bonusLegendaryHeroChancePerMil) {
                        const availableBonusPool = baseBonusPool.filter(hero => {
                            const isNotTriggerHero = hero.heroId !== drawnHero.heroId;
                            const isNotAlreadyAwarded = !awardedBonusHeroesInThisPull.some(awarded => awarded.heroId === hero.heroId);
                            return isNotTriggerHero && isNotAlreadyAwarded;
                        });
                        if (availableBonusPool.length > 0) {
                            const bonusHero = availableBonusPool[Math.floor(Math.random() * availableBonusPool.length)];
                            singlePullResults.push({ hero: bonusHero, bucket: 'bonusLegendary' });
                            awardedBonusHeroesInThisPull.push(bonusHero);
                        }
                    }
                }
            }

            if (poolConfig.hasMysteryHeroBonusRoll) {
                const hotmInfo = summonPoolDetails.hotm;
                if (hotmInfo && Math.random() * 1000 < parseInt(hotmInfo.ChancePerMil, 10)) {
                    const latestHotm = pickHotmBonusHero(hotmInfo);
                    if (latestHotm) singlePullResults.push({ hero: latestHotm, bucket: 'hotm' });
                }
                let mysteryInfo = poolConfig.productType === 'LegendsSummon' ? summonPoolDetails.LegendsSummonMysteryHero : summonPoolDetails.MysteryHero;
                if (mysteryInfo && Math.random() * 1000 < parseInt(mysteryInfo.ChancePerMil, 10)) {
                    const mysteryPool = getSimHeroPool().filter(h => String(h.family) === String(mysteryInfo.family));
                    if (mysteryPool.length > 0) {
                        let mysteryHero = mysteryPool.sort((a, b) => {
                            const aHasDate = !!a['Release date'];
                            const bHasDate = !!b['Release date'];
                            if (a.rarity !== b.rarity) return b.rarity - a.rarity;
                            if (!aHasDate && bHasDate) return -1;
                            if (!bHasDate && aHasDate) return 1;
                            return String(b['Release date']).localeCompare(String(a['Release date']));
                        })[0];
                        if (mysteryHero) {
                            singlePullResults.push({ hero: mysteryHero, bucket: 'mystery' });
                        }
                    }
                }
            }

            if (poolConfig.additionalDrawWeights) {
                const totalWeight = poolConfig.additionalDrawWeights.reduce((a, b) => a + b, 0);
                let random = Math.random() * totalWeight;
                for (let i = 0; i < poolConfig.additionalDrawWeights.length; i++) {
                    if (random < poolConfig.additionalDrawWeights[i]) {
                        for (let j = 0; j < i; j++) {
                            const extraBucketIndex = selectWeightedIndex(bucketWeights);
                            const extraBucketString = poolConfig.bucketConfig[extraBucketIndex];
                            let extraHero = null;
                            if (extraBucketString && extraBucketString.startsWith('trainer')) {
                                const star = parseInt(extraBucketString.split('_')[1], 10);
                                extraHero = { name: `${star}* 训练师`, type: 'trainer', rarity: star, element: ['红', '蓝', '绿', '黄', '紫'][Math.floor(Math.random() * 5)], image: `imgs/hero_icon/trainer_rainbow.webp`, heroId: `trainer_rainbow` };
                            } else if (extraBucketString === 'featuredHero') {
                                const validFeatured = state.customFeaturedHeroes.filter(h => h !== null);
                                if (validFeatured.length > 0) {
                                    extraHero = validFeatured[Math.floor(Math.random() * validFeatured.length)];
                                } else {
                                    // ★ 修改：合并 heroes_s1_3 和 heroes_ex_s1_3 作为 fallback 池 ★
                                    const fallbackPool1 = getHeroPoolForBucketWithExtra('heroes_s1_3', -1, poolConfig);
                                    const fallbackPool2 = getHeroPoolForBucketWithExtra('heroes_ex_s1_3', -1, poolConfig);
                                    const mergedFallback = [...fallbackPool1, ...fallbackPool2];
                                    const uniqueFallback = new Map();
                                    mergedFallback.forEach(h => {
                                        if (h && h.heroId && !uniqueFallback.has(h.heroId)) {
                                            uniqueFallback.set(h.heroId, h);
                                        }
                                    });
                                    const fallbackPool = Array.from(uniqueFallback.values());
                                    // console.log(`[抽奖调试] 额外桶无有效英雄，使用 fallback 池 (heroes_s1_3 + heroes_ex_s1_3)，大小: ${fallbackPool.length}`);
                                    drawnHero = fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null;
                                }
                            } else if (extraBucketString) {
                                const idx = poolConfig.bucketConfig.indexOf(extraBucketString);
                                const heroPool = getHeroPoolForBucketWithExtra(extraBucketString, idx, poolConfig, masterHeroPool);
                                if (heroPool.length > 0) extraHero = heroPool[Math.floor(Math.random() * heroPool.length)];
                            }
                            if (extraHero) {
                                singlePullResults.push({ hero: extraHero, bucket: 'additionalDraw' });
                            }
                        }
                        break;
                    }
                    random -= poolConfig.additionalDrawWeights[i];
                }
            }
        }
        allGroupedResults.push(singlePullResults);
    }

    const totalSummonedResults = allGroupedResults.flat();
    if (totalSummonedResults.length === 0) return;

    if (state.lotteryAnimationMode === 'silent') {
        updateSummonHistory(allGroupedResults, count);
        return;
    }
    if (state.lotteryAnimationMode === 'skip') {
        updateSummonHistory(allGroupedResults, count);
        if (count === 1) {
            showSinglePullResultsModal(totalSummonedResults);
        } else {
            showSummaryModal(totalSummonedResults);
        }
        return;
    }

    // full 模式
    const animationViewport = document.getElementById('lottery-hero-display-area');
    const blockerOverlay = document.getElementById('animation-blocker-overlay');
    const buttonParentContainer = document.getElementById('lottery-simulator-wrapper');
    const skipButton = document.createElement('button');
    const titleElement = document.getElementById('lottery-pool-title');
    const portalContainer = document.getElementById('lottery-portal-container');
    if (!titleElement || !portalContainer || !animationViewport || !blockerOverlay || !buttonParentContainer) return;

    blockerOverlay.classList.remove('hidden');

    skipButton.id = 'skip-animation-btn';
    skipButton.textContent = i18n[state.currentLang].skipAnimation || '跳过动画';
    skipButton.className = 'action-button';
    const parentRect = buttonParentContainer.getBoundingClientRect();
    const titleRect = titleElement.getBoundingClientRect();
    const portalRect = portalContainer.getBoundingClientRect();
    const targetTop = titleRect.bottom + 15;
    const targetLeft = portalRect.left + (portalRect.width / 2);
    skipButton.style.position = 'absolute';
    skipButton.style.top = `${targetTop - parentRect.top}px`;
    skipButton.style.left = `${targetLeft - parentRect.left}px`;
    skipButton.style.transform = 'translateX(-50%)';
    buttonParentContainer.appendChild(skipButton);

    let skip = false;
    const skipHandler = () => {
        skip = true;
        if (buttonParentContainer.contains(skipButton)) {
            buttonParentContainer.removeChild(skipButton);
        }
        blockerOverlay.classList.add('hidden');
    };
    skipButton.addEventListener('click', skipHandler, { once: true });

    const bonusAnimationBuckets = ['additionalDraw', 'hotm', 'mystery'];
    for (const result of totalSummonedResults) {
        if (skip) break;
        const isBonusDraw = bonusAnimationBuckets.includes(result.bucket);
        await showSingleSummonAnimation(result.hero, animationViewport, isBonusDraw);
    }

    blockerOverlay.classList.add('hidden');
    if (buttonParentContainer.contains(skipButton)) {
        buttonParentContainer.removeChild(skipButton);
    }
    updateSummonHistory(allGroupedResults, count);
    if (count === 1) {
        showSinglePullResultsModal(totalSummonedResults);
    } else {
        showSummaryModal(totalSummonedResults);
    }
}


/**
 * 在指定容器内播放动画，并根据参数决定是否添加奖励动画
 * @param {object} hero - 抽到的英雄
 * @param {HTMLElement} animationViewport - 动画播放的容器
 * @param {boolean} isBonusDraw - 是否为额外奖励抽奖
 * @returns {Promise}
 */
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
            setTimeout(() => {
                animationViewport.innerHTML = '';
                resolve();
            }, 1200);
        };

        const baseIconId = hero.heroId || null;
        if (baseIconId) {
            const avatarSrc = `imgs/avatar/${baseIconId}.webp`;
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


/**
 * 显示包含所有抽奖结果的总结弹窗
 * @param {Array} results - 包含所有抽奖结果的数组，每个元素是 {hero, bucket}
 */
function showSummaryModal(results) {
    const overlay = document.getElementById('summon-summary-modal-overlay');
    const summaryModal = document.getElementById('summon-summary-modal');
    const scrollContainer = document.getElementById('summon-summary-scroll-container');
    if (!overlay || !summaryModal || !scrollContainer) {
        return;
    }

    const langDict = i18n[state.currentLang] || {};
    const modalTitle = summaryModal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = langDict.summonResultsTitle;
    }
    // ▼▼▼ 确保只应用当前视图所需的CSS类 ▼▼▼
    summaryModal.classList.remove('single-pull-result-view', 'soul-exchange-view');
    summaryModal.classList.add('summon-result-view');


    scrollContainer.innerHTML = '';
    const bonusBuckets = ['bonusLegendary', 'hotm', 'mystery', 'additionalDraw'];

    results.forEach(result => {
        const hero = result.hero;
        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.elementId)}`;
        card.title = hero.name;

        // 【新增代码】如果是5星英雄，则添加跑马灯效果的CSS类
        if (hero.rarity === 5) {
            card.classList.add('star-5-marquee');
        }

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.elementId);

        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        // ▼▼▼ 为训练师英雄设置特殊头像路径 ▼▼▼
        if (String(hero.family).toLowerCase() === 'trainer') {
            avatarImage.src = hero.image; // 强制使用预设的 trainer_rainbow.webp 路径
        } else {
            avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        }
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-details-overlay';
        let starsContent = '';

        if (hero.rarity) {
            let starsHTML = '';
            for (let i = 0; i < hero.rarity; i++) {
                starsHTML += `<img loading="lazy" src="imgs/other/star.webp" decoding="async" alt="star">`;
            }
            starsContent = starsHTML;
        }

        const colorIcon = String(hero.elementId || 'default').toLowerCase();
        const colorIconHTML = `<img loading="lazy" class="summary-color-icon" src="imgs/element/${colorIcon}.webp" decoding="async">`;

        detailsOverlay.innerHTML = `
            ${colorIconHTML}
            <div class="summary-hero-stars star-level-${hero.rarity}">${starsContent}</div>
        `;

        card.appendChild(avatar);
        card.appendChild(detailsOverlay);

        if (bonusBuckets.includes(result.bucket)) {
            const exLabel = document.createElement('div');
            exLabel.className = 'summary-ex-label';
            exLabel.textContent = 'Ex';
            card.appendChild(exLabel);
        }

        // 检查是否为可查看详情的真实英雄
        if (hero.type !== 'trainer' && hero.originalIndex !== undefined && hero['Release date']) {
            const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
            if (targetHero) {
                card.classList.add('is-clickable');
                card.addEventListener('click', () => {
                    // 先隐藏当前的总结弹窗
                    document.getElementById('summon-summary-modal').classList.add('hidden');
                    document.getElementById('summon-summary-modal-overlay').classList.add('hidden');

                    // 打开英雄详情，并传入一个 onClose 回调函数
                    openDetailsModal(targetHero, {
                        onClose: () => {
                            // 当详情弹窗关闭时，这个函数会被调用
                            const summaryModal = document.getElementById('summon-summary-modal');
                            const summaryOverlay = document.getElementById('summon-summary-modal-overlay');
                            if (summaryModal && summaryOverlay) {
                                // 重新显示总结弹窗
                                summaryModal.classList.remove('hidden');
                                summaryOverlay.classList.remove('hidden');
                                // 确保页面依然处于模态框打开状态
                                document.body.classList.add('modal-open');
                            }
                        }
                    });
                });
            }
        } else {
            // 对于没有发布日期的英雄，移除可点击样式
            card.classList.remove('is-clickable');
        }

        scrollContainer.appendChild(card);
    });
    // ▼▼▼ 在显示弹窗前，将滚动条重置到顶部 ▼▼▼
    // ▼▼▼ 使用 setTimeout 将滚动条重置操作推迟到下一次事件循环 ▼▼▼
    // 这可以确保浏览器有足够的时间渲染新添加的内容
    setTimeout(() => {
        scrollContainer.scrollTop = 0;
    }, 0);

    summaryModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    // ▼▼▼ 将弹窗状态推入浏览器历史记录 ▼▼▼
    history.pushState({ modal: 'summonSummary' }, null);
    state.modalStack.push('summonSummary');
}

/**
 * 更新并渲染抽奖历史记录
 * @param {Array} groupedResults - 本次抽奖的分组后结果数组, e.g., [ [hero1], [hero2, bonus1], ... ]
 * @param {number} count - 初始抽奖次数 (1, 10, 30)
 */
function updateSummonHistory(groupedResults, count) {
    if (groupedResults.length > 0) {
        // `poolKey` = 跨语言稳定的归组标识；`poolName` 保留（旧版兼容 + 兜底显示）
        state.summonHistory.unshift({
            count: count,
            results: groupedResults.flat(),
            groupedResults: groupedResults,
            poolKey: getPoolTitleKey(state.currentSummonData),
            poolName: getPoolDisplayName(state.currentSummonData)
        });

        if (state.summonHistory.length > 1000) {
            state.summonHistory.pop();
        }
        saveHistoryToLocalStorage();
    }
    renderSummonHistory();
}

/**
 * 渲染完整的抽奖历史记录 (v9 - 最终样式复刻版)
 */
function renderSummonHistory() {
    // 1. 获取元素并清理 (逻辑不变)
    const historyContainer = document.getElementById('summon-history-list');
    const titleElement = document.getElementById('summon-history-title');
    const headerElement = document.querySelector('.summon-history-header');
    if (!historyContainer || !titleElement || !headerElement) return;
    historyContainer.innerHTML = '';
    const existingIcon = headerElement.querySelector('.history-probability-icon');
    if (existingIcon) headerElement.removeChild(existingIcon);

    // 2. 筛选历史并设置标题 (逻辑不变)
    const langDict = i18n[state.currentLang] || {};
    const currentPoolName = getPoolDisplayName(state.currentSummonData);
    const currentPoolKey = getPoolTitleKey(state.currentSummonData);
    let historyToRender;
    if (state.showAllSummonHistory) {
        historyToRender = state.summonHistory;
        titleElement.textContent = langDict.summonHistoryTitleAll || '全部召唤历史记录';
    } else {
        // 按**稳定标识**归组（旧记录按标题兜底）⇒ 切换语言后历史不再"消失"
        historyToRender = state.summonHistory.filter(
            group => isCurrentPoolHistoryGroup(group, currentPoolKey, currentPoolName));
        const totalPulls = historyToRender.reduce((sum, group) => sum + (group.count || 0), 0);
        titleElement.innerHTML = langDict.summonHistoryTitleCurrent(currentPoolName, totalPulls);
    }

    // 3. 【核心修正】生成与官方样式完全一致的 Tooltip
    if (!state.showAllSummonHistory && historyToRender.length > 0) {
        const stats = calculateAndFormatProbabilities(historyToRender, state.currentSummonData);

        if (stats) {
            const bucketTranslations = i18n[state.currentLang].lottery_bucket_translations || {};
            const bonusTranslations = i18n[state.currentLang].lottery_bonus_translations || {};
            const poolConfig = state.currentSummonData;

            const formatPercentage = (count, total) => {
                const percentageNum = total > 0 ? (count / total) * 100 : 0;
                const prefix = percentageNum < 10 ? '&nbsp;' : '';
                return `${prefix}${percentageNum.toFixed(2)}`;
            };

            const infoIcon = document.createElement('div');
            infoIcon.className = 'history-probability-icon';
            infoIcon.textContent = 'ⓘ';
            infoIcon.title = langDict.calculatedProbabilitiesTitle;

            // 生成主统计列表
            let listItems = '';
            if (poolConfig.bucketConfig && poolConfig.bucketWeights) {
                const effectiveWeights = getEffectiveBucketWeights(poolConfig);
                poolConfig.bucketConfig.forEach((bucketName, index) => {
                    if (effectiveWeights[index] > 0) {
                        const count = stats.heroStats.counts[bucketName] || 0;
                        const percentage = formatPercentage(count, stats.heroStats.total);
                        const translatedName = bucketTranslations[bucketName] || bucketName;
                        listItems += `<li><span>${translatedName}</span><span>${percentage}%</span></li>`;
                    }
                });
            }

            // 生成额外概率列表
            let bonusListItems = '';
            if (poolConfig.hasMysteryHeroBonusRoll) {
                bonusListItems += `<li><span>${bonusTranslations.hotm}</span><span>${formatPercentage(stats.eventStats.hotm.count, stats.eventStats.hotm.total)}%</span></li>`;
                const mysteryDictKey = poolConfig.productType === 'LegendsSummon' ? 'LegendsSummonMysteryHero' : 'MysteryHero';
                bonusListItems += `<li><span>${bonusTranslations[mysteryDictKey]}</span><span>${formatPercentage(stats.eventStats.mystery.count, stats.eventStats.mystery.total)}%</span></li>`;
            }

            // 生成额外传奇英雄区块
            let legendaryBonusItems = '';
            if (stats.eventStats.bonusLegendary) {
                const typeValueKey = poolConfig.bonusLegendaryHeroPullTriggersOnEventHeroesOnly ? "eventHeroesOnly" : "NonClassicHero";
                const typeValue = (i18n[state.currentLang].lottery_bonus_values || {})[typeValueKey] || typeValueKey;
                legendaryBonusItems = `
                    <h4 style="margin-top:10px; padding-top:5px; border-top:1px dashed #fff;">${bonusTranslations.bonusLegendaryProbabilityTitle}</h4>
                    <ul>
                        <li><span>${bonusTranslations.bonusLegendaryHeroType}</span><span>${typeValue}</span></li>
                        <li><span>${bonusTranslations.bonusLegendaryHeroChancePerMil}</span><span>${formatPercentage(stats.eventStats.bonusLegendary.success, stats.eventStats.bonusLegendary.triggers)}%</span></li>
                    </ul>`;
            }

            // 生成单次召唤总数区块
            if (stats.eventStats.additionalDraw) {
                const percentages = poolConfig.additionalDrawWeights.map((w, i) => {
                    const pullSize = i + 1;
                    const count = stats.eventStats.additionalDraw.counts[pullSize] || 0;
                    return `${pullSize < 10 ? '&nbsp;&nbsp;' : ''}${pullSize} - ${formatPercentage(count, stats.eventStats.additionalDraw.total)}%`;
                }).join('<br>');
                const name = `${bonusTranslations.additionalDrawWeights} (共 ${stats.eventStats.additionalDraw.totalBonus} 个)`;
                bonusListItems += `<li><span>${name}</span><span>${percentages}</span></li>`;
            }

            // 组合最终的 HTML
            // 调用新的多语言函数来生成总数文本
            const totalText = langDict.totalHeroesCountText ? langDict.totalHeroesCountText(stats.totalHeroesDrawn) : `(共 ${stats.totalHeroesDrawn} 位)`;
            const tooltipHTML = `
                <div class="probability-tooltip">
                    <h4>${langDict.calculatedProbabilitiesTitle} ${totalText}</h4>
                    <ul>${listItems}</ul>
                    ${bonusListItems ? `
                        <h4 style="margin-top:10px; padding-top:5px; border-top:1px dashed #fff;">${bonusTranslations.bonusProbabilityTitle}</h4>
                        <ul>${bonusListItems}</ul>
                    ` : ''}
                    ${legendaryBonusItems}
                </div>
            `;
            infoIcon.innerHTML += tooltipHTML;
            headerElement.insertBefore(infoIcon, titleElement);
        }
    }

    // 4. 渲染每个独立的抽奖组 (逻辑不变)
    if (historyToRender.length === 0) {
        historyContainer.innerHTML = `<div class="feature-incomplete-message">${langDict.noSummonHistory || '没有召唤历史'}</div>`;
        return;
    }
    const bonusBuckets = ['bonusLegendary', 'hotm', 'mystery', 'additionalDraw'];
    historyToRender.forEach(group => {
        const resultsToRender = group.results || [];
        if (resultsToRender.length === 0) return;
        const groupContainer = document.createElement('div');
        groupContainer.className = 'summon-history-group';
        const header = document.createElement('h5');
        const summonTypeTitle = `${langDict.summonOnce || '召唤'} x${group.count}`;
        // 分组标题**按当前语言**从稳定标识取（旧记录回落当时存的 `poolName`）
        const groupTitle = group.poolKey
            ? (lotteryTitleDict[group.poolKey] || group.poolName || '')
            : (group.poolName || '');
        header.textContent = groupTitle ? `${groupTitle} - ${summonTypeTitle}` : summonTypeTitle;
        const avatarsContainer = document.createElement('div');
        avatarsContainer.className = 'summon-history-avatars';
        resultsToRender.forEach(result => {
            const hero = result.hero;
            if (!hero) return;
            const avatarContainer = document.createElement('div');
            avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.elementId)}`;
            avatarContainer.title = hero.name;
            // 【新增代码】如果是5星英雄，则添加跑马灯效果的CSS类
            if (hero.rarity === 5) {
                avatarContainer.classList.add('star-5-marquee');
            }
            const avatarBackground = document.createElement('div');
            avatarBackground.className = 'hero-avatar-background';
            avatarBackground.style.background = getHeroColorLightGradient(hero.elementId);
            avatarContainer.appendChild(avatarBackground);
            const avatar = document.createElement('img');
            // ▼▼▼ 为训练师英雄设置特殊头像路径 ▼▼▼
            if (String(hero.family).toLowerCase() === 'trainer') {
                avatar.src = hero.image; // 强制使用预设的 trainer_rainbow.webp 路径
            } else {
                avatar.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
            }
            avatar.className = 'hero-avatar-image';
            avatar.alt = hero.name;
            avatarContainer.appendChild(avatar);

            // 检查是否为可查看详情的真实英雄
            if (hero.type !== 'trainer' && hero.originalIndex !== undefined && hero['Release date']) {
                const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
                if (targetHero) {
                    avatarContainer.classList.add('is-clickable');
                    avatarContainer.addEventListener('click', () => {
                        openDetailsModal(targetHero);
                    });
                }
            }

            if (bonusBuckets.includes(result.bucket)) {
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

/**
 * 将历史记录保存到本地存储
 */
function saveHistoryToLocalStorage() {
    try {
        const historyJSON = JSON.stringify(state.summonHistory);
        localStorage.setItem('summonHistory', historyJSON);
    } catch (e) {
        //console.error("无法保存抽奖历史:", e);
    }
}

/**
 * 旧存档键名兼容（就地、幂等）。
 * 2026-10-20 把英雄模型字段统一成官方口径：`star`→`rarity`、`colorId`→`elementId`、`color`→`element`
 * （对齐 `data/characters.json` 的 `rarity` / `element`，去掉 `ID_FIELD` 那层转换定义）。
 * 而 `localStorage.summonHistory` 存的是**整份英雄对象** ⇒ 老记录只有旧键，
 * 不补就会渲染成空星星、没有元素底色。
 */
function migrateLegacyHeroKeys(hero) {
    if (!hero || typeof hero !== 'object') return hero;
    if (hero.rarity === undefined && hero.star !== undefined) hero.rarity = hero.star;
    if (hero.elementId === undefined && hero.colorId !== undefined) hero.elementId = hero.colorId;
    if (hero.element === undefined && hero.color !== undefined) hero.element = hero.color;
    return hero;
}

/**
 * 从本地存储加载历史记录
 */
function loadHistoryFromLocalStorage() {
    try {
        const historyJSON = localStorage.getItem('summonHistory');
        if (historyJSON) {
            const parsedHistory = JSON.parse(historyJSON);
            if (Array.isArray(parsedHistory)) {
                state.summonHistory = parsedHistory;
                // 旧记录补新键（results 是扁平数组，groupedResults 是分组数组）
                state.summonHistory.forEach(rec => {
                    if (!rec) return;
                    (rec.results || []).forEach(migrateLegacyHeroKeys);
                    (rec.groupedResults || []).forEach(grp => (grp || []).forEach(migrateLegacyHeroKeys));
                });
            } else {
                state.summonHistory = [];
            }
        } else {
            state.summonHistory = [];
        }
    } catch (e) {
        state.summonHistory = [];
    }
}

/**
 * 为一组召唤结果计算实际概率，使其结构与主概率提示框一致。 (v9 - 最终样式复刻版)
 * @param {Array} historyToRender - 要进行统计的历史记录组数组。
 * @param {object} poolConfig - 当前奖池的配置对象。
 * @returns {object} 包含所有统计数据的结构化对象。
 */
function calculateAndFormatProbabilities(historyToRender, poolConfig) {
    const allResults = historyToRender.flatMap(group => group.results || (group.groupedResults ? group.groupedResults.flat() : []));
    if (allResults.length === 0 || !poolConfig) {
        return null;
    }

    // ▼▼▼ 1: 计算“普通抽取”的总次数 ▼▼▼
    const hotmCount = allResults.filter(r => r.bucket === 'hotm').length;
    const mysteryCount = allResults.filter(r => r.bucket === 'mystery').length;
    const bonusLegendaryCount = allResults.filter(r => r.bucket === 'bonusLegendary').length;
    // 分母 = 抽到的英雄总数 - 所有奖励英雄的数量 (因为奖励槽位本身不能再次触发奖励)
    const probabilityDenominator = allResults.length - hotmCount - mysteryCount - bonusLegendaryCount;

    const totalHeroesDrawn = allResults.length;
    const bonusLegendaryResults = allResults.filter(r => r.bucket === 'bonusLegendary');
    const baseResults = allResults.filter(r => r.bucket !== 'hotm' && r.bucket !== 'mystery' && r.bucket !== 'bonusLegendary');
    const totalBaseResults = baseResults.length;

    // 1. 主英雄统计
    const categoryCounts = {};
    if (poolConfig.bucketConfig) {
        poolConfig.bucketConfig.forEach(b => { if (b) categoryCounts[b] = 0; });
    }
    const featuredHeroIds = new Set((state.customFeaturedHeroes || []).filter(h => h).map(h => h.heroId));
    for (const result of baseResults) {
        const hero = result.hero;
        const bucket = result.bucket;
        let assigned = false;
        if (featuredHeroIds.has(hero.heroId) && categoryCounts.hasOwnProperty('featuredHero')) {
            categoryCounts['featuredHero']++;
            assigned = true;
        } else if (bucket && categoryCounts.hasOwnProperty(bucket)) {
            categoryCounts[bucket]++;
            assigned = true;
        }
        if (!assigned) {
            const star = hero.rarity;
            const bucketPriority = [`heroes_event_${star}`, `heroes_ex_s1_${star}`, `heroes_listed_${star}`, `heroes_s1_${star}`];
            const targetBucket = bucketPriority.find(b => categoryCounts.hasOwnProperty(b));
            if (targetBucket) categoryCounts[targetBucket]++;
        }
    }
    const heroStats = { counts: categoryCounts, total: totalBaseResults };

    // 2. 额外事件统计
    const eventStats = {
        // ▼▼▼ 2: 使用“普通抽取”总次数作为概率计算的分母 ▼▼▼
        hotm: { count: hotmCount, total: probabilityDenominator },
        mystery: { count: mysteryCount, total: probabilityDenominator },
    };

    // 3. 额外传奇英雄统计
    if (poolConfig.bonusLegendaryHeroChancePerMil) {
        let triggerCount = 0;
        const successCount = bonusLegendaryResults.length;
        const associatedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
        const allOriginalPulls = historyToRender.flatMap(group => group.groupedResults || []);

        if (allOriginalPulls.length > 0) {
            allOriginalPulls.forEach(pull => {
                if (pull && pull.length > 0) {
                    const primaryHero = pull[0].hero;
                    if (poolConfig.productType.toLowerCase() === 'shadowsummon' && primaryHero.rarity === 5) {
                        triggerCount++;
                    } else {
                        if (primaryHero.rarity === 5 && primaryHero.family && associatedFamilies.includes(String(primaryHero.family).toLowerCase())) {
                            triggerCount++;
                        }
                    }
                }
            });
        }

        // 关键修正：计算实际概率（除以额外奖励的抽取次数）
        const bonusPullAmount = poolConfig.bonusLegendaryHeroPullAmount || 1;
        const actualChancePerMil = poolConfig.bonusLegendaryHeroChancePerMil / bonusPullAmount;

        // 修正触发次数计算：每个符合条件的触发有 bonusPullAmount 次机会
        const totalTriggerOpportunities = triggerCount * bonusPullAmount;

        eventStats.bonusLegendary = {
            success: successCount,
            triggers: totalTriggerOpportunities, // 使用修正后的总触发机会数
            actualChancePerMil: actualChancePerMil, // 添加实际概率用于调试
            bonusPullAmount: bonusPullAmount // 添加抽取次数用于调试
        };
    }
    // 4. 单次召唤总数统计
    if (poolConfig.additionalDrawWeights) {
        const allOriginalPulls = historyToRender.flatMap(group => group.groupedResults || []);
        if (allOriginalPulls.length > 0) {
            const pullSizeCounts = {};
            allOriginalPulls.forEach(pull => {
                const size = pull.length;
                pullSizeCounts[size] = (pullSizeCounts[size] || 0) + 1;
            });
            eventStats.additionalDraw = {
                counts: pullSizeCounts,
                total: allOriginalPulls.length,
                totalBonus: allResults.filter(r => r.bucket === 'additionalDraw').length
            };
        }
    }

    return { heroStats, eventStats, totalHeroesDrawn };
}

// --- 视图切换 ---

/**
 * 切换抽奖模拟器视图的显示和隐藏
 */
function toggleLotterySimulator() {
    state.lotterySimulatorActive = !state.lotterySimulatorActive;
    const isActive = state.lotterySimulatorActive;

    const wrapper = document.getElementById('lottery-simulator-wrapper');
    const button = document.getElementById('show-lottery-simulator-btn');
    const langDict = i18n[state.currentLang] || {};

    if (isActive) {
        if (state.teamSimulatorActive) {
            toggleTeamSimulator();
        }

        uiElements.wantedMissionView.classList.add('hidden');
        uiElements.farmingGuideView.classList.add('hidden');
        if (uiElements.chatSimulatorView) {
            uiElements.chatSimulatorView.classList.add('hidden');
        }
        uiElements.heroTableView.classList.remove('hidden');
        wrapper.classList.remove('hidden');
        button.classList.add('simulator-exit-btn');
        button.title = langDict.returnToList;
        uiElements.headerInfoContainer.classList.add('hidden');
        uiElements.donationlistcontainer.classList.add('hidden');
        document.body.classList.add('lottery-mode-active');

        // 奖池标题字典是**按语言缓存**的：`renderActivityList()` 原先只在 `initializeLotterySimulator`
        // （开站那一刻）和"抽奖已可见时切语言"两条路里被调 ⇒ 在列表页先把语言切好、再进抽奖时，
        // 左侧卡池列表还是开站时的语言（只有中间标题走 `handleActivityClick` 现算，所以它对、列表不对）。
        // ⇒ 进入抽奖无条件重取字典并重画列表（很便宜，列表只有几十个节点）。
        if (typeof refreshLotteryTranslations === 'function') refreshLotteryTranslations();
        renderActivityList();

        // 进入抽奖模拟器：**清空所有筛选**，让下面那份卡池列表从"全量"里取，而不是叠在上一次的筛选上。
        // ⚠ 这个进入分支原本不重渲染（只有退出分支调 applyFiltersAndRender），而英雄表在上面被显式
        //   保持可见 ⇒ 渲染交给 handleActivityClick（它内部 `activeHeroSubset = getFilteredMasterPool()`
        //   + applyFiltersAndRender），拿不到卡池的两种情况才自己补一次 ⇒ 每条路径恰好渲染一次。
        resetAllFilters();

        const activityList = document.getElementById('lottery-activity-list-container');
        const historyList = document.getElementById('summon-history-list-container');
        if (activityList) activityList.scrollTop = 0;
        if (historyList) historyList.scrollTop = 0;

        if (state.allSummonPools) {
            // 带 `?pool=` 进来 ⇒ 停在那个池；没有则沿用"选列表第一个"的既有行为
            const _poolParam = new URLSearchParams(window.location.search).get('pool');
            const firstPoolId = Object.keys(state.allSummonPools)[0];
            if (!(_poolParam && selectSummonPoolByUrlParam(_poolParam))) {
                if (firstPoolId) {
                    handleActivityClick(firstPoolId);
                } else {
                    applyFiltersAndRender();
                }
            }
        } else {
            applyFiltersAndRender();
        }
        setMainViewHistory('lotterySimulator');
    } else {
        wrapper.classList.add('hidden');
        button.classList.remove('simulator-exit-btn');
        button.title = langDict.lotterySimulatorTitle;
        uiElements.headerInfoContainer.classList.remove('hidden');
        uiElements.donationlistcontainer.classList.remove('hidden');
        document.body.classList.remove('lottery-mode-active');
        state.activeHeroSubset = null;
        applyFiltersAndRender();
        // 主动退出 ⇒ 地址回到列表（带条件，见 special-views.js::syncViewUrlAfterToggle）
        if (typeof syncViewUrlAfterToggle === 'function') syncViewUrlAfterToggle();
    }
}

/**
 * 显示单次召唤结果的专属模态框（支持1个或多个英雄）
 * @param {Array} results - 本次单抽获得的所有英雄结果
 */
function showSinglePullResultsModal(results) {
    const overlay = document.getElementById('summon-summary-modal-overlay');
    const summaryModal = document.getElementById('summon-summary-modal');
    const scrollContainer = document.getElementById('summon-summary-scroll-container');
    if (!overlay || !summaryModal || !scrollContainer) return;

    const langDict = i18n[state.currentLang] || {};
    const modalTitle = summaryModal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = langDict.summonResultsTitle;
    }

    // ▼▼▼ 确保只应用当前视图所需的CSS类 ▼▼▼
    summaryModal.classList.remove('summon-result-view', 'soul-exchange-view');
    summaryModal.classList.add('single-pull-result-view');

    scrollContainer.innerHTML = ''; // 清空内容
    const bonusBuckets = ['bonusLegendary', 'hotm', 'mystery', 'additionalDraw'];

    // 复用 showSummaryModal 中的卡片创建逻辑
    results.forEach(result => {
        const hero = result.hero;
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
        if (String(hero.family).toLowerCase() === 'trainer') {
            avatarImage.src = hero.image;
        } else {
            avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        }
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-details-overlay';
        let starsContent = '';

        if (hero.rarity) {
            let starsHTML = '';
            for (let i = 0; i < hero.rarity; i++) {
                starsHTML += `<img loading="lazy" src="imgs/other/star.webp" decoding="async" alt="star">`;
            }
            starsContent = starsHTML;
        }
        const colorIcon = String(hero.elementId || 'default').toLowerCase();
        const colorIconHTML = `<img loading="lazy" class="summary-color-icon" src="imgs/element/${colorIcon}.webp" decoding="async">`;

        detailsOverlay.innerHTML = `
            ${colorIconHTML}
            <div class="summary-hero-stars star-level-${hero.rarity}">${starsContent}</div>
        `;

        card.appendChild(avatar);
        card.appendChild(detailsOverlay);

        if (bonusBuckets.includes(result.bucket)) {
            const exLabel = document.createElement('div');
            exLabel.className = 'summary-ex-label';
            exLabel.textContent = 'Ex';
            card.appendChild(exLabel);
        }

        if (hero.type !== 'trainer' && hero.originalIndex !== undefined && hero['Release date']) {
            const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
            if (targetHero) {
                card.classList.add('is-clickable');
                card.addEventListener('click', () => openDetailsModal(targetHero));
            }
        } else {
            // 对于没有发布日期的英雄，移除可点击样式
            card.classList.remove('is-clickable');
        }
        scrollContainer.appendChild(card);
    });

    // 打开模态框
    summaryModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'summonSummary' }, null);
    state.modalStack.push('summonSummary');
}

/**
 * 创建一个战斗指南按钮
 * @param {string} imagePath - 战斗指南图片的路径
 * @param {string} buttonText - 按钮上显示的文本 (例如 "⚔️")
 * @returns {HTMLElement} - 返回 <a> 按钮元素
 */
function createGuideButton(imagePath, buttonText) {
    const button = document.createElement('a');
    button.href = imagePath;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.className = 'guide-button'; // Styled in style.css
    button.textContent = buttonText;
    button.title = i18n[state.currentLang].StageGuideTitle || '关卡指南'; // Show filename on hover

    return button;
}