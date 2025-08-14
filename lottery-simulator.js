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

const summonSound = new Audio('sounds/ui_summon-additional-draws.ogg');

// --- 状态与配置 (State & Config) ---
let lotteryPoolsData = null; // 用于存储处理过的奖池数据
let lotteryTitleDict = {}; // 用于存储当前语言的标题字典
let summonPoolDetails = {}; // 新增：用于存储奖池的详细配置
let bonusTranslations = {};
// --- 初始化与数据处理 ---

/**
 * 初始化抽奖模拟器
 * @param {Array} allPoolsConfig - 来自“全抽奖配置.json”的数据
 * @param {object} summonTypesConfig - 来自“奖池种类.json”的数据
 */
function initializeLotterySimulator(allPoolsConfig, summonTypesConfig) {
    const soundToggleButton = document.getElementById('toggle-sound-btn');
    const langDict = i18n[state.currentLang] || i18n.cn;

    if (soundToggleButton) {
        // 【读取Cookie】从Cookie加载用户设置，如果不存在，则默认为 true (开启音效)
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

        // 根据读取到的Cookie初始化按钮的显示状态
        updateSoundButtonUI();

        // 为按钮添加点击事件监听
        soundToggleButton.addEventListener('click', () => {
            // 切换音效状态
            state.soundEnabled = !state.soundEnabled;
            // 【保存Cookie】将新的设置保存到Cookie，有效期一年
            setCookie('lotterySoundEnabled', state.soundEnabled, 365);
            // 更新按钮的显示
            updateSoundButtonUI();
        });
    }


    // 1. 根据当前语言，从全局变量中设置正确的标题字典
    lotteryTitleDict = lotteryTitles[state.currentLang] || lotteryTitles.cn;
    bonusTranslations = (i18n[state.currentLang] || i18n.cn).lottery_bonus_translations || {};

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

    // 6. 为移动端分页标签添加事件
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

            if (pool.id === 'lottery_hero_lunar_new_year' || pool.id === 'lottery_hero_valentines') {
                lotteryPoolsData[pool.id].featuredHeroNum = 2;
            }

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
 * 获取当前活动的主卡池，并根据活动类型应用所有特殊规则。
 * @returns {Array} 经过筛选后的英雄对象数组。
 */
function getFilteredMasterPool() {
    const poolConfig = state.currentSummonData;
    if (!poolConfig) return [];

    // 第1步: 获取完整的、未经筛选的原始卡池
    let masterHeroPool = getAllHeroesInPool(poolConfig);

    // 第2步: 根据活动类型，应用不同的筛选规则
    switch (poolConfig.productType) {

        case 'SuperElementalSummon':
            // 应用“元素人活动”的强制180天排除规则
            const associatedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
            const cutoffDate = new Date();
            cutoffDate.setHours(0, 0, 0, 0);
            cutoffDate.setDate(cutoffDate.getDate() - 180);

            masterHeroPool = masterHeroPool.filter(hero => {
                const heroFamily = String(hero.family || '').toLowerCase();
                if (associatedFamilies.includes(heroFamily)) {
                    return true; // 规则1：关联家族不受影响
                }
                const releaseDateStr = hero['Release date'];
                if (!releaseDateStr) {
                    return true; // 保留无日期英雄
                }
                const parts = releaseDateStr.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    const releaseDate = new Date(year, month, day);
                    return releaseDate < cutoffDate; // 规则2：其他英雄检查日期
                }
                return true;
            });
            break;

        // 【未来扩展】您可以轻松地在这里为其他活动添加开关规则
        // case 'BlackSummon':
        // case 'HarvestSummon':
        //     const excludeToggle = document.getElementById('exclude-recent-heroes-toggle');
        //     if (excludeToggle && excludeToggle.checked) {
        //         // 在此应用这些活动的筛选逻辑...
        //     }
        //     break;
    }

    // 第3步: 返回经过处理的最终卡池
    return masterHeroPool;
}


/**
 * 根据 bucket 字符串和奖池配置，构建一个临时的英雄池 (重构解析逻辑的最终修正版)
 * @param {string} bucketString - 例如 "heroes_ex_s1_3"
 * @param {object} poolConfig - 当前的奖池配置
 * @returns {Array} - 符合条件的英雄对象数组
 */
