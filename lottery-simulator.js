// lottery-simulator.js: 抽奖模拟器的所有逻辑
const lotteryTitles = {
    "cn": {
        "lottery.title.lottery_black_7th_birthday": "生日召唤",
        "lottery.title.allianceeventsummon": "联盟任务召唤",
        "lottery.title.ancientdragonsummon": "远古巨龙召唤",
        "lottery.title.ascensionitemsummon": "进阶召唤",
        "lottery.title.ascensionsummon": "即时力量",
        "lottery.title.astralelvessummon": "星体召唤",
        "lottery.title.lottery_black_default": "黑色星期五召唤",
        "lottery.title.challengeeventsummon": "活动召唤",
        "lottery.title.costumesummon": "服装召唤",
        "lottery.title.covenantsummon": "盟约召唤",
        "lottery.title.dailysummon": "每日召唤",
        "lottery.title.elementaldragonsummon": "元素巨龙召唤",
        "lottery.title.epicdragonsummon": "传奇巨龙召唤",
        "lottery.title.epicherosummon": "史诗英雄召唤",
        "lottery.title.epictroopsummon": "史诗队伍召唤",
        "lottery.title.featuredsummon": "元素人召唤",
        "lottery.title.goblinsummon": "哥布林召唤",
        "lottery.title.harvestsummon": "丰收召唤",
        "lottery.title.itemsummon": "进阶召唤",
        "lottery.title.leaguesummon": "英雄锦标赛召唤",
        "lottery.title.legendarytroopsummon": "传奇队伍召唤",
        "lottery.title.legendssummon": "神话召唤",
        "lottery.title.limitbreakitemsummon": "艾瑟尔召唤",
        "lottery.title.lottery_updated": "召唤已更新",
        "lottery.title.mercenarywarsummon": "三国召唤",
        "lottery.title.monsterislandsummon": "怪兽岛召唤",
        "lottery.title.moths": "联盟任务召唤",
        "lottery.title.pickupsummon": "节选召唤",
        "lottery.title.lottery_season_atlantis": "亚特兰蒂斯召唤",
        "lottery.title.lottery_season_valhalla": "瓦尔哈拉召唤",
        "lottery.title.lottery_season_underwild": "蛮荒地界召唤",
        "lottery.title.lottery_season_season5": "沙丘召唤",
        "lottery.title.seasonal": "季节召唤",
        "lottery.title.shadowsummon": "暗影召唤",
        "lottery.title.silverdragonsummon": "白银召唤",
        "lottery.title.lottery_black_solstice_default": "至日召唤",
        "lottery.title.spring": "春日召唤",
        "lottery.title.summon.view.untoldtales": "秘闻",
        "lottery.title.superelementalsummon": "超级元素人召唤",
        "lottery.title.towereventsummon": "高塔召唤",
        "lottery.title.towertroopsummon": "高塔队伍召唤",
        "lottery.title.lottery_season_untold_tales1": "秘闻召唤",
        "lottery.title.untoldtales1": "深海奥秘",
        "lottery.title.lottery_season_untold_tales2": "烈焰与冰霜宝藏",
        "lottery.title.wildernesssummon": "荒野召唤",
        "lottery.title.lottery_hero_lunar_new_year": "春节召唤",
        "lottery.title.lottery_hero_valentines": "情人节召唤",
        "lottery.title.lottery_hero_easter": "复活节召唤",
        "lottery.title.lottery_hero_beach_party": "海滩派对召唤",
        "lottery.title.lottery_hero_kalevala": "卡勒瓦拉召唤",
        "lottery.title.lottery_hero_halloween": "万圣节召唤",
        "lottery.title.seasonalpremiumsummon": "血色召唤",
        "lottery.title.lottery_hero_christmas": "圣诞节召唤",
        "lottery.title.lottery_featured_event_opera": "歌剧之谜召唤",
        "lottery.title.lottery_featured_event_gargoyles2": "石像鬼圣所召唤",
        "lottery.title.lottery_featured_event_beowulf": "贝奥武夫挑战召唤",
        "lottery.title.lottery_featured_event_festival": "挑战节 I 召唤",
        "lottery.title.lottery_featured_event_festival_b": "挑战节 II 召唤",
        "lottery.title.lottery_featured_event_masquerade": "众神狂欢节召唤",
        "lottery.title.lottery_featured_alliance_quest_castle": "骑士冲击召唤",
        "lottery.title.lottery_featured_alliance_quest_musketeers": "英勇火枪手召唤",
        "lottery.title.lottery_featured_alliance_quest_moths": "飞蛾之夜召唤",
        "lottery.title.lottery_tower_ninja_default": "忍者高塔召唤",
        "lottery.title.lottery_tower_owl_default": "猫头鹰高塔召唤",
        "lottery.title.lottery_tower_magic_default": "魔法高塔召唤",
        "lottery.title.lottery_tower_styx_default": "冥河高塔召唤",
        "lottery.title.mimicsummon": "拟态兽召唤",
    },
    "tc": {
        "lottery.title.lottery_black_7th_birthday": "生日召喚",
        "lottery.title.allianceeventsummon": "聯盟任務召喚",
        "lottery.title.ancientdragonsummon": "遠古巨龍召喚",
        "lottery.title.ascensionitemsummon": "升等召喚",
        "lottery.title.ascensionsummon": "即刻力量",
        "lottery.title.astralelvessummon": "星界召喚",
        "lottery.title.lottery_black_default": "黑色星期五召喚",
        "lottery.title.challengeeventsummon": "活動召喚",
        "lottery.title.costumesummon": "服裝召喚",
        "lottery.title.covenantsummon": "聖約召喚",
        "lottery.title.dailysummon": "每日召喚",
        "lottery.title.elementaldragonsummon": "元素巨龍召喚",
        "lottery.title.epicdragonsummon": "傳奇巨龍召喚",
        "lottery.title.epicherosummon": "史詩英雄召喚",
        "lottery.title.epictroopsummon": "史詩部隊召喚",
        "lottery.title.featuredsummon": "元素召喚",
        "lottery.title.goblinsummon": "哥布林召喚",
        "lottery.title.harvestsummon": "豐收召喚",
        "lottery.title.itemsummon": "升等召喚",
        "lottery.title.leaguesummon": "英雄聯盟召喚",
        "lottery.title.legendarytroopsummon": "傳奇部隊召喚",
        "lottery.title.legendssummon": "傳奇召喚",
        "lottery.title.limitbreakitemsummon": "乙太召喚",
        "lottery.title.lottery_updated": "已更新召喚",
        "lottery.title.mercenarywarsummon": "三國召喚",
        "lottery.title.monsterislandsummon": "怪獸島召喚",
        "lottery.title.moths": "聯盟任務召喚",
        "lottery.title.pickupsummon": "獲得召喚",
        "lottery.title.lottery_season_atlantis": "亞特蘭蒂斯召喚",
        "lottery.title.lottery_season_valhalla": "瓦爾哈拉召喚",
        "lottery.title.lottery_season_underwild": "地底荒野召喚",
        "lottery.title.lottery_season_season5": "沙丘召喚",
        "lottery.title.seasonal": "賽季召喚",
        "lottery.title.shadowsummon": "暗影召喚",
        "lottery.title.silverdragonsummon": "白銀召喚",
        "lottery.title.lottery_black_solstice_default": "至日召喚",
        "lottery.title.spring": "春日召喚",
        "lottery.title.summon.view.untoldtales": "隱秘傳說",
        "lottery.title.superelementalsummon": "超級元素召喚",
        "lottery.title.towereventsummon": "高塔召喚",
        "lottery.title.towertroopsummon": "高塔部隊召喚",
        "lottery.title.lottery_season_untold_tales1": "隱秘傳說召喚",
        "lottery.title.untoldtales1": "深淵謎團",
        "lottery.title.lottery_season_untold_tales2": "火焰與冰霜的寶藏",
        "lottery.title.wildernesssummon": "野地召喚",
        "lottery.title.lottery_hero_lunar_new_year": "春節召喚",
        "lottery.title.lottery_hero_valentines": "情人節召喚",
        "lottery.title.lottery_hero_easter": "復活節召喚",
        "lottery.title.lottery_hero_beach_party": "海灘派對召喚",
        "lottery.title.lottery_hero_kalevala": "卡勒瓦拉召喚",
        "lottery.title.lottery_hero_halloween": "萬聖節召喚",
        "lottery.title.seasonalpremiumsummon": "腥紅召喚",
        "lottery.title.lottery_hero_christmas": "聖誕節召喚",
        "lottery.title.lottery_featured_event_opera": "歌劇秘辛召喚",
        "lottery.title.lottery_featured_event_gargoyles2": "石像鬼聖殿召喚",
        "lottery.title.lottery_featured_event_beowulf": "貝武夫的挑戰召唤",
        "lottery.title.lottery_featured_event_festival": "挑戰節 I 召喚",
        "lottery.title.lottery_featured_event_festival_b": "挑戰節 II 召喚",
        "lottery.title.lottery_featured_event_masquerade": "眾神嘉年華召唤",
        "lottery.title.lottery_featured_alliance_quest_castle": "騎士衝突召喚",
        "lottery.title.lottery_featured_alliance_quest_musketeers": "英勇火槍手召唤",
        "lottery.title.lottery_featured_alliance_quest_moths": "飛蛾之夜召喚",
        "lottery.title.lottery_tower_ninja_default": "忍者高塔召喚",
        "lottery.title.lottery_tower_owl_default": "貓頭鷹高塔召喚",
        "lottery.title.lottery_tower_magic_default": "魔法高塔召喚",
        "lottery.title.lottery_tower_styx_default": "冥河高塔召喚",
        "lottery.title.mimicsummon": "模仿怪召喚",
    },
    "en": {
        "lottery.title.lottery_black_7th_birthday": "Birthday Summon",
        "lottery.title.allianceeventsummon": "Alliance Quest Summon",
        "lottery.title.ancientdragonsummon": "Ancient Dragon Summon",
        "lottery.title.ascensionitemsummon": "Ascension Summon",
        "lottery.title.ascensionsummon": "Instant Power",
        "lottery.title.astralelvessummon": "Astral Summon",
        "lottery.title.lottery_black_default": "Black Friday Summon",
        "lottery.title.challengeeventsummon": "Event Summon",
        "lottery.title.costumesummon": "Costume Summon",
        "lottery.title.covenantsummon": "Covenant Summon",
        "lottery.title.dailysummon": "Daily Summon",
        "lottery.title.elementaldragonsummon": "Elemental Dragon Summon",
        "lottery.title.epicdragonsummon": "Legendary Dragon Summon",
        "lottery.title.epicherosummon": "Epic Hero Summon",
        "lottery.title.epictroopsummon": "Epic Troop Summon",
        "lottery.title.featuredsummon": "Elemental Summon",
        "lottery.title.goblinsummon": "Goblin Summon",
        "lottery.title.harvestsummon": "Harvest Summon",
        "lottery.title.itemsummon": "Ascension Summon",
        "lottery.title.leaguesummon": "Hero League Summon",
        "lottery.title.legendarytroopsummon": "Legendary Troop Summon",
        "lottery.title.legendssummon": "Legends Summon",
        "lottery.title.limitbreakitemsummon": "Aether Summon",
        "lottery.title.lottery_updated": "Summon Updated",
        "lottery.title.mercenarywarsummon": "3 Kingdoms Summon",
        "lottery.title.monsterislandsummon": "Monster Island Summon",
        "lottery.title.moths": "Alliance Quest Summon",
        "lottery.title.pickupsummon": "Pick Up Summon",
        "lottery.title.lottery_season_atlantis": "Atlantis Summon",
        "lottery.title.lottery_season_valhalla": "Valhalla Summon",
        "lottery.title.lottery_season_underwild": "Underwild Summon",
        "lottery.title.lottery_season_season5": "Dunes Summon",
        "lottery.title.seasonal": "Seasonal Summon",
        "lottery.title.shadowsummon": "Shadow Summon",
        "lottery.title.silverdragonsummon": "Silver Summon",
        "lottery.title.lottery_black_solstice_default": "Solstice Summon",
        "lottery.title.spring": "Spring Summon",
        "lottery.title.summon.view.untoldtales": "Untold Tales",
        "lottery.title.superelementalsummon": "Super Elemental Summon",
        "lottery.title.towereventsummon": "Tower Summon",
        "lottery.title.towertroopsummon": "Tower Troop Summon",
        "lottery.title.lottery_season_untold_tales1": "Untold Tales Summon",
        "lottery.title.untoldtales1": "Mysteries of the Deep",
        "lottery.title.lottery_season_untold_tales2": "Treasures of Flame and Frost",
        "lottery.title.wildernesssummon": "Wilderness Summon",
        "lottery.title.lottery_hero_lunar_new_year": "Lunar New Year Summon",
        "lottery.title.lottery_hero_valentines": "Valentine's Summon",
        "lottery.title.lottery_hero_easter": "Easter Summon",
        "lottery.title.lottery_hero_beach_party": "Beach Party Summon",
        "lottery.title.lottery_hero_kalevala": "Kalevala Summon",
        "lottery.title.lottery_hero_halloween": "Halloween Summon",
        "lottery.title.seasonalpremiumsummon": "Sanguine Summon",
        "lottery.title.lottery_hero_christmas": "Christmas Summon",
        "lottery.title.lottery_featured_event_opera": "Secrets of the Opera Summon",
        "lottery.title.lottery_featured_event_gargoyles2": "Sanctuary of Gargoyles Summon",
        "lottery.title.lottery_featured_event_beowulf_bulk": "Beowulf's Challenge Summon",
        "lottery.title.lottery_featured_event_festival": "Festival I Summon",
        "lottery.title.lottery_featured_event_festival_b": "Festival II Summon",
        "lottery.title.lottery_featured_event_masquerade": "Carnival of Gods Summon",
        "lottery.title.lottery_featured_alliance_quest_castle": "Clash of Knights Summon",
        "lottery.title.lottery_featured_alliance_quest_musketeers": "Brave Musketeers Summon",
        "lottery.title.lottery_featured_alliance_quest_moths": "Night of the Moth Summon",
        "lottery.title.lottery_tower_ninja_default": "Ninja Tower Summon",
        "lottery.title.lottery_tower_owl_default": "Owl Tower Summon",
        "lottery.title.lottery_tower_magic_default": "Magic Tower Summon",
        "lottery.title.lottery_tower_styx_default": "Styx Tower Summon",
        "lottery.title.mimicsummon": "Mimic Summon",
    }
};
// 将需要从外部文件（如 main.js）调用的函数组织起来，避免污染全局作用域
const LotterySimulator = {
    initialize: initializeLotterySimulator,
    toggle: toggleLotterySimulator,
    handleActivityClick: handleActivityClick,
    renderFeaturedHeroes: renderFeaturedHeroes,
    updateSummonButtons: updateSummonButtons,
    addHeroToFeaturedSlot: addHeroToFeaturedSlot,
};

