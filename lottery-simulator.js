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


// --- 状态与配置 (State & Config) ---
let lotteryPoolsData = null; // 用于存储处理过的奖池数据
let lotteryTitleDict = {}; // 用于存储当前语言的标题字典

// --- 初始化与数据处理 ---

/**
 * 初始化抽奖模拟器
 * @param {Array} allPoolsConfig - 来自“全抽奖配置.json”的数据
 * @param {object} summonTypesConfig - 来自“奖池种类.json”的数据
 */
function initializeLotterySimulator(allPoolsConfig, summonTypesConfig) {
    // 1. 根据当前语言，从全局变量中设置正确的标题字典
    lotteryTitleDict = lotteryTitles[state.currentLang] || lotteryTitles.cn;

    // 2. 处理和整合奖池数据
    processSummonData(allPoolsConfig, summonTypesConfig);

    // 3. 渲染左侧的活动列表
    renderActivityList();

    // 4. 加载本地存储的抽奖历史
    loadHistoryFromLocalStorage();
    renderSummonHistory();

    // 5. 为召唤按钮绑定事件
    document.getElementById('single-summon-btn')?.addEventListener('click', () => performSummon(1));
    document.getElementById('ten-summon-btn')?.addEventListener('click', () => performSummon(10));
    document.getElementById('thirty-summon-btn')?.addEventListener('click', () => performSummon(30));

    // 为新的“清空记录”按钮添加事件监听器
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            // 使用 confirm 弹窗让用户确认
            if (state.summonHistory.length > 0 && confirm(i18n[state.currentLang].confirmClearHistory || '确定要清空所有召唤历史记录吗？')) {
                state.summonHistory = []; // 清空历史记录数组
                saveHistoryToLocalStorage(); // 更新本地存储
                renderSummonHistory(); // 重新渲染，显示“没有历史”
            }
        });
    }

    // ▼▼▼ 添加移动端分页切换逻辑 ▼▼▼
    const tabs = document.querySelectorAll('.lottery-mobile-tabs .tab-button');
    const panels = document.querySelectorAll('.lottery-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 如果点击的已经是激活的标签，则不执行任何操作
            if (tab.classList.contains('active')) {
                return;
            }

            // 移除所有标签的激活状态
            tabs.forEach(t => t.classList.remove('active'));
            // 为被点击的标签添加激活状态
            tab.classList.add('active');

            const targetId = tab.dataset.tabTarget;

            // 隐藏所有面板
            panels.forEach(panel => {
                panel.classList.remove('active');
            });

            // 显示目标面板
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
    const summonPoolDetails = summonTypesConfig.SummonPool;

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

            if (pool.id === 'lottery_season_atlantis') {
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
 * 根据 bucket 字符串和奖池配置，构建一个临时的英雄池
 * @param {string} bucketString - 例如 "heroes_event_3"
 * @param {object} poolConfig - 当前的奖池配置
 * @returns {Array} - 符合条件的英雄对象数组
 */
function getHeroPoolForBucket(bucketString, poolConfig) {
    const parts = bucketString.split('_');
    let condition = parts[1];
    let star = parseInt(parts.pop(), 10);

    if (poolConfig.productType === 'CostumeSummon') {
        const classicHeroes = state.allHeroes.filter(h => h.family === 'classic');
        const latestVersions = {};
        classicHeroes.forEach(hero => {
            if (hero.english_name && (!latestVersions[hero.english_name] || hero.costume_id > latestVersions[hero.english_name].costume_id)) {
                latestVersions[hero.english_name] = hero;
            }
        });
        const latestCostumeHeroes = Object.values(latestVersions).filter(hero => {
            return hero.costume_id > 0 && hero.star === star;
        });
        return latestCostumeHeroes.filter(hero => {
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            return !state.globalExcludeFamilies.includes(heroFamily);
        });
    }

    const initialPool = state.allHeroes.filter(hero => {
        const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
        if (state.globalExcludeFamilies && state.globalExcludeFamilies.includes(heroFamily)) {
            return false;
        }
        if (hero.costume_id !== 0) return false;
        if (hero.star !== star) return false;

        switch (condition) {
            case 'ex': return heroFamily !== 'classic';
            case 's1': return heroFamily === 'classic';
            case 'event':
                const families = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
                return families.includes(heroFamily);
            case 'listed':
                const listedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
                const includedIds = poolConfig.includedHeroes || [];
                return listedFamilies.includes(heroFamily) || includedIds.includes(hero.heroId);
            case 'extraAssociatedFamilies':
                const extraFamilies = (poolConfig.extraAssociatedFamilies || []).map(f => String(f).toLowerCase());
                return extraFamilies.includes(heroFamily);
            default: return false;
        }
    });

    const finalPool = initialPool.map(baseHero => {
        if (baseHero.family === 'classic') {
            return baseHero;
        }
        const latestVersion = state.latestHeroVersionsMap.get(baseHero.english_name);
        if (latestVersion && latestVersion.costume_id > 0) {
            return latestVersion;
        } else {
            return baseHero;
        }
    });

    return finalPool;
}

/**
 * 获取指定奖池中所有可能抽到的英雄的完整、去重列表
 * @param {object} poolConfig - 奖池配置对象
 * @returns {Array} - 所有可能英雄的对象数组
 */
function getAllHeroesInPool(poolConfig) {
    if (!poolConfig) return [];
    let allPossibleHeroes = [];

    if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
        const heroesFromFeaturedList = poolConfig.featuredHeroes
            .map(heroId => state.heroesByIdMap.get(heroId))
            .filter(Boolean);
        allPossibleHeroes.push(...heroesFromFeaturedList);
    }

    if (poolConfig.bucketConfig) {
        poolConfig.bucketConfig.forEach(bucketString => {
            if (!bucketString || bucketString.startsWith('trainer')) {
                return;
            }
            if (bucketString === 'featuredHero') {
                const featuredIds = [
                    ...(poolConfig.featuredNonCostumedHeroes || []),
                    poolConfig.advertisedHero
                ].filter(Boolean);
                const featuredHeroes = state.allHeroes.filter(h => featuredIds.includes(h.heroId));
                allPossibleHeroes.push(...featuredHeroes);
            } else {
                const heroesFromBucket = getHeroPoolForBucket(bucketString, poolConfig);
                allPossibleHeroes.push(...heroesFromBucket);
            }
        });
    }

    const finalLatestVersions = {};
    allPossibleHeroes.forEach(hero => {
        if (hero && hero.english_name) {
            if (!finalLatestVersions[hero.english_name] || hero.costume_id > finalLatestVersions[hero.english_name].costume_id) {
                finalLatestVersions[hero.english_name] = hero;
            }
        }
    });

    return Object.values(finalLatestVersions);
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
 * 当用户点击活动列表时，更新所有相关UI并设置状态 (最终修正版)
 * @param {string} poolId - 被选中的奖池ID
 */
function handleActivityClick(poolId) {
    // 1. 更新左侧列表的激活状态样式
    document.querySelectorAll('#lottery-activity-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.poolId === poolId);
    });

    // 2. 获取完整的奖池配置
    const poolConfig = state.allSummonPools?.[poolId];
    if (!poolConfig) return;

    // 3. 更新当前奖池状态
    state.currentSummonData = poolConfig;

    // 4. 根据配置自动填充或清空精选英雄位
    if (poolConfig.featuredHeroes && poolConfig.featuredHeroes.length > 0) {
        state.customFeaturedHeroes = poolConfig.featuredHeroes.map(heroId =>
            state.heroesByIdMap.get(heroId) || null
        );
        const numSlots = poolConfig.featuredHeroNum || state.customFeaturedHeroes.length;
        if (state.customFeaturedHeroes.length < numSlots) {
            state.customFeaturedHeroes.length = numSlots;
            state.customFeaturedHeroes.fill(null, poolConfig.featuredHeroes.length);
        }
    } else {
        state.customFeaturedHeroes = Array(poolConfig.featuredHeroNum || 0).fill(null);
    }

    // 5. 更新召唤界面的核心UI元素 (这部分不变)
    const titleEl = document.getElementById('lottery-pool-title');
    const backgroundEl = document.getElementById('lottery-background-image');
    const portalContainer = document.getElementById('lottery-portal-container');

    if (titleEl) titleEl.textContent = getPoolDisplayName(poolConfig);
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
            infoIcon.style.position = 'absolute'; /* 修正：添加绝对定位 */
            infoIcon.style.top = '10px'; /* 修正：定位到顶部 */
            infoIcon.style.left = '10px'; /* 修正：定位到右侧 */
            infoIcon.title = i18n[state.currentLang].probabilityInfoTitle || '查看概率详情';

            // ▼▼▼【核心修改】生成 tooltip HTML 并附加到图标上 ▼▼▼
            const translations = i18n[state.currentLang].lottery_bucket_translations || {};
            let listItems = '';
            poolConfig.bucketConfig.forEach((bucketName, index) => {
                const weight = poolConfig.bucketWeights[index];
                if (weight > 0) {
                    const percentage = (weight / 10).toFixed(1);
                    const translatedName = translations[bucketName] || bucketName;
                    listItems += `<li><span>${translatedName}</span><span>${percentage}%</span></li>`;
                }
            });

            const tooltipHTML = `
                <div class="probability-tooltip">
                    <h4>${i18n[state.currentLang].probabilityInfoTitle || '概率详情'}</h4>
                    <p>${i18n[state.currentLang].probabilityInfoIntro || '以下是当前卡池的召唤概率:'}</p>
                    <ul>
                        ${listItems}
                    </ul>
                </div>
            `;
            infoIcon.innerHTML += tooltipHTML;
            // ▲▲▲【核心修改结束】▲▲▲

            portalContainer.appendChild(infoIcon);
        }
    }

    // 6. 获取当前奖池的所有英雄，并将其设置为临时的“活动子集”
    state.activeHeroSubset = getAllHeroesInPool(poolConfig);

    // 7. 将默认排序设置为“按发布日期降序”
    state.currentSort = { key: 'Release date', direction: 'desc' };

    // 8. 调用全局的筛选和渲染函数，而不是直接渲染表格
    applyFiltersAndRender();

    // 9. 渲染精选英雄卡槽UI和更新召唤按钮
    LotterySimulator.renderFeaturedHeroes();
    LotterySimulator.updateSummonButtons();
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
    if (state.customFeaturedHeroes.length !== numFeatured) {
        state.customFeaturedHeroes = Array(numFeatured).fill(null);
    }

    for (let i = 0; i < numFeatured; i++) {
        const slot = document.createElement('div');
        slot.className = 'featured-hero-slot';
        slot.dataset.slotIndex = i;
        const hero = state.customFeaturedHeroes[i] || null;
        if (hero) {
            // 使用新的HTML结构来添加背景色和辉光
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
        // 改为双击移除
        slot.addEventListener('dblclick', () => {
            if (state.customFeaturedHeroes[i]) {
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
        alert(i18n[state.currentLang].featuredSlotsFull || '所有精选英雄卡槽已满。');
    }
}

/**
 * 从精选卡槽中移除英雄（由长按触发）
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

// lottery-simulator.js

async function performSummon(count) {
    const poolConfig = state.currentSummonData;
    if (!poolConfig) return;

    const summonedResults = [];
    // ... (这部分抽奖逻辑保持不变) ...
    for (let i = 0; i < count; i++) {
        const { bucketWeights, bucketConfig } = poolConfig;
        const bucketIndex = selectWeightedIndex(bucketWeights);
        const bucketString = bucketConfig[bucketIndex];
        let drawnHero = null;
        let sourceBucket = bucketString || 'unknown';

        if (bucketString && bucketString.startsWith('trainer')) {
            const star = parseInt(bucketString.split('_')[1], 10);

            // 1. 定义一个颜色数组
            const colors = ['红', '蓝', '绿', '黄', '紫'];
            // 2. 从数组中随机选择一个颜色
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // 3. 创建训练师对象时，使用这个随机颜色
            drawnHero = {
                name: `${star}* 训练师`,
                type: 'trainer',
                star,
                color: randomColor, // 使用随机颜色
                image: `imgs/hero_icon/trainer_rainbow.webp`,
                heroId: `trainer_rainbow`
            };
        } else if (bucketString === 'featuredHero') {
            const validFeatured = state.customFeaturedHeroes.filter(h => h !== null);
            if (validFeatured.length > 0) {
                drawnHero = validFeatured[Math.floor(Math.random() * validFeatured.length)];
            } else {
                const fallbackPool = getHeroPoolForBucket('heroes_s1_3', poolConfig);
                drawnHero = fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null;
                sourceBucket = 'featuredHero (保底)';
            }
        } else if (bucketString) {
            const heroPool = getHeroPoolForBucket(bucketString, poolConfig);
            if (heroPool.length > 0) {
                drawnHero = heroPool[Math.floor(Math.random() * heroPool.length)];
            }
        }

        if (drawnHero) {
            summonedResults.push({ hero: drawnHero, bucket: sourceBucket });
        }
    }

    if (summonedResults.length === 0) return;

    // 1. 获取所有需要的元素
    const titleElement = document.getElementById('lottery-pool-title');
    const portalContainer = document.getElementById('lottery-portal-container'); // 用于水平居中的参照
    const blockerOverlay = document.getElementById('animation-blocker-overlay');
    const buttonParentContainer = document.getElementById('lottery-simulator-wrapper');
    const animationViewport = document.getElementById('lottery-hero-display-area');

    if (!titleElement || !portalContainer || !animationViewport || !blockerOverlay || !buttonParentContainer) return;

    // 2. 显示交互遮罩层
    blockerOverlay.classList.remove('hidden');

    // 3. 创建按钮
    const skipButton = document.createElement('button');
    skipButton.id = 'skip-animation-btn';
    skipButton.textContent = i18n[state.currentLang].skipAnimation || '跳过动画';
    skipButton.className = 'action-button';

    // 4. **新的、更稳定的定位算法**
    const parentRect = buttonParentContainer.getBoundingClientRect();
    const titleRect = titleElement.getBoundingClientRect();
    const portalRect = portalContainer.getBoundingClientRect();

    // 垂直位置: 永远在标题下方 15 像素的位置
    const targetTop = titleRect.bottom + 15;
    // 水平位置: 永远在召唤主区域的水平中心
    const targetLeft = portalRect.left + (portalRect.width / 2);

    // 5. 应用计算出的样式
    skipButton.style.position = 'absolute';
    skipButton.style.top = `${targetTop - parentRect.top}px`;
    skipButton.style.left = `${targetLeft - parentRect.left}px`;
    // 仅使用 translateX(-50%) 来实现完美的水平居中
    skipButton.style.transform = 'translateX(-50%)';

    // 6. 附加按钮并设置事件
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

    // 7. 循环播放动画
    for (const result of summonedResults) {
        if (skip) break;
        await showSingleSummonAnimation(result.hero, animationViewport);
    }

    // 8. 动画结束后清理
    blockerOverlay.classList.add('hidden');
    if (buttonParentContainer.contains(skipButton)) {
        buttonParentContainer.removeChild(skipButton);
    }
    showSummaryModal(summonedResults);

    document.getElementById('summary-close-btn').onclick = () => {
        document.getElementById('summon-summary-modal').classList.add('hidden');
        document.getElementById('summon-summary-modal-overlay').classList.add('hidden');
        updateSummonHistory(summonedResults, count);
    };
}

/**
 * 在指定容器内播放使用特效图片的动画 (v6 - 特效图片版)
 * @param {object} hero - 抽到的英雄
 * @param {HTMLElement} animationViewport - 动画播放的容器
 * @returns {Promise}
 */
function showSingleSummonAnimation(hero, animationViewport) {
    return new Promise(resolve => {
        animationViewport.innerHTML = ''; // 清空上一轮的动画元素

        // 1. 创建英雄头像 (将先出现)
        const heroAvatarContainer = document.createElement('div');
        heroAvatarContainer.className = `summon-animation-element anim-hero-art ${getColorGlowClass(hero.color)}`;
        heroAvatarContainer.style.background = getHeroColorLightGradient(hero.color);
        heroAvatarContainer.style.maxWidth = '100px'; /* 设置最大宽度 */
        heroAvatarContainer.style.maxHeight = '100px'; /* 设置最大高度 */
        const heroAvatarSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : (hero.image || '');
        heroAvatarContainer.innerHTML = `<img src="${heroAvatarSrc}" style="width: 100%; height: 100%; object-fit: contain;">`;


        // 2. 创建光效图片
        const lightEffect = document.createElement('div');
        lightEffect.className = 'summon-animation-element';
        lightEffect.innerHTML = `<img src="imgs/lottery/gate/lottery_animation_light.webp" class="anim-light-img">`;
        // 使用 CSS filter 给光效图片上色
        lightEffect.style.filter = `drop-shadow(0 0 15px ${getColorHex(hero.color)})`;

        // 按顺序添加到容器中
        animationViewport.appendChild(lightEffect);
        animationViewport.appendChild(heroAvatarContainer);

        // 动画持续1.2秒后自动结束
        setTimeout(() => {
            animationViewport.innerHTML = ''; // 清空动画容器
            resolve(); // 动画结束
        }, 1200);
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
 * 显示包含所有抽奖结果的总结弹窗 (v5 - 卡片式、可换行)
 * @param {Array} results - 包含所有抽奖结果的数组
 */
function showSummaryModal(results) {
    const overlay = document.getElementById('summon-summary-modal-overlay');
    const summaryModal = document.getElementById('summon-summary-modal');
    const scrollContainer = document.getElementById('summon-summary-scroll-container');

    if (!overlay || !summaryModal || !scrollContainer) {
        console.error('显示总结弹窗失败：缺少必要的HTML元素。');
        return;
    }

    scrollContainer.innerHTML = '';
    results.forEach(result => {
        const hero = result.hero;

        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.color)}`;
        card.title = hero.name;

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        // 修正：直接设置背景渐变
        avatar.style.background = getHeroColorLightGradient(hero.color);

        // 新增：创建英雄头像图片元素
        const heroAvatarSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        avatarImage.src = heroAvatarSrc;
        avatarImage.alt = hero.name;

        // 将图片添加到头像容器
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-details-overlay';

        let starsHTML = '';
        for (let i = 0; i < hero.star; i++) {
            starsHTML += `<img src="imgs/other/star.webp" alt="star">`;
        }

        const englishColor = (colorReverseMap[String(hero.color).toLowerCase()] || hero.color || 'default').toLowerCase();
        const colorIconHTML = `<img class="summary-color-icon" src="imgs/colors/${englishColor}.webp">`;

        detailsOverlay.innerHTML = `
            ${colorIconHTML}
            <div class="summary-hero-stars">${starsHTML}</div>
        `;

        card.appendChild(avatar);
        card.appendChild(detailsOverlay);
        scrollContainer.appendChild(card);
    });

    summaryModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

/**
 * 更新并渲染抽奖历史记录
 * @param {Array} results - 本次抽奖的结果数组
 * @param {number} count - 抽奖次数 (1, 10, 30)
 */
function updateSummonHistory(results, count) {
    if (results.length > 0) {
        // 1. 获取当前卡池的显示名称
        const currentPoolName = getPoolDisplayName(state.currentSummonData);

        // 2. 将卡池名称和召唤结果一起存入历史记录
        state.summonHistory.unshift({
            count: count,
            heroes: results.map(r => r.hero),
            poolName: currentPoolName // 保存卡池名称
        });

        if (state.summonHistory.length > 50) {
            state.summonHistory.pop();
        }
        saveHistoryToLocalStorage();
    }
    renderSummonHistory();
}

/**
 * 渲染完整的抽奖历史记录
 */
function renderSummonHistory() {
    const historyContainer = document.getElementById('summon-history-list');
    if (!historyContainer) return;
    historyContainer.innerHTML = '';
    if (!state.summonHistory || state.summonHistory.length === 0) {
        historyContainer.innerHTML = `<div class="feature-incomplete-message">${i18n[state.currentLang].noSummonHistory || '没有召唤历史'}</div>`;
        return;
    }

    state.summonHistory.forEach(group => {
        let heroesToRender = [];
        let summonCount = 0;
        let poolName = ''; // 新增：用于存储卡池名称的变量

        if (Array.isArray(group)) { // 兼容旧格式
            heroesToRender = group;
            summonCount = group.length;
        } else if (group && group.heroes) { // 使用新格式
            heroesToRender = group.heroes;
            summonCount = group.count;
            poolName = group.poolName || ''; // 从记录中获取卡池名称
        }

        if (heroesToRender.length === 0) return;

        const groupContainer = document.createElement('div');
        groupContainer.className = 'summon-history-group';
        const header = document.createElement('h5');

        // 2. 组合新的标题
        const summonTypeTitle = `${i18n[state.currentLang].summonOnce || '召唤'} x${summonCount}`;
        // 如果记录中有卡池名称，就显示它；否则只显示召唤数量
        header.textContent = poolName ? `${poolName} - ${summonTypeTitle}` : summonTypeTitle;

        const avatarsContainer = document.createElement('div');
        avatarsContainer.className = 'summon-history-avatars';
        heroesToRender.forEach(hero => {
            if (!hero) return;
            // 为每个头像创建新的HTML结构
            const avatarContainer = document.createElement('div');
            avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.color)}`;
            avatarContainer.title = hero.name;

            const avatarBackground = document.createElement('div');
            avatarBackground.className = 'hero-avatar-background';
            avatarBackground.style.background = getHeroColorLightGradient(hero.color);
            avatarContainer.appendChild(avatarBackground);

            const avatar = document.createElement('img');
            avatar.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
            avatar.className = 'hero-avatar-image';
            avatar.alt = hero.name;
            avatarContainer.appendChild(avatar);

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
        console.error("无法保存抽奖历史:", e);
    }
}

/**
 * 从本地存储加载历史记录
 */
function loadHistoryFromLocalStorage() {
    try {
        const historyJSON = localStorage.getItem('summonHistory');
        state.summonHistory = historyJSON ? JSON.parse(historyJSON) : [];
    } catch (e) {
        console.error("无法加载抽奖历史:", e);
        state.summonHistory = [];
    }
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