function getHeroPoolForBucket(bucketString, poolConfig) {
    // 如果 poolConfig 中传入了 masterPool，则使用它作为基础；否则，使用全局的 state.allHeroes
    const baseHeroPool = poolConfig.masterPool || state.allHeroes;

    // 更稳定地从字符串末尾解析星级
    const starMatch = bucketString.match(/_(\d+)$/);
    if (!starMatch) return [];
    const star = parseInt(starMatch[1], 10);

    // 更准确地识别 bucket 类型
    let bucketType = 'unknown';
    if (bucketString.startsWith('heroes_event_')) bucketType = 'event';
    else if (bucketString.startsWith('heroes_listed_')) bucketType = 'listed';
    else if (bucketString.startsWith('heroes_ex_s1_')) bucketType = 'ex_s1';
    else if (bucketString.startsWith('heroes_s1_')) bucketType = 's1';
    else if (bucketString.startsWith('heroes_extraAssociatedFamilies_')) bucketType = 'extraAssociatedFamilies';


    // 特殊处理逻辑：SuperElementalSummon 中的 "listed" 类型
    if (poolConfig.productType === 'SuperElementalSummon' && bucketType === 'listed') {
        return state.allHeroes.filter(hero => {
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            // ▼▼▼ 使用 colorReverseMap 来统一比较标准 ▼▼▼
            const standardHeroColor = colorReverseMap[hero.color];
            const standardSelectedColor = colorReverseMap[state.selectedElementalColor];

            return standardHeroColor === standardSelectedColor &&
                hero.star === star &&
                hero.costume_id === 0 &&
                !state.globalExcludeFamilies.includes(heroFamily);
        });
    }

    // --- 标准过滤逻辑 ---
    const processedHeroNames = new Set();
    const initialPool = [];

    baseHeroPool.forEach(hero => {
        if (hero.isFeaturedOnly) {
            return false;
        }
        // 步骤 1: 检查当前英雄（无论是服装还是基础版）是否符合卡池的基本条件
        const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
        let matches = false;

        if (hero.star === star && !state.globalExcludeFamilies.includes(heroFamily)) {
            switch (bucketType) {
                case 's1':
                    matches = (heroFamily === 'classic');
                    break;
                case 'ex_s1':
                    matches = (heroFamily !== 'classic');
                    break;
                case 'event':
                    const eventFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
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

        // 步骤 2: 如果符合条件，则查找其基础版并放入最终卡池
        if (matches) {
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

    // 为非经典英雄应用“最新皮肤”逻辑
    return initialPool.map(baseHero => {
        if (String(baseHero.family).toLowerCase() === 'classic') {
            return baseHero;
        }
        const latestVersion = state.latestHeroVersionsMap.get(baseHero.english_name);
        return latestVersion || baseHero;
    });
}

/**
 * 获取指定奖池中所有可能抽到的英雄的完整、去重列表 (已为服装召唤添加特殊逻辑)
 * @param {object} poolConfig - 奖池配置对象
 * @returns {Array} - 所有可能英雄的对象数组
 */
function getAllHeroesInPool(poolConfig) {
    if (!poolConfig) return [];

    // ▼▼▼ 新增：为服装召唤添加专属处理逻辑 ▼▼▼
    if (poolConfig.productType === 'CostumeSummon') {
        const latestCostumes = new Map();

        // 1. 遍历所有英雄
        state.allHeroes.forEach(hero => {
            // 2. 只考虑经典家族且是皮肤的英雄
            if (hero.family === 'classic' && hero.costume_id > 0) {
                const existing = latestCostumes.get(hero.english_name);
                // 3. 如果尚未记录该英雄，或当前皮肤比已记录的更新，则更新记录
                if (!existing || hero.costume_id > existing.costume_id) {
                    latestCostumes.set(hero.english_name, hero);
                }
            }
        });

        // 4. 返回所有最新皮肤的列表
        return Array.from(latestCostumes.values());
    }
    // ▲▲▲ 服装召唤专属逻辑结束 ▲▲▲


    // --- 对于所有其他非服装召唤的活动，执行以下标准逻辑 ---
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
                let featuredHeroes = state.allHeroes.filter(h => featuredIds.includes(h.heroId));
                if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
                    featuredHeroes = featuredHeroes.filter(h => {
                        const standardHeroColor = colorReverseMap[h.color];
                        const standardSelectedColor = colorReverseMap[state.selectedElementalColor];
                        return standardHeroColor === standardSelectedColor;
                    });
                }

            } else {
                const heroesFromBucket = getHeroPoolForBucket(bucketString, poolConfig);
                allPossibleHeroes.push(...heroesFromBucket);
            }
        });
    }

    // ▼▼▼ 处理 nonFeaturedLegendaryHeroesAgeInDays 的逻辑 ▼▼▼
    if (poolConfig.nonFeaturedLegendaryHeroesAgeInDays > 0) {
        const days = poolConfig.nonFeaturedLegendaryHeroesAgeInDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(new Date().getDate() - days);

        const olderHeroes = state.allHeroes.filter(hero => {
            // 确保英雄有发布日期
            if (!hero['Release date']) {
                return false;
            }
            const heroFamily = hero.family ? String(hero.family).toLowerCase() : '';
            // 检查所有条件
            return hero.star === 5 &&                                     // 1. 是5星英雄
                hero.costume_id === 0 &&                               // 2. 不是服装英雄
                new Date(hero['Release date']) < cutoffDate &&         // 3. 发布日期早于截止日期
                heroFamily !== 'classic' &&                            // 4. 排除经典S1英雄
                !state.globalExcludeFamilies.includes(heroFamily);   // 5. 遵守全局排除规则
        });

        // 将筛选出的旧英雄添加到总卡池中
        allPossibleHeroes.push(...olderHeroes);
    }

    const finalLatestVersions = {};
    allPossibleHeroes.forEach(hero => {
        if (hero && hero.english_name) {
            if (!finalLatestVersions[hero.english_name] || hero.costume_id > finalLatestVersions[hero.english_name].costume_id) {
                finalLatestVersions[hero.english_name] = hero;
            }
        }
    });

    const finalPool = Object.values(finalLatestVersions);


    return finalPool; // 原有的 return 语句现在只对非元素人活动生效
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
async function handleActivityClick(poolId) {
    // 1. 更新左侧列表的激活状态样式
    document.querySelectorAll('#lottery-activity-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.poolId === poolId);
    });

    // 2. 获取完整的奖池配置
    const poolConfig = state.allSummonPools?.[poolId];
    if (!poolConfig) return;

    // 3. 更新当前奖池状态
    state.currentSummonData = poolConfig;
    state.selectedElementalColor = null; // 每次点击都重置颜色选择

    // 检查是否为超级元素人召唤，如果是，则弹出模态框并等待选择
    if (poolConfig.productType === 'SuperElementalSummon') {
        const elementalModal = document.getElementById('elemental-modal');
        const elementalOverlay = document.getElementById('elemental-modal-overlay');

        elementalModal.classList.remove('hidden');
        elementalOverlay.classList.remove('hidden');

        // 创建一个Promise，它将在用户选择颜色后“完成”
        const userChoice = await new Promise(resolve => {
            const elementalContainer = document.querySelector('.elemental-selection-container');

            // 定义一个一次性的点击事件处理器
            const handler = (event) => {
                const target = event.target.closest('.elemental-icon');
                if (target && target.dataset.color) {
                    // 清除这个临时的监听器
                    elementalContainer.removeEventListener('click', handler);
                    // 关闭模态框
                    elementalModal.classList.add('hidden');
                    elementalOverlay.classList.add('hidden');
                    // 将用户选择的颜色作为结果，让Promise完成
                    resolve(target.dataset.color);
                }
            };

            // 绑定这个一次性的监听器
            elementalContainer.addEventListener('click', handler);
        });

        // 将用户选择的颜色保存到state中
        state.selectedElementalColor = userChoice;
    }

    // 4. 根据配置自动填充或清空精选英雄位
    const numSlots = poolConfig.featuredHeroNum || 0;
    let heroesForSlots = []; // 创建一个临时数组来存放最终选择的英雄

    // --- 调试信息 ---
    console.log("[步骤1: 检查初始状态] 当前活动配置 (poolConfig):", poolConfig);
    console.log("[步骤1: 检查初始状态] 已选择的元素颜色 (selectedElementalColor):", state.selectedElementalColor);
    console.log("[步骤1: 检查初始状态] 精选英雄上限 (numSlots):", numSlots);
    // --- 调试信息结束 ---

    if (poolConfig.productType === 'SuperElementalSummon' && state.selectedElementalColor) {
        // --- 超级元素人召唤的专属逻辑 ---
        console.log("[流程] 进入“超级元素人召唤”专属逻辑...");

        // 1. 根据选择的颜色（如 "red"）动态构建要查找的键名（如 "featuredHeroes_red"）
        const dynamicKey = `featuredHeroes_${state.selectedElementalColor}`;
        // --- 调试信息 ---
        console.log(`[步骤2: 构建钥匙] 生成的动态钥匙是: "${dynamicKey}"`);
        // --- 调试信息结束 ---

        // 2. 使用这个动态键名从活动配置中获取英雄ID列表
        const heroIdList = poolConfig[dynamicKey];
        // --- 调试信息 ---
        console.log("[步骤3: 获取ID列表] 使用动态钥匙从配置中获取到的英雄ID列表是:", heroIdList);
        // --- 调试信息结束 ---

        // 3. 如果找到了对应颜色的列表，则将其转换为英雄对象
        if (heroIdList && Array.isArray(heroIdList)) {
            heroesForSlots = heroIdList.map(heroId => state.heroesByIdMap.get(heroId) || null);
            // --- 调试信息 ---
            console.log("[步骤4: 转换英雄对象] 将ID列表转换为英雄对象后的结果是:", heroesForSlots);
            // --- 调试信息结束 ---
        } else {
            console.warn(`[警告] 未能在活动配置中找到名为 "${dynamicKey}" 的英雄列表。`);
        }

    } else {
        // --- 适用于所有其他普通召唤的逻辑 ---
        console.log("[流程] 进入常规召唤逻辑...");
        if (poolConfig.featuredHeroes && Array.isArray(poolConfig.featuredHeroes)) {
            heroesForSlots = poolConfig.featuredHeroes.map(heroId => state.heroesByIdMap.get(heroId) || null);
        }
    }

    // 4. 用最终确定的英雄列表填充状态，并严格遵守 numSlots 的数量限制
    state.customFeaturedHeroes = heroesForSlots.slice(0, numSlots);
    // --- 调试信息 ---
    console.log(`[步骤5: 截取英雄] 根据上限 (${numSlots}) 截取后，最终的精选英雄列表是:`, state.customFeaturedHeroes);
    // --- 调试信息结束 ---
    
    // b. 【关键修复】如果英雄数量不足卡槽数量，用 null 补齐，确保数组长度正确
    while (state.customFeaturedHeroes.length < numSlots) {
        state.customFeaturedHeroes.push(null);
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
            infoIcon.style.left = '10px'; /* 修正：定位到左侧 */
            infoIcon.title = i18n[state.currentLang].probabilityInfoTitle || '查看概率详情';
            const formatPercentage = (rawValue) => {
                const percentageNum = parseFloat(rawValue) / 10;
                // 如果数字小于10，则在前面添加一个HTML空格实体
                const prefix = percentageNum < 10 ? '&nbsp;' : '';
                return `${prefix}${percentageNum.toFixed(1)}`;
            };

            // 1. 获取所有相关的翻译字典
            const bucketTranslations = i18n[state.currentLang].lottery_bucket_translations || {};
            const bonusTranslations = i18n[state.currentLang].lottery_bonus_translations || {};

            // 2. 生成基础的 bucket 概率列表 (与之前相同)
            let listItems = '';
            poolConfig.bucketConfig.forEach((bucketName, index) => {
                const weight = poolConfig.bucketWeights[index];
                if (weight > 0) {
                    const percentage = (weight / 10).toFixed(1);
                    const translatedName = bucketTranslations[bucketName] || bucketName;
                    listItems += `<li><span>${translatedName}</span><span>${percentage}%</span></li>`;
                }
            });

            // 3. 新增逻辑：检查并生成额外概率的列表
            let bonusListItems = '';

            let legendaryBonusItems = '';

            // 将奖励传奇英雄的信息添加到新变量中
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

            // 检查月度英雄(HOTM)和神秘英雄
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
                if (mysteryInfo && mysteryInfo.ChancePerMil) {
                    const percentage = (parseInt(mysteryInfo.ChancePerMil, 10) / 10).toFixed(1);
                    const dictKey = poolConfig.productType === 'LegendsSummon' ? 'LegendsSummonMysteryHero' : 'MysteryHero';
                    const name = bonusTranslations[dictKey] || 'Mystery Hero';
                    bonusListItems += `<li><span>${name}</span><span>${percentage}%</span></li>`;
                }
            }

            // 检查额外抽取概率 (additionalDrawWeights)
            if (poolConfig.additionalDrawWeights && poolConfig.additionalDrawWeights.length > 0) {
                const percentages = poolConfig.additionalDrawWeights.map((w, i) => {
                    const numberLabel = i + 1;
                    const numberPrefix = numberLabel < 10 ? '&nbsp;&nbsp;' : '';
                    // 这一行调用了 formatPercentage，是我们需要修改的地方
                    return `${numberPrefix}${numberLabel} - ${formatPercentage(w)}%`;
                }).join('<br>');
                const name = bonusTranslations.additionalDrawWeights || 'Additional Draws';
                // 注意：这个词条通常很长，所以我们让它独占一行显示
                bonusListItems += `<li><span>${name}</span><span>${percentages}</span></li>`;
            }

            // 4. 组合最终的 HTML
            // 特殊规则备用
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
            if (poolConfig.productType === 'SuperElementalSummon') {
                const noticeText = i18n[state.currentLang].superElementalExclusionNotice || '* Does not include non-associated family heroes released within 180 days';
                specialNoticeHTML = `<p style="font-size: 0.7em; color: var(--md-sys-color-primary); margin: 10px 5px 0 5px; text-align: center;">${noticeText}</p>`;
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

            // 为新增的规则开关绑定实时刷新事件
            setTimeout(() => {
                const excludeToggle = document.getElementById('exclude-recent-heroes-toggle');
                if (excludeToggle) {
                    excludeToggle.addEventListener('change', () => {
                        // 当开关状态改变时，调用新的函数重新计算卡池
                        state.activeHeroSubset = getFilteredMasterPool();
                        // 刷新下方的英雄列表
                        applyFiltersAndRender();
                    });
                }
            }, 0); // 延迟0毫秒足以将其推到下一个事件循环，确保DOM已更新

            portalContainer.appendChild(infoIcon);
        }
    }

    // 6. 获取当前奖池的所有英雄，并将其设置为临时的“活动子集”
    state.activeHeroSubset = getFilteredMasterPool();

    // 7. 将默认排序设置为“按发布日期降序”
    state.currentSort = { key: 'Release date', direction: 'desc' };

    // 8. 调用全局的筛选和渲染函数，而不是直接渲染表格
    applyFiltersAndRender();

    // 9. 渲染精选英雄卡槽UI和更新召唤按钮
    LotterySimulator.renderFeaturedHeroes();
    LotterySimulator.updateSummonButtons();
}