const summonSound = new Audio('sounds/ui_summon-additional-draws.ogg');

// --- 状态与配置 (State & Config) ---
let lotteryPoolsData = null; // 用于存储处理过的奖池数据
let lotteryTitleDict = {}; // 用于存储当前语言的标题字典
let summonPoolDetails = {}; // 用于存储奖池的详细配置
let bonusTranslations = {};

// --- 初始化与数据处理 ---

/**
 * 初始化抽奖模拟器
 * @param {Array} allPoolsConfig - 来自“全抽奖配置.json”的数据
 * @param {object} summonTypesConfig - 来自“奖池种类.json”的数据
 */
function initializeLotterySimulator(allPoolsConfig, summonTypesConfig) {
    state.showAllSummonHistory = false;
    // ▼▼▼ 预加载动画资源 ▼▼▼
    const assetsToPreload = [
        'sounds/ui_summon-additional-draws.ogg',      // 抽奖音效
        'imgs/lottery/gate/lottery_animation_light.webp', // 核心光效图片
        'imgs/lottery/gate/lottery_animation_bonus.webp'  // 奖励召唤图片
    ];
    preloadAssets(assetsToPreload);
    const soundToggleButton = document.getElementById('toggle-sound-btn');
    const langDict = i18n[state.currentLang] || i18n.cn;

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
            full: (i18n[state.currentLang] || i18n.cn).playMode_full || 'Play Full Animation',
            skip: (i18n[state.currentLang] || i18n.cn).playMode_skip || 'Skip Animation',
            silent: (i18n[state.currentLang] || i18n.cn).playMode_silent || 'Direct to History'
        });

        state.lotteryAnimationMode = getCookie('lotteryAnimationMode') || 'full';

        const updateAnimationButtonUI = () => {
            const modeIndex = modes.indexOf(state.lotteryAnimationMode);
            const titles = getTitles();
            animationToggleButton.textContent = icons[modeIndex];
            animationToggleButton.title = titles[state.lotteryAnimationMode];
        };
        updateAnimationButtonUI(); // 调用函数以设置按钮的初始状态

        animationToggleButton.addEventListener('click', () => {
            let currentIndex = modes.indexOf(state.lotteryAnimationMode);
            currentIndex = (currentIndex + 1) % modes.length; // 循环切换到下一个模式
            state.lotteryAnimationMode = modes[currentIndex]; // 更新全局状态
            setCookie('lotteryAnimationMode', state.lotteryAnimationMode, 365); // 将新模式保存到Cookie
            updateAnimationButtonUI(); // 更新按钮的显示
        });
    }


    lotteryTitleDict = lotteryTitles[state.currentLang] || lotteryTitles.cn;
    bonusTranslations = (i18n[state.currentLang] || i18n.cn).lottery_bonus_translations || {};
    processSummonData(allPoolsConfig, summonTypesConfig);
    renderActivityList();
    loadHistoryFromLocalStorage();
    renderSummonHistory();

    document.getElementById('single-summon-btn')?.addEventListener('click', () => performSummon(1));
    document.getElementById('ten-summon-btn')?.addEventListener('click', () => performSummon(10));
    document.getElementById('thirty-summon-btn')?.addEventListener('click', () => performSummon(30));

    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            const langDict = i18n[state.currentLang];
            if (state.summonHistory.length === 0) return;

            if (state.showAllSummonHistory) {
                if (confirm(langDict.confirmClearHistory || '确定要清空所有召唤历史记录吗？')) {
                    state.summonHistory = [];
                    saveHistoryToLocalStorage();
                    renderSummonHistory();
                }
            } else {
                const currentPoolName = getPoolDisplayName(state.currentSummonData);
                if (confirm(langDict.confirmClearCurrentHistory || `确定要清空【${currentPoolName}】的召唤记录吗？`)) {
                    state.summonHistory = state.summonHistory.filter(group => group.poolName !== currentPoolName);
                    saveHistoryToLocalStorage();
                    renderSummonHistory();
                }
            }
        });
    }

    // ▼▼▼ 为抽奖结果弹窗的关闭按钮和遮罩层添加返回事件监听 ▼▼▼
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
}

/**
 * 将两个JSON文件的数据整合为一个更易于使用的结构
 */
function processSummonData(allPoolsConfig, summonTypesConfig) {
    lotteryPoolsData = {};
    summonPoolDetails = summonTypesConfig.SummonPool;
    state.globalExcludeFamilies = (summonPoolDetails.exclude_for_all || []).map(f => f.toLowerCase());
    state.latestHeroVersionsMap = new Map();
    state.heroesByIdMap = new Map();
    state.allHeroes.forEach(hero => {
        if (hero.english_name) {
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

            lotteryPoolsData[pool.id] = {
                ...pool,
                ...details,
                ...productType,
                bulk10: bulk10 || null,
                bulk30: bulk30 || null,
            };

            if (pool.id === 'lottery_hero_lunar_new_year' || pool.id === 'lottery_hero_valentines' || pool.id === 'lottery_featured_event_festival') {
                lotteryPoolsData[pool.id].featuredHeroNum = 2;
            }
            if (pool.id === 'lottery_season_atlantis') {// || pool.id === 'lottery_hero_halloween') {
                lotteryPoolsData[pool.id].featuredHeroNum = 4;
            }
        }
    });
    state.allSummonPools = lotteryPoolsData;
}

// --- 核心逻辑辅助函数 ---

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
 * 获取奖池的本地化标题
 * @param {object} poolConfig - 奖池配置对象
 * @returns {string} - 显示的标题
 */