/**
 * 渲染精选英雄卡槽UI (已添加调试信息)
 */
function renderFeaturedHeroes() {
    const leftColumn = document.getElementById('featured-heroes-left');
    const rightColumn = document.getElementById('featured-heroes-right');
    if (!leftColumn || !rightColumn || !state.currentSummonData) return;

    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    // --- 新增调试信息 ---
    console.log("--- [渲染步骤] 进入 renderFeaturedHeroes 函数 ---");
    const numFeatured = state.currentSummonData.featuredHeroNum || 0;
    console.log("[渲染步骤] > 从配置中读取到的精选英雄数量 (numFeatured):", numFeatured);
    console.log("[渲染步骤] > 当前 state.customFeaturedHeroes 的内容:", state.customFeaturedHeroes);
    console.log("[渲染步骤] > 当前 state.customFeaturedHeroes 的长度:", state.customFeaturedHeroes.length);
    // --- 调试信息结束 ---

    // 您的代码中可能存在一个重置数组的逻辑，我们暂时将其注释掉来排查问题
    // if (state.customFeaturedHeroes.length !== numFeatured) {
    //     console.warn("[渲染步骤] > 警告：数组长度与配置不符，数组将被重置！这可能是问题所在。");
    //     state.customFeaturedHeroes = Array(numFeatured).fill(null);
    // }

    for (let i = 0; i < numFeatured; i++) {
        const slot = document.createElement('div');
        slot.className = 'featured-hero-slot';
        slot.dataset.slotIndex = i;
        const hero = state.customFeaturedHeroes[i] || null;

        if (hero && hero.isFeaturedOnly) {
            slot.classList.add('non-removable');
        }

        if (hero) {
            // --- 调试信息 ---
            console.log(`[渲染步骤] > 正在为卡槽 #${i} 渲染英雄: ${hero.name}`);
            // --- 调试信息结束 ---
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
        } else {
            // --- 调试信息 ---
            console.log(`[渲染步骤] > 卡槽 #${i} 为空 (null)。`);
            // --- 调试信息结束 ---
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
    console.log("--- [渲染步骤] renderFeaturedHeroes 函数执行完毕 ---");
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
 * 将一个英雄添加到下一个可用的精选卡槽中 (已添加调试信息)
 * @param {object} selectedHero - 从主列表选择的英雄
 */
function addHeroToFeaturedSlot(selectedHero) {
    // --- 新增调试信息 ---
    console.log("--- [手动添加精选] 函数 addHeroToFeaturedSlot 已触发 ---");
    console.log("[手动添加精选] > 准备添加的英雄:", selectedHero);
    // --- 调试信息结束 ---

    if (selectedHero.star !== 5) {
        // --- 新增调试信息 ---
        console.warn("[手动添加精选] > 添加失败：英雄不是5星。");
        // --- 调试信息结束 ---
        alert(i18n[state.currentLang].mustSelect5StarHero || '请选择一位5星英雄。');
        return;
    }

    // --- 新增调试信息 ---
    // 使用 JSON.stringify 和 parse 来打印数组在这一刻的“快照”，而不是一个可能变化的引用
    console.log("[手动添加精选] > 添加前，当前的精选英雄列表 (state.customFeaturedHeroes):", JSON.parse(JSON.stringify(state.customFeaturedHeroes)));
    // --- 调试信息结束 ---

    const emptyIndex = state.customFeaturedHeroes.findIndex(h => h === null || h === undefined);

    // --- 新增调试信息 ---
    console.log(`[手动添加精选] > 查找空卡槽的结果 (emptyIndex): ${emptyIndex}`);
    // --- 调试信息结束 ---

    if (emptyIndex !== -1) {
        state.customFeaturedHeroes[emptyIndex] = selectedHero;
        // --- 新增调试信息 ---
        console.log("[手动添加精选] > 添加成功！更新后的列表:", JSON.parse(JSON.stringify(state.customFeaturedHeroes)));
        // --- 调试信息结束 ---
        renderFeaturedHeroes();
        applyFiltersAndRender();
    } else {
        // --- 新增调试信息 ---
        console.warn("[手动添加精选] > 添加失败：未找到空卡槽 (findIndex 返回 -1)。");
        // --- 调试信息结束 ---
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

async function performSummon(count) {
    const poolConfig = state.currentSummonData;
    if (!poolConfig) {
        console.error("错误：未选择任何抽奖活动 (poolConfig is null)。");
        return;
    }

    // --- 调试信息 ---
    console.log(`===================\n[主流程] 开始召唤：从奖池 "${poolConfig.id}" 进行 ${count} 次召唤\n===================`);

    const masterHeroPool = getFilteredMasterPool();
    const isCostumeSummon = poolConfig.productType === 'CostumeSummon';
    let costumePool = [];

    if (isCostumeSummon) {
        console.log("[主流程] 检测到“服装召唤”，正在构建专用最新服装池...");
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
        console.log(`[主流程] 服装池构建完毕，共找到 ${costumePool.length} 个最新版服装英雄。`);

        if (costumePool.length === 0) {
            console.error("错误：服装召唤奖池为空，无法执行召唤。");
            return;
        }
    }

    const totalSummonedResults = [];

    // 主召唤循环
    for (let k = 0; k < count; k++) {
        console.log(`\n--- [第 ${k + 1}/${count} 次召唤] ---`);
        let drawnHero = null;
        let bucketString = 'unknown';

        if (isCostumeSummon) {
            console.log("[抽奖中] 使用“服装召唤”逻辑...");
            const { bucketWeights, bucketConfig } = poolConfig;
            const bucketIndex = selectWeightedIndex(bucketWeights);
            bucketString = bucketConfig[bucketIndex];
            const starMatch = bucketString.match(/_(\d+)$/);
            const isFeatured = bucketString === 'featuredHero';
            const targetStar = isFeatured ? 5 : (starMatch ? parseInt(starMatch[1], 10) : 0);
            console.log(`[抽奖中] > 选中桶: ${bucketString}, 目标星级: ${targetStar}`);

            const heroPoolOfStar = costumePool.filter(h => h.star === targetStar);
            console.log(`[抽奖中] > 在服装池中找到 ${heroPoolOfStar.length} 个符合条件的英雄。`);

            if (heroPoolOfStar.length > 0) {
                drawnHero = heroPoolOfStar[Math.floor(Math.random() * heroPoolOfStar.length)];
                console.log(`[抽奖中] > 成功抽到: ${drawnHero.name}`);
            } else {
                console.warn(`[抽奖中] > 警告: 目标星级 ${targetStar} 的服装英雄池为空。`);
            }
            bucketString = 'costume';
        } else {
            console.log("[抽奖中] 使用常规召唤逻辑...");
            const { bucketWeights, bucketConfig } = poolConfig;
            const bucketIndex = selectWeightedIndex(bucketWeights);
            bucketString = bucketConfig[bucketIndex];
            console.log(`[抽奖中] > 权重计算后，选中桶: "${bucketString}"`);

            if (bucketString && bucketString.startsWith('trainer')) {
                console.log("[抽奖中] > 桶类型为“训练师”，正在生成...");
                const star = parseInt(bucketString.split('_')[1], 10);
                const colors = ['红', '蓝', '绿', '黄', '紫'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                drawnHero = { name: `${star}* 训练师`, type: 'trainer', star, color: randomColor, image: `imgs/hero_icon/trainer_rainbow.webp`, heroId: `trainer_rainbow` };
                console.log(`[抽奖中] > 成功生成: ${drawnHero.name}`);
            } else if (bucketString === 'featuredHero') {
                console.log("[抽奖中] > 桶类型为“精选英雄”，正在检查...");
                console.log("[抽奖中] > 抽奖前，原始 state.customFeaturedHeroes 内容:", state.customFeaturedHeroes);
                if (state.currentSummonData.productType === 'SuperElementalSummon') {
                    console.log("[抽奖中] > 当前为“超级元素人召唤”，已选择的颜色是:", state.selectedElementalColor);
                }
                const validFeatured = state.customFeaturedHeroes.filter(h => h !== null);
                console.log(`[抽奖中] > 筛选后，有效的精选英雄数量: ${validFeatured.length}`);
                if (validFeatured.length > 0) {
                    drawnHero = validFeatured[Math.floor(Math.random() * validFeatured.length)];
                    console.log(`[抽奖中] > 成功抽到精选英雄: ${drawnHero.name}`);
                } else {
                    console.warn("[抽奖中] > 警告: 有效的精选英雄列表为空，将触发内部后备。");
                    const fallbackPool = getHeroPoolForBucket('heroes_s1_3', poolConfig);
                    drawnHero = fallbackPool.length > 0 ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)] : null;
                    if (drawnHero) console.log(`[抽奖中] > 成功抽到内部后备英雄: ${drawnHero.name}`);
                }
            } else if (bucketString) {
                console.log(`[抽奖中] > 桶类型为常规英雄桶，正在调用 getHeroPoolForBucket('${bucketString}')...`);
                const heroPool = getHeroPoolForBucket(bucketString, { ...poolConfig, masterPool: masterHeroPool });
                console.log(`[抽奖中] > getHeroPoolForBucket 返回了 ${heroPool.length} 个英雄。`);
                if (heroPool.length > 0) {
                    drawnHero = heroPool[Math.floor(Math.random() * heroPool.length)];
                    console.log(`[抽奖中] > 成功抽到: ${drawnHero.name}`);
                }
            }
        }

        // 【重要】通用后备机制，防止因任何意外情况导致抽奖失败
        if (!drawnHero) {
            console.warn(`[后备机制] > 警告：在第 ${k + 1} 次召唤中，未能从桶 "${bucketString}" 抽到任何英雄。正在启用通用后备机制...`);
            const fallbackPool = getHeroPoolForBucket('heroes_s1_3', poolConfig);
            if (fallbackPool.length > 0) {
                drawnHero = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                bucketString = 'fallback_s1_3'; // 更新桶名以供记录
                console.log(`[后备机制] > 成功获取后备英雄: ${drawnHero.name}`);
            } else {
                console.error("[后备机制] > 严重错误：通用后备池 (heroes_s1_3) 也为空！此次召唤失败。");
            }
        }


        if (drawnHero) {
            totalSummonedResults.push({ hero: drawnHero, bucket: isCostumeSummon ? 'costume' : (bucketString || 'unknown') });

            // 奖励抽奖逻辑
            console.log("[奖励检查] 正在检查是否触发奖励召唤...");
            const associatedFamilies = (poolConfig.AssociatedFamilies || []).map(f => String(f).toLowerCase());
            if (drawnHero.star === 5 && drawnHero.family && associatedFamilies.includes(String(drawnHero.family).toLowerCase()) && poolConfig.bonusLegendaryHeroChancePerMil) {
                console.log("[奖励检查] > 符合传奇奖励条件，进行概率检定...");
                for (let i = 0; i < (poolConfig.bonusLegendaryHeroPullAmount || 1); i++) {
                    if (Math.random() * 1000 < poolConfig.bonusLegendaryHeroChancePerMil) {
                        console.log(`[奖励检查] > 成功触发【传奇奖励】召唤！`);
                        const isEventOnly = poolConfig.bonusLegendaryHeroPullTriggersOnEventHeroesOnly;
                        let bonusPool;
                        if (isEventOnly) {
                            bonusPool = masterHeroPool.filter(h => h.star === 5 && h.family && associatedFamilies.includes(String(h.family).toLowerCase()));
                        } else {
                            bonusPool = masterHeroPool.filter(h => h.star === 5 && h.family && h.family !== 'classic');
                        }
                        if (bonusPool.length > 0) {
                            const bonusHero = bonusPool[Math.floor(Math.random() * bonusPool.length)];
                            console.log(`[奖励检查] > 传奇奖励英雄: ${bonusHero.name}`);
                            totalSummonedResults.push({ hero: bonusHero, bucket: 'bonusLegendary' });
                        }
                    }
                }
            }

            if (poolConfig.hasMysteryHeroBonusRoll) {
                const hotmInfo = summonPoolDetails.hotm;
                if (hotmInfo && Math.random() * 1000 < parseInt(hotmInfo.ChancePerMil, 10)) {
                    console.log(`[奖励检查] > 成功触发【月度英雄】召唤！`);
                    const hotmPool = state.allHeroes.filter(h => String(h.family) === String(hotmInfo.family));
                    if (hotmPool.length > 0) {
                        const latestHotm = hotmPool.sort((a, b) => new Date(b['Release date']) - new Date(a['Release date']))[0];
                        console.log(`[奖励检查] > 月度英雄: ${latestHotm.name}`);
                        totalSummonedResults.push({ hero: latestHotm, bucket: 'hotm' });
                    }
                }
                let mysteryInfo = poolConfig.productType === 'LegendsSummon' ? summonPoolDetails.LegendsSummonMysteryHero : summonPoolDetails.MysteryHero;
                if (mysteryInfo && Math.random() * 1000 < parseInt(mysteryInfo.ChancePerMil, 10)) {
                    console.log(`[奖励检查] > 成功触发【神秘英雄】召唤！`);
                    const mysteryPool = state.allHeroes.filter(h => String(h.family) === String(mysteryInfo.family));
                    if (mysteryPool.length > 0) {
                        const mysteryHero = mysteryPool[Math.floor(Math.random() * mysteryPool.length)];
                        console.log(`[奖励检查] > 神秘英雄: ${mysteryHero.name}`);
                        totalSummonedResults.push({ hero: mysteryHero, bucket: 'mystery' });
                    }
                }
            }

            if (poolConfig.additionalDrawWeights) {
                const totalWeight = poolConfig.additionalDrawWeights.reduce((a, b) => a + b, 0);
                let random = Math.random() * totalWeight;
                for (let i = 0; i < poolConfig.additionalDrawWeights.length; i++) {
                    if (random < poolConfig.additionalDrawWeights[i]) {
                        if (i > 0) console.log(`[奖励检查] > 成功触发【${i}次额外】召唤！`);
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
                                const heroPool = getHeroPoolForBucket(extraBucketString, poolConfig);
                                if (heroPool.length > 0) extraHero = heroPool[Math.floor(Math.random() * heroPool.length)];
                            }
                            if (extraHero) {
                                console.log(`[奖励检查] > 额外召唤 #${j + 1} 结果: ${extraHero.name}`);
                                totalSummonedResults.push({ hero: extraHero, bucket: 'additionalDraw' });
                            }
                        }
                        break;
                    }
                    random -= poolConfig.additionalDrawWeights[i];
                }
            }
        }
    }

    // --- 调试信息 ---
    console.log(`\n===================\n[主流程] 召唤结束，总计获得 ${totalSummonedResults.length} 个结果。\n===================`);


    if (totalSummonedResults.length === 0) return;

    // --- 动画播放和UI更新的完整逻辑 (保持不变) ---
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
    // 1. 先显示结果弹窗
    showSummaryModal(totalSummonedResults);

    // 2. 紧接着，立刻更新历史记录
    updateSummonHistory(totalSummonedResults, count);

    // 3. 定义关闭弹窗的函数
    const closeModal = () => {
        document.getElementById('summon-summary-modal').classList.add('hidden');
        document.getElementById('summon-summary-modal-overlay').classList.add('hidden');
        document.body.classList.remove('modal-open');
    };

    const scrollContainer = document.getElementById('summon-summary-scroll-container');
    if (scrollContainer) {
        scrollContainer.scrollTop = 0;
    }

    // 4. 为按钮和遮罩层绑定关闭事件
    document.getElementById('summary-close-btn').onclick = closeModal;
    document.getElementById('summon-summary-modal-overlay').onclick = closeModal;

}


/**
 * 在指定容器内播放动画，并根据参数决定是否添加奖励动画
 * @param {object} hero - 抽到的英雄
 * @param {HTMLElement} animationViewport - 动画播放的容器
 * @param {boolean} isBonusDraw - 是否为额外奖励抽奖
 * @returns {Promise}
 */
function showSingleSummonAnimation(hero, animationViewport, isBonusDraw = false) {
    // 播放声音 (仅在音效开启时)
    if (state.soundEnabled) {
        summonSound.currentTime = 0;
        summonSound.play();
    }

    return new Promise(resolve => {
        animationViewport.innerHTML = ''; // 确保视口在每次动画开始时都是干净的

        // 1. 创建所有需要的元素
        const heroAvatarContainer = document.createElement('div');
        const heroImage = document.createElement('img');
        const lightEffect = document.createElement('div');

        // 2. 设置图片通用样式
        heroImage.style.width = '100%';
        heroImage.style.height = '100%';
        heroImage.style.objectFit = 'contain';

        // 3. 设置光效
        lightEffect.className = 'summon-animation-element';
        lightEffect.innerHTML = `<img src="imgs/lottery/gate/lottery_animation_light.webp" class="anim-light-img">`;
        lightEffect.style.filter = `drop-shadow(0 0 15px ${getColorHex(hero.color)})`;

        // 4. 定义一个统一的函数来播放动画，确保所有元素都已准备好
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

            // 【核心修正】在这里为两种情况分别设置样式，确保不互相干扰

            // a. 当立绘加载成功时
            heroImage.onload = () => {
                // 清除可能存在的内联样式，并应用“立绘”专属样式
                heroAvatarContainer.removeAttribute('style');
                heroAvatarContainer.className = 'summon-animation-element anim-hero-art is-avatar';
                heroAvatarContainer.appendChild(heroImage);
                playAnimation();
            };

            // b. 当立绘加载失败时
            heroImage.onerror = () => {
                // 清除可能存在的内联样式，并应用“常规”样式
                heroAvatarContainer.removeAttribute('style');
                heroAvatarContainer.className = `summon-animation-element anim-hero-art ${getColorGlowClass(hero.color)}`;
                heroAvatarContainer.style.background = getHeroColorLightGradient(hero.color);
                heroImage.onload = null;

                heroImage.src = iconSrc; // 加载备用头像
                heroImage.onerror = null; // 移除onerror，防止备用头像也失败导致死循环
                heroAvatarContainer.appendChild(heroImage);
                playAnimation();
            };

            // c. 触发加载
            heroImage.src = avatarSrc;

        } else {
            // 如果英雄没有ID (例如训练师)，直接使用常规样式
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
        console.error('显示总结弹窗失败：缺少必要的HTML元素。');
        return;
    }

    scrollContainer.innerHTML = '';
    const bonusBuckets = ['bonusLegendary', 'hotm', 'mystery', 'additionalDraw'];

    results.forEach(result => {
        const hero = result.hero;

        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.color)}`;
        card.title = hero.name;

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.color);

        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-details-overlay';
        // ▼▼▼ 根据屏幕宽度决定星星的显示方式 ▼▼▼
        const isMobile = window.innerWidth <= 900;
        let starsContent = '';

        if (isMobile && hero.star) {
            // 在移动端，生成文本内容
            starsContent = `${hero.star}⭐`;
        } else if (hero.star) {
            // 在桌面端，生成图片内容
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

        // 新增逻辑：检查是否为奖励英雄并添加 "Ex" 标签
        if (bonusBuckets.includes(result.bucket)) {
            const exLabel = document.createElement('div');
            exLabel.className = 'summary-ex-label';
            exLabel.textContent = 'Ex';
            card.appendChild(exLabel);
        }

        scrollContainer.appendChild(card);
    });

    summaryModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

/**
 * 更新并渲染抽奖历史记录
 * @param {Array} results - 本次抽奖的结果数组, 每个元素是 {hero, bucket}
 * @param {number} count - 初始抽奖次数 (1, 10, 30)
 */
function updateSummonHistory(results, count) {
    if (results.length > 0) {
        const currentPoolName = getPoolDisplayName(state.currentSummonData);
        // 核心修正：保存完整的结果数组 (results)，而不是只提取英雄 (results.map(r => r.hero))
        state.summonHistory.unshift({
            count: count,
            results: results, // 保存包含 hero 和 bucket 的完整对象
            poolName: currentPoolName
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

    const bonusBuckets = ['bonusLegendary', 'hotm', 'mystery', 'additionalDraw'];

    state.summonHistory.forEach(group => {
        // 核心修正：从 group.results 读取数据，并处理旧格式的兼容性
        const resultsToRender = group.results || (Array.isArray(group) ? group.map(hero => ({ hero, bucket: '' })) : []);
        if (resultsToRender.length === 0) return;

        const groupContainer = document.createElement('div');
        groupContainer.className = 'summon-history-group';
        const header = document.createElement('h5');
        const summonTypeTitle = `${i18n[state.currentLang].summonOnce || '召唤'} x${group.count}`;
        header.textContent = group.poolName ? `${group.poolName} - ${summonTypeTitle}` : summonTypeTitle;

        const avatarsContainer = document.createElement('div');
        avatarsContainer.className = 'summon-history-avatars';

        resultsToRender.forEach(result => {
            const hero = result.hero;
            if (!hero) return;
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
            // ▼▼▼ 添加文本星星数量 ▼▼▼
            if (hero.star) {
                const starText = document.createElement('div');
                starText.className = 'hero-star-text';
                starText.textContent = `${hero.star}⭐`;
                avatarContainer.appendChild(starText);
            }

            // 新增逻辑：检查是否为奖励英雄并添加 "Ex" 标签
            if (bonusBuckets.includes(result.bucket)) {
                const exLabel = document.createElement('div');
                exLabel.className = 'history-ex-label';
                exLabel.textContent = 'Ex';
                avatarContainer.appendChild(exLabel);
            }
            // ▼▼▼ 添加星星数量角标 ▼▼▼
            if (hero.star) {
                const starLabel = document.createElement('div');
                starLabel.className = `history-hero-stars star-level-${hero.star}`;
                starLabel.innerHTML = `${hero.star}⭐`; // 使用星星表情符号
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

        // ▼▼▼ 重置滚动条 ▼▼▼
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