function getPoolDisplayName(poolConfig) {
    if (!poolConfig) return '';
    const specialProductTypes = ['BlackSummon', 'EpicHeroSummon', 'ChallengeEventSummon', 'MapSeasonSummon', 'AllianceEventSummon', 'TowerEventSummon'];
    let titleKey = '';
    if (poolConfig.productType && specialProductTypes.includes(poolConfig.productType)) {
        titleKey = `lottery.title.${poolConfig.id.toLowerCase()}`;
    } else if (poolConfig.productType) {
        titleKey = `lottery.title.${poolConfig.productType.toLowerCase()}`;
    }
    if (titleKey && lotteryTitleDict[titleKey]) {
        return lotteryTitleDict[titleKey];
    }
    return poolConfig.id.replace('lottery_', '').replace(/_/g, ' ');
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
    const baseHeroPool = poolConfig.masterPool || state.allHeroes;

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

    let bucketType = 'unknown';
    if (bucketString.startsWith('heroes_event_')) bucketType = 'event';
    else if (bucketString.startsWith('heroes_listed_')) bucketType = 'listed';
    else if (bucketString.startsWith('heroes_ex_s1_')) bucketType = 'ex_s1';
    else if (bucketString.startsWith('heroes_s1_')) bucketType = 's1';
    else if (bucketString.startsWith('heroes_extraAssociatedFamilies_')) bucketType = 'extraAssociatedFamilies';

    if (poolConfig.productType === 'SuperElementalSummon' && bucketType === 'listed') {
        // 对于 SuperElementalSummon 的 listed 桶，直接查找所有英雄的最新版本（包括服装）
        // 并且排除S1英雄
        const eligibleHeroes = state.allHeroes.filter(hero => {
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            const standardHeroColor = colorReverseMap[hero.color];
            const standardSelectedColor = colorReverseMap[state.selectedElementalColor];
            return standardHeroColor === standardSelectedColor &&
                hero.star === star &&
                heroFamily !== 'classic' && // 排除 classic 家族
                !state.globalExcludeFamilies.includes(heroFamily);
        });

        const uniqueLatestHeroes = new Map(); // 使用 Map 存储每个英文名的最新版本英雄
        eligibleHeroes.forEach(hero => {
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
                if (exactHero && exactHero.star === star) {
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
                if (hero.isFeaturedOnly) return;
                const heroFamily = String(hero.family || '').toLowerCase();
                if (hero.star === star && listedFamilies.includes(heroFamily) && !state.globalExcludeFamilies.includes(heroFamily)) {
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
        if (hero.isFeaturedOnly) {
            return;
        }
        const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
        let matches = false;

        const isGloballyExcluded = state.globalExcludeFamilies.includes(heroFamily);
        const isExplicitlyIncluded = explicitlyIncludedFamilies.has(heroFamily);
        if (isGloballyExcluded && isExplicitlyIncluded) {
            // Log for exemption is kept for debugging
        }

        if (hero.star === star && (!isGloballyExcluded || isExplicitlyIncluded)) {
            switch (bucketType) {
                case 's1':
                    matches = (heroFamily === 'classic');
                    break;
                case 'ex_s1':
                    matches = (heroFamily !== 'classic');
                    break;
                case 'event':
                    // 直接使用我们在这函数开头就计算好的、包含了所有明确家族的列表
                    let eventFamilies = Array.from(explicitlyIncludedFamilies);
                    // ▼▼▼ 如果奖池允许训练师，则将'trainer'家族视为活动家族 ▼▼▼
                    if (poolConfig.allowsTrainerCharacter) {
                        eventFamilies.push('trainer');
                    }
                    matches = eventFamilies.includes(heroFamily);

                    if (matches && poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
                        const standardHeroColor = colorReverseMap[hero.color];
                        const standardSelectedColor = colorReverseMap[state.selectedElementalColor];
                        matches = (standardHeroColor === standardSelectedColor);
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

        if (matches) {
            // ▼▼▼ 如果是 "mimic" 或 "trainer" 家族，则直接添加，不进行名称去重 ▼▼▼
            if (heroFamily === 'mimic' || heroFamily === 'trainer') {
                initialPool.push(hero);
                return; // 跳过后续的名称去重逻辑
            }
            const heroName = hero.english_name;
            if (heroName && !processedHeroNames.has(heroName)) {
                processedHeroNames.add(heroName);
                const baseVersion = state.allHeroes.find(h => h.english_name === heroName && h.costume_id === 0);
                if (baseVersion) {
                    initialPool.push(baseVersion);
                }
            }
        }
    });

    return initialPool.map(baseHero => {
        // ▼▼▼ 如果是 "mimic" 或 "trainer" 家族，直接返回本身，不去查找“最新版本” ▼▼▼
        const baseHeroFamily = String(baseHero.family || '').toLowerCase();
        if (baseHeroFamily === 'mimic' || baseHeroFamily === 'trainer') {
            return baseHero;
        }

        if (String(baseHero.family).toLowerCase() === 'classic') {
            return baseHero;
        }
        const latestVersion = state.latestHeroVersionsMap.get(baseHero.english_name);
        return latestVersion || baseHero;
    });
}

/**
 * 获取指定奖池中所有可能抽到的英雄的完整、去重列表
 * @param {object} poolConfig - 奖池配置对象
 * @returns {Array} - 所有可能英雄的对象数组
 */
function getAllHeroesInPool(poolConfig) {
    if (!poolConfig) return [];

    // 根据 latestIncludedHeroAgeInDays 配置预筛选主英雄池
    let masterPoolForBuckets = state.allHeroes;
    // ▼▼▼ 处理 includedOrigins ▼▼▼
    if (poolConfig.includedOrigins && Array.isArray(poolConfig.includedOrigins) && poolConfig.includedOrigins.length > 0) {
        const allowedOrigins = poolConfig.includedOrigins.map(o => o.toLowerCase());
        const originalCount = masterPoolForBuckets.length;
        masterPoolForBuckets = masterPoolForBuckets.filter(hero => {
            if (!hero.source) return false;
            // 使用 sourceReverseMap 将英雄的本地化起源转回英文ID
            const englishOrigin = sourceReverseMap[hero.source];
            return englishOrigin.toLowerCase() && allowedOrigins.includes(englishOrigin.toLowerCase());
        });
    }

    // ▼▼▼ 统一处理两种日期筛选规则 ▼▼▼
    if (poolConfig.latestIncludedHeroDate || poolConfig.latestIncludedHeroAgeInDays > 0) {

        // 步骤 1: 确定基准日期 (baseDate)，即时间窗口的“结束日期”
        let baseDate;
        if (poolConfig.latestIncludedHeroDate) {
            //console.log(`[日志-日期筛选] 使用 latestIncludedHeroDate: ${poolConfig.latestIncludedHeroDate} 作为基准日期。`);
            const parts = poolConfig.latestIncludedHeroDate.split('-');
            if (parts.length === 3) {
                baseDate = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
            }
        } else {
            // 如果没有设置固定日期，则使用今天的日期作为基准
            const now = new Date();
            baseDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        }

        // 步骤 2: 根据基准日期和天数计算“起始日期” (startDate)
        let startDate = null; // 如果为null，则代表没有起始日期限制
        if (poolConfig.latestIncludedHeroAgeInDays > 0) {
            const days = poolConfig.latestIncludedHeroAgeInDays;
            //console.log(`[日志-日期筛选] 使用 latestIncludedHeroAgeInDays: ${days} 天。将从基准日期回溯。`);
            startDate = new Date(baseDate.getTime());
            startDate.setUTCDate(startDate.getUTCDate() - (days - 1)); // -1 是为了包含起始当天
        }

        // 步骤 3: 执行筛选
        masterPoolForBuckets = masterPoolForBuckets.filter(hero => {
            // 保留已有的豁免和排除规则
            const heroFamily = String(hero.family || '').toLowerCase();
            if (heroFamily === 'classic') return true;
            const hotmInfo = summonPoolDetails.hotm;
            if (hotmInfo && heroFamily === String(hotmInfo.family).toLowerCase()) return false;
            if (hero.star !== 5) return true;

            // 解析英雄的发布日期
            const releaseDateStr = hero['Release date'];
            if (!releaseDateStr) return false;
            const heroParts = releaseDateStr.split('-');
            if (heroParts.length !== 3) return false;
            const heroReleaseDate = new Date(Date.UTC(parseInt(heroParts[0], 10), parseInt(heroParts[1], 10) - 1, parseInt(heroParts[2], 10)));

            // 最终判断逻辑：英雄的发布日期必须在 [startDate, baseDate] 这个窗口内
            const isAfterStartDate = startDate ? heroReleaseDate >= startDate : true; // 如果没有起始日期限制，则此条件为真
            const isBeforeBaseDate = heroReleaseDate <= baseDate;

            return isAfterStartDate && isBeforeBaseDate;
        });
    }

    if (poolConfig.productType === 'CostumeSummon') {
        const latestCostumes = new Map();
        state.allHeroes.forEach(hero => {
            if (hero.family === 'classic' && hero.costume_id > 0) {
                const existing = latestCostumes.get(hero.english_name);
                if (!existing || hero.costume_id > existing.costume_id) {
                    latestCostumes.set(hero.english_name, hero);
                }
            }
        });
        return Array.from(latestCostumes.values());
    }

    let allPossibleHeroes = [];
    if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
        const heroesFromFeaturedList = poolConfig.featuredHeroes
            .map(heroId => state.heroesByIdMap.get(heroId))
            .filter(Boolean);
        allPossibleHeroes.push(...heroesFromFeaturedList);
    }

    if (poolConfig.bucketConfig) {
        poolConfig.bucketConfig.forEach(bucketString => {
            if (!bucketString) {
                return;
            }
            // ▼▼▼ 处理 trainer_x 桶，使其显示所有颜色的训练师 ▼▼▼
            if (bucketString.startsWith('trainer')) {
                const starMatch = bucketString.match(/_(\d+)$/);
                if (starMatch) {
                    const star = parseInt(starMatch[1], 10);
                    const colors = [
                        { name: '红', id: 'red' },
                        { name: '蓝', id: 'blue' },
                        { name: '绿', id: 'green' },
                        { name: '黄', id: 'yellow' },
                        { name: '紫', id: 'purple' }
                    ];

                    // 为当前星级创建所有5种颜色的训练师，以供显示
                    colors.forEach((color, index) => {
                        const trainerHero = {
                            name: `${star}* ${color.name}训练师英雄`,
                            star: star,
                            color: color.name,
                            family: 'trainer',
                            source: 'trainer',
                            heroId: `trainer_${star}_${color.id}`,
                            originalIndex: -1 * (2000 + star * 10 + index),
                            displayStats: { power: 300 + star * 50, attack: 100, defense: 100, health: 100 },
                            image: `imgs/hero_icon/trainer_rainbow.webp`
                        };
                        allPossibleHeroes.push(trainerHero);
                    });
                }
            } else if (bucketString === 'featuredHero') {
                const featuredIds = [
                    ...(poolConfig.featuredNonCostumedHeroes || []),
                    poolConfig.advertisedHero
                ].filter(Boolean);
                let featuredHeroes = state.allHeroes.filter(h => featuredIds.includes(h.heroId));
                if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
                    featuredHeroes = featuredHeroes.filter(h => {
                        const standardHeroColor = colorReverseMap[h.color];
                        const standardSelectedColor = colorReverseMap[state.selectedElementalColor];
                        return standardHeroColor === standardSelectedColor;
                    });
                }

            } else {
                const heroesFromBucket = getHeroPoolForBucket(bucketString, { ...poolConfig, masterPool: masterPoolForBuckets });
                allPossibleHeroes.push(...heroesFromBucket);
            }
        });
    }

    if (poolConfig.nonFeaturedLegendaryHeroesAgeInDays > 0) {
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
        const days = poolConfig.nonFeaturedLegendaryHeroesAgeInDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(new Date().getDate() - days);
        const olderHeroes = state.allHeroes.filter(hero => {
            if (!hero['Release date']) {
                return false;
            }
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            const isGloballyExcluded = state.globalExcludeFamilies.includes(heroFamily);
            const isExplicitlyIncluded = explicitlyIncludedFamilies.has(heroFamily);
            const isAllowed = !isGloballyExcluded || isExplicitlyIncluded;
            return hero.star === 5 &&
                hero.costume_id === 0 &&
                new Date(hero['Release date']) < cutoffDate &&
                heroFamily !== 'classic' &&
                !state.globalExcludeFamilies.includes(heroFamily);
        });
        allPossibleHeroes.push(...olderHeroes);
    }

    // ▼▼▼ 新增逻辑：处理 allowsTrainerCharacter ▼▼▼
    if (poolConfig.allowsTrainerCharacter) {
        //console.log(`[日志-训练师] 检测到 allowsTrainerCharacter 规则，正在添加训练师英雄...`);
        const stars = [3, 4]; // 包含3、4星
        const colors = [
            { name: '红', id: 'red' },
            { name: '蓝', id: 'blue' },
            { name: '绿', id: 'green' },
            { name: '黄', id: 'yellow' },
            { name: '紫', id: 'purple' }
        ];

        stars.forEach(star => {
            colors.forEach((color, index) => {
                const trainerHero = {
                    name: `${star}* ${color.name}训练师英雄`,
                    star: star,
                    color: color.name,
                    family: 'trainer',
                    source: 'trainer',
                    heroId: `trainer_${star}_${color.id}`,
                    // 使用负数作为originalIndex以避免与真实英雄冲突
                    originalIndex: -1 * (1000 + star * 10 + index),
                    // 提供一些基础属性以便显示和排序
                    power: 0, attack: 0, defense: 0, health: 0,
                    displayStats: { power: 300 + star * 50, attack: 100, defense: 100, health: 100 },
                    // 为避免图片丢失，统一使用已有的彩虹训练师图片
                    image: `imgs/hero_icon/trainer_rainbow.webp`
                };
                allPossibleHeroes.push(trainerHero);
            });
        });
        //console.log(`[日志-训练师] 已添加 ${stars.length * colors.length} 个训练师英雄。`);
    }

    // --- 修正后的去重逻辑 ---
    // 使用 heroId 作为键来确保每个英雄/服装的独一无二，防止错误地替换掉特定版本
    const finalUniqueHeroes = new Map();
    allPossibleHeroes.forEach(hero => {
        if (hero && hero.heroId) {
            if (!finalUniqueHeroes.has(hero.heroId)) {
                finalUniqueHeroes.set(hero.heroId, hero);
            }
        }
    });
    return Array.from(finalUniqueHeroes.values());
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
            listItem.textContent = displayName;
        } else {
            listItem.textContent = displayName + ' (No Banner)';
        }
        listItem.addEventListener('click', () => handleActivityClick(pool.id));
        listContainer.appendChild(listItem);
    });
}

/**
 * 当用户点击活动列表时，更新所有相关UI并设置状态
 * @param {string} poolId - 被选中的奖池ID
 */
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
                if (target && target.dataset.color) {
                    elementalContainer.removeEventListener('click', handler);
                    elementalModal.classList.add('hidden');
                    elementalOverlay.classList.add('hidden');
                    document.body.classList.remove('modal-open');
                    resolve(target.dataset.color);
                }
            };
            elementalContainer.addEventListener('click', handler);
        });
        state.selectedElementalColor = userChoice;
    }

    const numSlots = poolConfig.featuredHeroNum || 0;
    let heroesForSlots = [];

    if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
        const dynamicKey = `featuredHeroes_${state.selectedElementalColor}`;
        const heroIdList = poolConfig[dynamicKey];
        if (heroIdList && Array.isArray(heroIdList)) {
            heroesForSlots = heroIdList.map(heroId => state.heroesByIdMap.get(heroId) || null);
        }
    } else {
        if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
            heroesForSlots = poolConfig.featuredHeroes.map(heroId => state.heroesByIdMap.get(heroId) || null);
        }
    }

    state.customFeaturedHeroes = heroesForSlots.slice(0, numSlots);
    while (state.customFeaturedHeroes.length < numSlots) {
        state.customFeaturedHeroes.push(null);
    }

    const titleEl = document.getElementById('lottery-pool-title');
    const backgroundEl = document.getElementById('lottery-background-image');
    const portalContainer = document.getElementById('lottery-portal-container');


    if (titleEl) titleEl.textContent = getPoolDisplayName(poolConfig);
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
                w3kButton.title = (i18n[state.currentLang] || i18n.cn).w3kLimitedPoolTitle;
                w3kButton.innerHTML = `<img src="imgs/coins/red_lucky.webp" style="width: 28px; height: 28px;">`;
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
            poolConfig.bucketConfig.forEach((bucketName, index) => {
                const weight = poolConfig.bucketWeights[index];
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

            if (poolConfig.hasMysteryHeroBonusRoll) {
                const hotmInfo = summonPoolDetails.hotm;
                if (hotmInfo && hotmInfo.ChancePerMil) {
                    const percentage = (parseInt(hotmInfo.ChancePerMil, 10) / 10).toFixed(1);
                    const name = bonusTranslations.hotm || 'HOTM';
                    bonusListItems += `<li><span>${name}</span><span>${percentage}%</span></li>`;
                }
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
            const langDict = i18n[state.currentLang];
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
                const noHotmNoticeText = langDict.noHotmAndMysteryBonusNotice || '';
                if (noHotmNoticeText) {
                    // 将“无法获得”的说明追加到 HTML 中
                    specialNoticeHTML += `<p style="font-size: 0.7em; color: var(--md-sys-color-primary); margin: 10px 5px 0 5px; text-align: left;">* ${noHotmNoticeText}</p>`;
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

            // 【核心修正】将图标添加到 .lottery-content-overlay 内部，
            // 而不是 portalContainer，以确保它们在同一个堆叠上下文中。
            const contentOverlay = portalContainer.querySelector('.lottery-content-overlay');
            if (contentOverlay) {
                contentOverlay.appendChild(infoIcon);
            } else {
                portalContainer.appendChild(infoIcon); // Fallback in case structure changes
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
 * 渲染精选英雄卡槽UI
 */
function renderFeaturedHeroes() {
    const leftColumn = document.getElementById('featured-heroes-left');
    const rightColumn = document.getElementById('featured-heroes-right');
    if (!leftColumn || !rightColumn || !state.currentSummonData) return;

    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    const numFeatured = state.currentSummonData.featuredHeroNum || 0;
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
            avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.color)}`;
            avatarContainer.style.width = '100%';
            avatarContainer.style.height = '100%';
            const avatarBackground = document.createElement('div');
            avatarBackground.className = 'hero-avatar-background';
            avatarBackground.style.background = getHeroColorLightGradient(hero.color);
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

        if (i % 2 === 0) {
            leftColumn.appendChild(slot);
        } else {
            rightColumn.appendChild(slot);
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
    if (selectedHero.star !== 5) {
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
        const langDict = i18n[state.currentLang];
        alert(langDict.featuredHeroRequired);
        return;
    }
    if (!poolConfig) {
        return;
    }

    const masterHeroPool = getFilteredMasterPool();
    const isCostumeSummon = poolConfig.productType === 'CostumeSummon';
    let costumePool = [];

    if (isCostumeSummon) {
        const latestCostumes = new Map();
        state.allHeroes.forEach(hero => {
            if (hero.family === 'classic' && hero.costume_id > 0) {
                const existing = latestCostumes.get(hero.english_name);
                if (!existing || hero.costume_id > existing.costume_id) {
                    latestCostumes.set(hero.english_name, hero);
                }
            }
        });
        costumePool = Array.from(latestCostumes.values());
        if (costumePool.length === 0) return;
    }


    const allGroupedResults = [];

    for (let k = 0; k < count; k++) {
        const singlePullResults = [];
        let drawnHero = null;
        let bucketString = 'unknown';

        if (isCostumeSummon) {
            const { bucketWeights, bucketConfig } = poolConfig;
            const bucketIndex = selectWeightedIndex(bucketWeights);
            bucketString = bucketConfig[bucketIndex];
            const starMatch = bucketString.match(/_(\d+)$/);
            const isFeatured = bucketString === 'featuredHero';
            const targetStar = isFeatured ? 5 : (starMatch ? parseInt(starMatch[1], 10) : 0);
            const heroPoolOfStar = costumePool.filter(h => h.star === targetStar);
            if (heroPoolOfStar.length > 0) {
                drawnHero = heroPoolOfStar[Math.floor(Math.random() * heroPoolOfStar.length)];
            }
            bucketString = 'costume';
        } else {
            const { bucketWeights, bucketConfig } = poolConfig;
            const bucketIndex = selectWeightedIndex(bucketWeights);
            bucketString = bucketConfig[bucketIndex];
            if (bucketString && bucketString.startsWith('trainer')) {
                const star = parseInt(bucketString.split('_')[1], 10);
                const colors = ['红', '蓝', '绿', '黄', '紫'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                drawnHero = { name: `${star}* 训练师`, type: 'trainer', star, color: randomColor, image: `imgs/hero_icon/trainer_rainbow.webp`, heroId: `trainer_rainbow` };
            } else if (bucketString === 'featuredHero') {
                const validFeatured = state.customFeaturedHeroes.filter(h => h !== null);
                if (validFeatured.length > 0) {
                    drawnHero = validFeatured[Math.floor(Math.random() * validFeatured.length)];
                } else {
                    const fallbackPool = getHeroPoolForBucket('heroes_s1_3', poolConfig);
                    drawnHero = fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null;
                }
            } else if (bucketString) {
                const heroPool = getHeroPoolForBucket(bucketString, { ...poolConfig, masterPool: masterHeroPool });
                if (heroPool.length > 0) {
                    drawnHero = heroPool[Math.floor(Math.random() * heroPool.length)];
                }
            }
        }

        if (!drawnHero) {
            const fallbackPool = getHeroPoolForBucket('heroes_s1_3', poolConfig);
            if (fallbackPool.length > 0) {
                drawnHero = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                bucketString = 'fallback_s1_3';
            }
        }

        if (drawnHero) {
            singlePullResults.push({ hero: drawnHero, bucket: isCostumeSummon ? 'costume' : (bucketString || 'unknown') });
            const associatedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
            // 检查是否满足触发“额外传奇英雄”的条件
            if (drawnHero.star === 5 && drawnHero.family && associatedFamilies.includes(String(drawnHero.family).toLowerCase()) && poolConfig.bonusLegendaryHeroChancePerMil) {

                // 1. 首先，确定本次奖励的完整候选英雄池
                const isEventOnly = poolConfig.bonusLegendaryHeroPullTriggersOnEventHeroesOnly;
                let baseBonusPool;
                if (isEventOnly) {
                    baseBonusPool = masterHeroPool.filter(h => h.star === 5 && h.family && associatedFamilies.includes(String(h.family).toLowerCase()));
                } else {
                    baseBonusPool = masterHeroPool.filter(h => h.star === 5 && h.family && h.family !== 'classic');
                }

                // 2. 创建一个临时数组，用于记录在本次多重触发中已经获得的奖励英雄
                const awardedBonusHeroesInThisPull = [];

                // 3. 循环检查每一次可能的触发机会
                for (let i = 0; i < (poolConfig.bonusLegendaryHeroPullAmount || 1); i++) {
                    // 检查本次机会是否成功触发
                    if (Math.random() * 1000 < poolConfig.bonusLegendaryHeroChancePerMil) {

                        // 4. 从候选池中，过滤掉“触发英雄”和“已获得的奖励英雄”
                        const availableBonusPool = baseBonusPool.filter(hero => {
                            const isNotTriggerHero = hero.heroId !== drawnHero.heroId;
                            const isNotAlreadyAwarded = !awardedBonusHeroesInThisPull.some(awarded => awarded.heroId === hero.heroId);
                            return isNotTriggerHero && isNotAlreadyAwarded;
                        });

                        // 5. 如果还有可用的、不重复的英雄，则从中抽取一个
                        if (availableBonusPool.length > 0) {
                            const bonusHero = availableBonusPool[Math.floor(Math.random() * availableBonusPool.length)];

                            // 将抽到的英雄添加到结果中
                            singlePullResults.push({ hero: bonusHero, bucket: 'bonusLegendary' });

                            // 同时，将它记录到临时数组中，防止下一次循环抽到重复的
                            awardedBonusHeroesInThisPull.push(bonusHero);
                        }
                        // 如果没有可用的不重复英雄了，则本次触发不产生任何结果。
                    }
                }
            }

            if (poolConfig.hasMysteryHeroBonusRoll) {
                const hotmInfo = summonPoolDetails.hotm;
                if (hotmInfo && Math.random() * 1000 < parseInt(hotmInfo.ChancePerMil, 10)) {
                    const hotmPool = state.allHeroes.filter(h => String(h.family) === String(hotmInfo.family));
                    if (hotmPool.length > 0) {
                        // ▼▼▼ 优先选择 Lottery_Only 的月度英雄 ▼▼▼
                        const latestHotm = hotmPool.sort((a, b) => {
                            const aIsLotteryOnly = !a['Release date'];
                            const bIsLotteryOnly = !b['Release date'];

                            // 规则1: 如果 a 是 Lottery_Only 而 b 不是，a 优先 (视为“更新”)
                            if (aIsLotteryOnly && !bIsLotteryOnly) {
                                return -1;
                            }
                            // 规则2: 如果 b 是 Lottery_Only 而 a 不是，b 优先
                            if (bIsLotteryOnly && !aIsLotteryOnly) {
                                return 1;
                            }

                            // 规则3: 如果两者都是或都不是 Lottery_Only，则按常规日期排序
                            // 为无日期的英雄提供一个极早的默认日期，以确保排序稳定性
                            const dateA = a['Release date'] ? new Date(a['Release date']) : new Date(0);
                            const dateB = b['Release date'] ? new Date(b['Release date']) : new Date(0);
                            return dateB - dateA;
                        })[0];
                        singlePullResults.push({ hero: latestHotm, bucket: 'hotm' });
                    }
                }
                let mysteryInfo = poolConfig.productType === 'LegendsSummon' ? summonPoolDetails.LegendsSummonMysteryHero : summonPoolDetails.MysteryHero;
                if (mysteryInfo && Math.random() * 1000 < parseInt(mysteryInfo.ChancePerMil, 10)) {
                    const mysteryPool = state.allHeroes.filter(h => String(h.family) === String(mysteryInfo.family));
                    if (mysteryPool.length > 0) {
                        // 使用更清晰和健壮的排序逻辑
                        let mysteryHero = mysteryPool.sort((a, b) => {
                            const aHasDate = !!a['Release date'];
                            const bHasDate = !!b['Release date'];

                            // 规则1：如果 a 没有日期但 b 有，a 优先（排在前面）
                            if (!aHasDate && bHasDate) {
                                return -1;
                            }
                            // 规则2：如果 b 没有日期但 a 有，b 优先
                            if (!bHasDate && aHasDate) {
                                return 1;
                            }

                            // 规则3：如果两者都有日期，按日期降序排列（最新的在前面）
                            // 确保日期是可比较的字符串或日期对象
                            return String(b['Release date']).localeCompare(String(a['Release date']));
                        })[0];

                        // 将最终选出的英雄添加到结果中
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
                            const extraBucketIndex = selectWeightedIndex(poolConfig.bucketWeights);
                            const extraBucketString = poolConfig.bucketConfig[extraBucketIndex];
                            let extraHero = null;
                            if (extraBucketString && extraBucketString.startsWith('trainer')) {
                                const star = parseInt(extraBucketString.split('_')[1], 10);
                                extraHero = { name: `${star}* 训练师`, type: 'trainer', star, color: ['红', '蓝', '绿', '黄', '紫'][Math.floor(Math.random() * 5)], image: `imgs/hero_icon/trainer_rainbow.webp`, heroId: `trainer_rainbow` };
                            } else if (extraBucketString === 'featuredHero') {
                                const validFeatured = state.customFeaturedHeroes.filter(h => h !== null);
                                if (validFeatured.length > 0) {
                                    extraHero = validFeatured[Math.floor(Math.random() * validFeatured.length)];
                                } else {
                                    const fallbackPool = getHeroPoolForBucket('heroes_s1_3', poolConfig);
                                    extraHero = fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null;
                                }
                            } else if (extraBucketString) {
                                const heroPool = getHeroPoolForBucket(extraBucketString, { ...poolConfig, masterPool: masterHeroPool }); 
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

    // 步骤 1: 根据当前模式决定后续操作和历史记录更新时机
    if (state.lotteryAnimationMode === 'silent') { // 对应 '⏭️' 模式 (静音/直接进历史)
        updateSummonHistory(allGroupedResults, count); // 立刻更新历史
        return; // 直接结束
    }
    if (state.lotteryAnimationMode === 'skip') { // 对应 '⏩' 模式 (跳过动画)
        updateSummonHistory(allGroupedResults, count);
        // ▼▼▼ 根据结果数量决定调用哪个模态框 ▼▼▼
        if (count === 1) {
            showSinglePullResultsModal(totalSummonedResults);
        } else {
            showSummaryModal(totalSummonedResults);
        }
        return;
    }

    // 步骤 2: 对于 'full' 模式 (播放完整动画)
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
    // 步骤 3: 在动画播放完毕、显示结果弹窗前，才更新历史记录
    updateSummonHistory(allGroupedResults, count);
    // ▼▼▼ 根据结果数量决定调用哪个模态框 ▼▼▼
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
        lightEffect.innerHTML = `<img src="imgs/lottery/gate/lottery_animation_light.webp" class="anim-light-img">`;
        lightEffect.style.filter = `drop-shadow(0 0 15px ${getColorHex(hero.color)})`;

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
                heroAvatarContainer.className = `summon-animation-element anim-hero-art ${getColorGlowClass(hero.color)}`;
                heroAvatarContainer.style.background = getHeroColorLightGradient(hero.color);
                heroImage.onload = null;
                heroImage.src = iconSrc;
                heroImage.onerror = null;
                heroAvatarContainer.appendChild(heroImage);
                playAnimation();
            };
            heroImage.src = avatarSrc;
        } else {
            heroAvatarContainer.className = `summon-animation-element anim-hero-art ${getColorGlowClass(hero.color)}`;
            heroAvatarContainer.style.background = getHeroColorLightGradient(hero.color);
            heroImage.src = hero.image || '';
            heroAvatarContainer.appendChild(heroImage);
            playAnimation();
        }
    });
}


/**
 * 填充结果卡片的数据，并返回HTML字符串
 * @param {object} hero - 抽到的英雄
 * @returns {string} - 卡片的 innerHTML
 */
function populateResultCard(hero) {
    let starsHTML = '';
    for (let i = 0; i < hero.star; i++) {
        starsHTML += '<img src="imgs/other/star.webp">';
    }
    const englishColor = (colorReverseMap[String(hero.color).toLowerCase()] || hero.color || 'default').toLowerCase();
    const heroPortraitSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : (hero.image || '');

    return `
        <div class="card-border">
            <div class="card-background">
                <img class="card-hero-portrait" src="${heroPortraitSrc}">
                <div class="card-bottom-banner">
                    <div class="card-stars">${starsHTML}</div>
                    <div class="card-hero-name">${hero.name.split('(')[0].trim()}</div>
                </div>
                <img class="card-element-icon" src="imgs/colors/${englishColor}.webp" alt="Element">
            </div>
        </div>
    `;
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

    const langDict = i18n[state.currentLang];
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
        card.className = `summary-hero-card ${getColorGlowClass(hero.color)}`;
        card.title = hero.name;

        // 【新增代码】如果是5星英雄，则添加跑马灯效果的CSS类
        if (hero.star === 5) {
            card.classList.add('star-5-marquee');
        }

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.color);

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

        if (hero.star) {
            let starsHTML = '';
            for (let i = 0; i < hero.star; i++) {
                starsHTML += `<img src="imgs/other/star.webp" alt="star">`;
            }
            starsContent = starsHTML;
        }

        const englishColor = (colorReverseMap[String(hero.color).toLowerCase()] || hero.color || 'default').toLowerCase();
        const colorIconHTML = `<img class="summary-color-icon" src="imgs/colors/${englishColor}.webp">`;

        detailsOverlay.innerHTML = `
            ${colorIconHTML}
            <div class="summary-hero-stars star-level-${hero.star}">${starsContent}</div>
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
        if (hero.type !== 'trainer' && hero.originalIndex !== undefined) {
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
        const currentPoolName = getPoolDisplayName(state.currentSummonData);
        state.summonHistory.unshift({
            count: count,
            results: groupedResults.flat(),
            groupedResults: groupedResults,
            poolName: currentPoolName
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
    const langDict = i18n[state.currentLang];
    const currentPoolName = getPoolDisplayName(state.currentSummonData);
    let historyToRender;
    if (state.showAllSummonHistory) {
        historyToRender = state.summonHistory;
        titleElement.textContent = langDict.summonHistoryTitleAll || '全部召唤历史记录';
    } else {
        historyToRender = state.summonHistory.filter(group => group.poolName === currentPoolName);
        const totalPulls = historyToRender.reduce((sum, group) => sum + (group.count || 0), 0);
        titleElement.textContent = langDict.summonHistoryTitleCurrent(currentPoolName, totalPulls);
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
                poolConfig.bucketConfig.forEach((bucketName, index) => {
                    if (poolConfig.bucketWeights[index] > 0) {
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
        header.textContent = group.poolName ? `${group.poolName} - ${summonTypeTitle}` : summonTypeTitle;
        const avatarsContainer = document.createElement('div');
        avatarsContainer.className = 'summon-history-avatars';
        resultsToRender.forEach(result => {
            const hero = result.hero;
            if (!hero) return;
            const avatarContainer = document.createElement('div');
            avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.color)}`;
            avatarContainer.title = hero.name;
            // 【新增代码】如果是5星英雄，则添加跑马灯效果的CSS类
            if (hero.star === 5) {
                avatarContainer.classList.add('star-5-marquee');
            }
            const avatarBackground = document.createElement('div');
            avatarBackground.className = 'hero-avatar-background';
            avatarBackground.style.background = getHeroColorLightGradient(hero.color);
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
            if (hero.type !== 'trainer' && hero.originalIndex !== undefined) {
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
            if (hero.star) {
                const starLabel = document.createElement('div');
                starLabel.className = `history-hero-stars star-level-${hero.star}`;
                starLabel.innerHTML = `${hero.star}⭐`;
                avatarContainer.appendChild(starLabel);
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
 * 从本地存储加载历史记录
 */
function loadHistoryFromLocalStorage() {
    try {
        const historyJSON = localStorage.getItem('summonHistory');
        if (historyJSON) {
            const parsedHistory = JSON.parse(historyJSON);
            if (Array.isArray(parsedHistory)) {
                state.summonHistory = parsedHistory;
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
            const star = hero.star;
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
                    if (primaryHero.star === 5 && primaryHero.family && associatedFamilies.includes(String(primaryHero.family).toLowerCase())) {
                        triggerCount++;
                    }
                }
            });
        }
        eventStats.bonusLegendary = { success: successCount, triggers: triggerCount };
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
    const langDict = i18n[state.currentLang];

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

        const activityList = document.getElementById('lottery-activity-list-container');
        const historyList = document.getElementById('summon-history-list-container');
        if (activityList) activityList.scrollTop = 0;
        if (historyList) historyList.scrollTop = 0;

        if (state.allSummonPools) {
            const firstPoolId = Object.keys(state.allSummonPools)[0];
            if (firstPoolId) {
                handleActivityClick(firstPoolId);
            }
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
    }
}

/**
 * 隐藏概率详情模态框
 */
function closeProbabilityModal() {
    const modal = document.getElementById('probability-modal');
    const overlay = document.getElementById('probability-modal-overlay');
    if (modal && overlay) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
}

/**
 * 显示概率详情模态框
 * @param {string} title - 模态框标题
 * @param {string} intro - 模态框简介
 * @param {Array} probabilities - 包含概率信息的数组
 */
function showProbabilityModal(title, intro, probabilities) {
    const modal = document.getElementById('probability-modal');
    const overlay = document.getElementById('probability-modal-overlay');
    const content = document.getElementById('probability-modal-content');
    if (!modal || !overlay || !content) return;

    let listItems = '';
    probabilities.forEach(item => {
        listItems += `<li><span>${item.name}</span><span>${item.percentage}</span></li>`;
    });

    content.innerHTML = `
        <h3>${title}</h3>
        <p>${intro}</p>
        <ul>
            ${listItems}
        </ul>
        <div class="modal-footer">
            <button class="close-bottom-btn" id="close-probability-modal-btn">${i18n[state.currentLang].detailsCloseBtn}</button>
        </div>
    `;

    document.getElementById('close-probability-modal-btn')?.addEventListener('click', closeProbabilityModal);
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
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

    const langDict = i18n[state.currentLang];
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
        card.className = `summary-hero-card ${getColorGlowClass(hero.color)}`;
        card.title = hero.name;

        if (hero.star === 5) {
            card.classList.add('star-5-marquee');
        }

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.color);

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

        if (hero.star) {
            let starsHTML = '';
            for (let i = 0; i < hero.star; i++) {
                starsHTML += `<img src="imgs/other/star.webp" alt="star">`;
            }
            starsContent = starsHTML;
        }
        const englishColor = (colorReverseMap[String(hero.color).toLowerCase()] || hero.color || 'default').toLowerCase();
        const colorIconHTML = `<img class="summary-color-icon" src="imgs/colors/${englishColor}.webp">`;

        detailsOverlay.innerHTML = `
            ${colorIconHTML}
            <div class="summary-hero-stars star-level-${hero.star}">${starsContent}</div>
        `;

        card.appendChild(avatar);
        card.appendChild(detailsOverlay);

        if (bonusBuckets.includes(result.bucket)) {
            const exLabel = document.createElement('div');
            exLabel.className = 'summary-ex-label';
            exLabel.textContent = 'Ex';
            card.appendChild(exLabel);
        }

        if (hero.type !== 'trainer' && hero.originalIndex !== undefined) {
            const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
            if (targetHero) {
                card.classList.add('is-clickable');
                card.addEventListener('click', () => openDetailsModal(targetHero));
            }
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