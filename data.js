// data.js: 存放所有静态数据和常量映射表。

// --- 英雄属性映射表 (用于多语言转换和图标查找) ---

// 职业名称 -> 英文标识符 (用于图片路径)
const classReverseMap = {
    "Barbarian": "barbarian", "野蛮人": "barbarian", "野人": "barbarian",
    "Cleric": "cleric", "牧师": "cleric", "牧師": "cleric",
    "Druid": "druid", "德鲁伊": "druid", "德魯伊": "druid",
    "Fighter": "fighter", "战士": "fighter", "戰士": "fighter",
    "Monk": "monk", "僧侣": "monk", "僧侶": "monk",
    "Paladin": "paladin", "圣骑士": "paladin", "聖騎士": "paladin",
    "Ranger": "ranger", "游侠": "ranger", "遊俠": "ranger",
    "Rogue": "rogue", "盗贼": "rogue", "盜賊": "rogue",
    "Sorcerer": "sorcerer", "术士": "sorcerer", "術士": "sorcerer",
    "Wizard": "wizard", "巫师": "wizard", "巫師": "wizard"
};

// 以太力量名称 -> 英文标识符
const aetherPowerReverseMap = {
    "状态异常防御": "Ailment Defense", "異常防禦": "Ailment Defense",
    "状态异常反弹": "Ailment Reflect", "異常反射": "Ailment Reflect",
    "状态异常免疫": "Ailment Immunity", "異常免疫": "Ailment Immunity",
    "攻击提升": "Attack Up", "攻擊提升": "Attack Up",
    "生命恢复加成": "Boosted Regen", "回復已加成": "Boosted Regen",
    "坚壁": "Bulwark", "壁壘": "Bulwark",
    "净化": "Cleanse", "淨化": "Cleanse",
    "反击": "Counterattack", "反擊": "Counterattack",
    "减伤": "Damage Reduction", "傷害減少": "Damage Reduction",
    "防御提升": "Defense Up", "防禦提升": "Defense Up",
    "闪避": "Dodge", "閃避": "Dodge",
    "恶魔抵抗": "Fiend Resist", "惡魔抵禦": "Fiend Resist",
    "骑士之毅": "Knight's Endurance", "騎士的耐力": "Knight's Endurance",
    "气运": "Gamble", "豪賭": "Gamble",
    "治疗提升": "Heal Increase", "治療增加": "Heal Increase",
    "法力加成": "Mana Boost",
    "法力生成": "Mana Generation", "法力產出": "Mana Generation",
    "木乃伊": "Mummy",
    "伤害反弹": "Pain Return", "疼痛回歸": "Pain Return",
    "怒气": "Rage", "憤怒": "Rage",
    "生命恢复": "Regen", "回復": "Regen",
    "复活": "Revive", "復活": "Revive",
    "特殊护甲": "Special Armor", "特殊盔甲": "Special Armor",
    "特殊技能加成": "Special Boost", "特殊加成": "Special Boost",
    "嘲讽": "Taunt", "嘲諷": "Taunt",
    "吸血": "Vampire", "吸血鬼": "Vampire"
};

// 英雄来源/活动名称 -> 英文标识符
const sourceReverseMap = {
    // 简体中文
    "挑战节II - 恶棍": "villains", "联盟 - 火枪手": "musketeer", "挑战节II - 超能萌宠": "pets",
    "月活动 - 农历生肖": "lunaryear", "挑战 - 贝奥武夫": "beowulf", "联盟 - 飞蛾": "moth",
    "月活动 - 海滩派对": "beachparty", "月活动 - 卡勒瓦拉": "kalevala", "挑战节I - 阿瓦隆": "avalon",
    "高塔 - 忍者": "ninja", "月活动 - 莫洛维亚": "morlovia", "月活动 - 飞沙帝国": "sand",
    "三国召唤": "kingdom", "挑战节I - 仙境": "wonderland", "超级元素人": "superelemental",
    "高塔 - 魔法": "magic", "高塔 - 冥河": "styx", "月活动 - 冬日": "christmas",
    "月活动 - 春谷": "springvale", "挑战节I - 海盗": "pirates", "挑战节II - 星落": "starfall",
    "挑战 - 石像鬼": "gargoyle", "S1 - 经典": "season1", "S2 - 亚特兰蒂斯": "season2",
    "S5 - 沙丘": "season5", "神秘 - 暗影召唤": "shadow", "盟约召唤": "covenant",
    "高塔 - 猫头鹰": "owltower", "联盟 - 骑士冲击": "knights", "S6 - 深海奥秘": "untoldtales1", "S7 - 烈焰与冰霜宝藏": "untoldtales2",
    "S3 - 瓦尔哈拉": "season3", "S4 - 蛮荒地界": "season4", "挑战 - 重返圣堂": "returntosanctuary",
    "至日召唤": "solstice", "挑战 - 众神狂欢节": "carnivalofgods", "神话召唤 - 月英": "hotm",
    "月活动 - 恋爱季节": "love", "哥布林召唤": "goblinvillage", "额外抽奖 - 秘密召唤": "secretsummon", "神话召唤 - 额外抽奖": "tavernoflegendssecret",
    "挑战节II - 吟游诗人": "festival", "星体召唤": "astral", "挑战节II - 杀手": "slayers",
    "荒野召唤": "wilderness", "挑战节I - 守护者": "teltoc", "挑战节I - 肃煞森林": "fables",
    "神话召唤": "tavernoflegends", "生日召唤": "birthday", "黑色星期五召唤": "blackfriday",
    "丰收召唤": "harvest", "怪兽岛召唤": "monsterisland", "挑战 - 歌剧之谜": "opera", "挑战节 I": "challengefestival1", "挑战节 II": "challengefestival2", "服装间": "costume",
    // 繁體中文
    "挑戰節II - 惡棍": "villains", "聯盟 - 火槍手": "musketeer", "挑戰節II - 強大寵物": "pets",
    "月活動 - 農曆新年": "lunaryear", "挑戰 - 貝武夫": "beowulf", "聯盟 - 飛蛾": "moth",
    "月活動 - 海灘派對": "beachparty", "月活動 - 卡勒瓦拉": "kalevala", "挑戰節I - 阿瓦隆": "avalon",
    "高塔 - 忍者": "ninja", "月活動 - 莫洛維亞": "morlovia", "月活動 - 飛沙帝國": "sand",
    "三國召喚": "kingdom", "挑戰節I - 仙境": "wonderland", "超級元素": "superelemental",
    "高塔 - 魔法": "magic", "高塔 - 冥河": "styx", "月活動 - 冬季": "christmas",
    "月活動 - 斯普林維爾": "springvale", "挑戰節I - 海盜": "pirates", "挑戰節II - 星隕": "starfall",
    "挑戰 - 石像鬼": "gargoyle", "S1 - 經典": "season1", "S2 - 亞特蘭蒂斯": "season2",
    "S5 - 沙丘": "season5", "神秘 - 暗影召喚": "shadow", "聖約召喚": "covenant",
    "高塔 - 貓頭鷹": "owltower", "聯盟 - 騎士衝擊": "knights", "S6 - 深淵謎團": "untoldtales1", "S7 - 火焰與冰霜的寶藏": "untoldtales2",
    "S3 - 瓦爾哈拉": "season3", "S4 - 地底荒野": "season4", "挑戰 - 重返聖堂": "returntosanctuary",
    "至日召喚": "solstice", "挑戰 - 眾神狂歡節": "carnivalofgods", "傳奇召喚 - 月英": "hotm",
    "月活動 - 戀愛季節": "love", "哥布林召喚": "goblinvillage", "額外抽獎 - 秘密召喚": "secretsummon", "傳奇召喚 - 額外抽獎": "tavernoflegendssecret",
    "挑戰節II - 吟遊詩人": "festival", "星界召喚": "astral", "挑戰節II - 殺手": "slayers",
    "野地召喚": "wilderness", "挑戰節I - 守護者": "teltoc", "挑戰節I - 肅煞森林": "fables",
    "傳奇召喚": "tavernoflegends", "生日召喚": "birthday", "黑色星期五召喚": "blackfriday",
    "豐收召喚": "harvest", "怪獸島召喚": "monsterisland", "挑戰 - 歌劇秘辛": "opera", "挑戰節 I": "challengefestival1", "挑戰節 II": "challengefestival2", "服裝間": "costume",
    // English
    "Challenge Festival II - Villains": "villains", "Alliance - Musketeers": "musketeer", "Challenge Festival II - Pets": "pets",
    "Monthly Event - Lunar Year": "lunaryear", "Challenge - Beowulf": "beowulf", "Alliance - Moths": "moth",
    "Monthly Event - Beach Party": "beachparty", "Monthly Event - Kalevala": "kalevala", "Challenge Festival I - Avalon": "avalon",
    "Tower - Ninjas": "ninja", "Monthly Event - Morlovia": "morlovia", "Monthly Event - Sand Empire": "sand",
    "Three Kingdoms Summon": "kingdom", "Challenge Festival I - Wonderland": "wonderland", "Super Elementals": "superelemental",
    "Tower - Magic": "magic", "Tower - Styx": "styx", "Monthly Event - Winter": "christmas",
    "Monthly Event - Springvale": "springvale", "Challenge Festival I - Pirates": "pirates", "Challenge Festival II - Starfall": "starfall",
    "Challenge - Gargoyle": "gargoyle", "S1 - Classic": "season1", "S2 - Atlantis": "season2",
    "S5 - Dune": "season5", "Mystery - Shadow Summon": "shadow", "Covenant Summon": "covenant",
    "Tower - Owls": "owltower", "Alliance - Knights Clash": "knights", "S6 - Mysteries of the Deep": "untoldtales1", "S7 - Treasures of Flame and Frost": "untoldtales2",
    "S3 - Valhalla": "season3", "S4 - Wilderness": "season4", "Challenge - Return to Sanctuary": "returntosanctuary",
    "Solstice Summon": "solstice", "Challenge - Carnival of Gods": "carnivalofgods", "Legends Summon - Hero of the Month": "hotm",
    "Monthly Event - Love Season": "love", "Goblin Summon": "goblinvillage", "Extra Draw - Secret Summon": "secretsummon", "Legends Summon - Extra Draw": "tavernoflegendssecret",
    "Challenge Festival II - Bards": "festival", "Astral Summon": "astral", "Challenge Festival II - Slayers": "slayers",
    "Wilderness Summon": "wilderness", "Challenge Festival I - Guardians": "teltoc", "Challenge Festival I - Grim Forest": "fables",
    "Legends Summon": "tavernoflegends", "Birthday Summon": "birthday", "Black Friday Summon": "blackfriday",
    "Harvest Summon": "harvest", "Monster Island Summon": "monsterisland", "Challenge - Secrets of the Opera": "opera", "Challenge Festival I": "challengefestival1", "Challenge Festival II": "challengefestival2", "Costume Quest": "costume"
};

// 英文标识符 -> 图标文件名
const sourceIconMap = {
    "villains": "challenge.png", "musketeer": "alliance_quest.png", "pets": "challenge.png",
    "lunaryear": "s1.png", "beowulf": "challenge.png", "moth": "alliance_quest.png",
    "beachparty": "s1.png", "kalevala": "s1.png", "avalon": "challenge.png",
    "ninja": "tower.png", "morlovia": "s1.png", "sand": "s1.png",
    "kingdom": "mercenary_war.png", "wonderland": "challenge.png", "superelemental": "elemental.png",
    "magic": "tower.png", "styx": "tower.png", "christmas": "s1.png",
    "springvale": "s1.png", "pirates": "challenge.png", "starfall": "challenge.png",
    "gargoyle": "challenge.png", "season1": "s1.png", "season2": "s2.png",
    "season5": "s5.png", "shadow": "shadow.png", "covenant": "covenant.png",
    "owltower": "tower.png", "knights": "alliance_quest.png", "untoldtales1": "untoldtales.png", "untoldtales2": "untoldtales.png",
    "season3": "s3.png", "season4": "s4.png", "returntosanctuary": "challenge.png",
    "solstice": "diamond.png", "carnivalofgods": "challenge.png", "hotm": "hotm.png",
    "love": "s1.png", "goblinvillage": "goblin.png", "secretsummon": "lucky.png",
    "festival": "challenge.png", "astral": "astralelves.png", "slayers": "challenge.png",
    "wilderness": "wilderness.png", "teltoc": "challenge.png", "fables": "challenge.png",
    "tavernoflegends": "hotm.png", "tavernoflegendssecret": "hotm.png", "birthday": "diamond.png", "blackfriday": "diamond.png",
    "harvest": "diamond.png", "monsterisland": "monster_angular.png", "opera": "challenge.png", "challengefestival1": "challenge.png", "challengefestival2": "challenge.png", "costume": "costume_key.png",
};

// 颜色名称 -> 标准英文名
const colorReverseMap = {
    '红': 'Red', '紅': 'Red', 'red': 'Red',
    '蓝': 'Blue', '藍': 'Blue', 'blue': 'Blue',
    '绿': 'Green', '綠': 'Green', 'green': 'Green',
    '黄': 'Yellow', '黃': 'Yellow', 'yellow': 'Yellow',
    '紫': 'Purple', 'purple': 'Purple'
};

const iconMaps = {
    color: {
        '红': 'imgs/colors/red.png', '紅': 'imgs/colors/red.png', 'red': 'imgs/colors/red.png',
        '蓝': 'imgs/colors/blue.png', '藍': 'imgs/colors/blue.png', 'blue': 'imgs/colors/blue.png',
        '绿': 'imgs/colors/green.png', '綠': 'imgs/colors/green.png', 'green': 'imgs/colors/green.png',
        '黄': 'imgs/colors/yellow.png', '黃': 'imgs/colors/yellow.png', 'yellow': 'imgs/colors/yellow.png',
        '紫': 'imgs/colors/purple.png', 'purple': 'imgs/colors/purple.png'
    },
    class: {
        ...Object.fromEntries(Object.keys(classReverseMap).map(key => [key, `imgs/classes/${classReverseMap[key]}.png`]))
    },
    source: {
        ...Object.fromEntries(Object.keys(sourceReverseMap).map(key => {
            const sourceKey = sourceReverseMap[key];
            const iconFilename = sourceIconMap[sourceKey];
            return iconFilename ? [key, `imgs/coins/${iconFilename}`] : [key, null];
        }).filter(entry => entry[1]))
    },
    aetherpower: {
        ...Object.fromEntries(Object.keys(aetherPowerReverseMap).map(key => [key, `imgs/Aether Power/${aetherPowerReverseMap[key]}.png`]))
    }
};


// --- 游戏内数据 ---

// 通缉任务表数据
const wantedMissionData = [
    { season: 'S1', daily: '7-4', red: '4-1', green: '7-5', blue: '8-7', purple: '7-4', yellow: '10-6' },
    { season: 'S2', daily: ['4-3', '7-1'], red: '3-8', green: '7-1', blue: '8-10', purple: '21-10', yellow: ['13-1', '9-5'] },
    { season: 'S3', daily: '9-8', red: '6-2', green: ['4-8', '30-6'], blue: '9-8', purple: '17-9', yellow: '8-6' },
    { season: 'S4', daily: '6-10', red: ['12-6', '32-6'], green: '9-2', blue: ['8-2', '30-7'], purple: '14-8', yellow: '4-7' },
    { season: 'S5', daily: ['5-10', '6-10'], red: '2-9', green: ['10-8', '30-8'], blue: '22-2', purple: '5-10', yellow: '16-8' },
    { season: 'S6', daily: '1-26', red: '1-24', green: ['1-11', '1-12'], blue: '3-13', purple: '1-28', yellow: ['2-6', '6-7'] }
];

// 材料出处指南数据
const farmingGuideData = [
    { item: "Experience", s1: "23-11", s2: "24-10N\n9-10N E", s3: "22-6N\n21-10H", s4: "10-8N\n23-5H", s5: "10-8N\n10-9H", s6: "2-10N\n6-27H" },
    { item: "Food", s1: "17-1", s2: "27-9H\n27-9H E", s3: "22-6N\n36-1H", s4: "20-10N\n27-1H", s5: "10-8N\n8-10H", s6: "2-10N\n5-17H" },
    { item: "Iron", s1: "17-1", s2: "27-9H\n9-4N E", s3: "22-6N\n27-1H", s4: "22-2N\n15-6H", s5: "10-8N\n10-10H", s6: "2-18N\n6-23H" },
    { item: "Recruits", s1: "8-7", s2: "15-9N\n15-9N E", s3: "16-5N\n27-8H", s4: "23-6N\n2-1H", s5: "18-1N\n9-4H", s6: "1-26N\n3-4H" },
    { item: "Heroes", s1: "8-7", s2: "21-10N\n3-4N E", s3: "16-10N\n17-2H", s4: "15-3N\n2-5H", s5: "1-10N\n2-8H", s6: "2-7N\n2-9H" },
    { item: "Troops", s1: "8-7", s2: "9-10N\n3-4N E", s3: "16-3N\n26-4H", s4: "15-3N\n1-5H", s5: "3-4N\n1-1H", s6: "2-11N\n2-1H" },
    { item: "Adventurer's Kit", s1: "5-8", s2: "1-8H\n1-2N E", s3: "16-4N\n26-4H", s4: "15-3N\n30-3H", s5: "5-6N\n25-8H", s6: "1-14N\n4-7H" },
    { item: "Practice Sword", s1: "4-6", s2: "6-10H\n6-9N E", s3: "16-8N\n16-7H", s4: "20-4N\n2-10H", s5: "29-7N\n29-1H", s6: "2-10N\n5-14H" },
    { item: "Rugged Clothes", s1: "7-7", s2: "4-3H\n4-9N E", s3: "19-5N\n27-1H", s4: "19-4N\n1-2H", s5: "22-1N\n15-8H", s6: "1-17N\n2-18H" },
    { item: "Strong Rope", s1: "6-8", s2: "11-10H\n11-10H E", s3: "23-1N\n29-5H", s4: "20-4N\n2-5H", s5: "11-2N\n35-4H", s6: "1-9N\n1-3H" },
    { item: "Training Manual", s1: "14-9", s2: "14-1H\n14-7N E", s3: "20-5N\n29-6H", s4: "31-1N\n14-1H", s5: "36-6N\n19-2H", s6: "2-18N\n2-15H" },
    { item: "Arcane Scripts", s1: "12-9", s2: "12-6H\n12-6H E", s3: "19-6N\n27-5H", s4: "27-9N\n25-7H", s5: "6-2N\n4-4H", s6: "4-25N\n5-25H" },
    { item: "Dagger", s1: "11-9", s2: "10-10H\n10-4H E", s3: "16-3N\n27-6H", s4: "20-4N\n2-8H", s5: "6-1N\n34-2H", s6: "3-4N\n3-10H" },
    { item: "Leather Armor", s1: "6-8", s2: "8-10H\n8-10N E", s3: "16-4N\n26-6H", s4: "20-4N\n1-3H", s5: "3-7N\n4-3H", s6: "1-3N\n4-8H" },
    { item: "Sharpening Stone", s1: "10-9", s2: "5-10H\n5-3N E", s3: "16-7N\n33-4H", s4: "20-4N\n26-1H", s5: "12-4N\n15-10H", s6: "2-14N\n2-21H" },
    { item: "Wooden Shield", s1: "6-8", s2: "20-10H\n2-7N E", s3: "16-3N\n30-2H", s4: "33-7N\n23-3H", s5: "26-3N\n29-2H", s6: "2-9N\n2-12H" },
    { item: "Battle Manual", s1: "19-9", s2: "15-8H\n7-4N E", s3: "16-7N\n17-2H", s4: "20-4N\n2-3H", s5: "11-6N\n1-3H", s6: "5-17N\n5-15H" },
    { item: "Chainmail Shirt", s1: "23-11", s2: "13-7H\n9-4N E", s3: "16-6N\n26-10H", s4: "21-4N\n13-2H", s5: "5-3N\n7-1H", s6: "3-17N\n5-10H" },
    { item: "Scabbard", s1: "21-9", s2: "24-7H\n3-4N E", s3: "16-4N\n26-8H", s4: "19-5N\n1-4H", s5: "17-8N\n13-8H", s6: "1-15N\n5-28H" },
    { item: "Tall Boots", s1: "18-9", s2: "16-6H\n16-6H E", s3: "16-4N\n16-7H", s4: "20-2N\n24-1H", s5: "31-10N\n6-3H", s6: "5-4N\n2-3H" },
    { item: "Clean Cloth", s1: "5-8", s2: "1-10H\n1-2N E", s3: "16-6N\n26-4H", s4: "31-8N\n26-6H", s5: "3-1N\n20-3H", s6: "2-13N\n3-14H" },
    { item: "Common Herbs", s1: "8-7", s2: "9-10N\n9-4N E", s3: "17-8N\n34-6H", s4: "7-4N\n1-7H", s5: "26-10N\n2-6H", s6: "2-9N\n3-3H" },
    { item: "Crude Iron", s1: "6-8", s2: "12-10H\n12-10N E", s3: "16-7N\n26-9H", s4: "20-4N\n7-9H", s5: "9-2N\n1-3H", s6: "6-10N\n6-20H" },
    { item: "Large Bone", s1: "9-1", s2: "6-10H\n6-9N E", s3: "16-5N\n28-2H", s4: "25-7N\n25-1H", s5: "1-6N\n1-3H", s6: "2-11N\n4-19H" },
    { item: "Leather Strips", s1: "10-9", s2: "3-10H\n3-4N E", s3: "16-6N\n26-4H", s4: "19-8N\n1-8H", s5: "36-7N\n20-10H", s6: "4-3N\n6-9H" },
    { item: "Oil", s1: "10-9", s2: "5-10H\n5-3N E", s3: "16-5N\n27-2H", s4: "26-5N\n23-3H", s5: "11-8N\n9-7H", s6: "1-28N\n2-15H" },
    { item: "String", s1: "7-7", s2: "10-10H\n6-9N E", s3: "20-5N\n33-4H", s4: "31-4N\n22-10H", s5: "27-10N\n32-4H", s6: "5-3N\n5-5H" },
    { item: "Crypt Mushroom", s1: "23-11", s2: "23-6H\n23-6H E", s3: "18-8N\n27-1H", s4: "23-8N\n19-10H", s5: "3-7N\n28-8H", s6: "1-9N\n4-12H" },
    { item: "Crystal Shard", s1: "23-11", s2: "18-6H\n2-10H E", s3: "30-4N\n28-1H", s4: "28-1N\n26-1H", s5: "24-3N\n19-1H", s6: "2-3N\n3-24H" },
    { item: "Firestone", s1: "23-11", s2: "22-4H\n22-4H E", s3: "16-8N\n26-6H", s4: "33-3N\n1-1H", s5: "1-8N\n33-4H", s6: "3-10N\n3-5H" },
    { item: "Metal Ores", s1: "15-9", s2: "11-10H\n3-1H E", s3: "18-6N\n16-2H", s4: "20-3N\n21-1H", s5: "12-6N\n22-6H", s6: "2-12N\n2-15H" },
    { item: "Potent Leaves", s1: "16-9", s2: "19-1H\n19-1H E", s3: "16-7N\n26-4H", s4: "20-4N\n23-5H", s5: "2-2N\n29-7H", s6: "3-13N\n3-16H" },
    { item: "Sunspire Feathers", s1: "18-9", s2: "20-2H\n20-2H E", s3: "16-9N\n28-1H", s4: "27-8N\n2-5H", s5: "18-8N\n1-3H", s6: "2-10N\n2-17H" },
    { item: "Fine Steel", s1: "19-8", s2: "4-3H\n4-9N E", s3: "18-4N\n34-8H", s4: "23-1N\n23-2H", s5: "2-3N\n12-6H", s6: "3-5N\n3-11H" },
    { item: "Grimoire Dust", s1: "20-4", s2: "10-4H\n10-4H E", s3: "16-5N\n27-6H", s4: "20-4N\n14-1H", s5: "2-2N\n23-3H", s6: "2-7N\n6-13H" },
    { item: "Hardwood Lumber", s1: "21-9", s2: "19-1H\n19-1N E", s3: "16-5N\n26-2H", s4: "26-10N\n25-6H", s5: "5-10N\n9-8H", s6: "2-27N\n3-5H" },
    { item: "Midnight Roots", s1: "22-9", s2: "12-6H\n12-6H E", s3: "18-8N\n28-4H", s4: "19-1N\n2-1H", s5: "12-8N\n8-3H", s6: "2-4N\n3-19H" },
    { item: "Dragon Bone", s1: "6-8", s2: "24-7H\n9-4N E", s3: "16-4N\n30-6H", s4: "25-6N\n1-9H", s5: "26-6N\n5-4H", s6: "6-18N\n6-21H" },
    { item: "Meteor Fragments", s1: "9-1", s2: "11-10H\n22-6N E", s3: "16-7N\n16-1H", s4: "21-1N\n1-6H", s5: "1-8N\n30-4H", s6: "2-8N\n2-21H" },
    { item: "Orichalcum Nugget", s1: "5-8", s2: "18-10H\n14-7N E", s3: "16-5N\n26-6H", s4: "20-4N\n1-2H", s5: "9-4N\n6-7H", s6: "2-25N\n2-8H" },
];

// 天赋升级消耗数据 (3星, 4星, 5星)
const costData = [{ "slot": 301, "emblem": 14, "emblemacc": 14, "food": "7,063", "foodacc": "7,063", "iron": "2,511", "ironacc": "2,511", "masteremblem": "", "masteremblemacc": "" }, { "slot": 302, "emblem": 7, "emblemacc": 21, "food": "8,591", "foodacc": "15,654", "iron": "3,054", "ironacc": "5,565", "masteremblem": "", "masteremblemacc": "" }, { "slot": 303, "emblem": 7, "emblemacc": 28, "food": "12,129", "foodacc": "27,783", "iron": "4,312", "ironacc": "9,877", "masteremblem": "", "masteremblemacc": "" }, { "slot": 304, "emblem": 14, "emblemacc": 42, "food": "21,895", "foodacc": "49,678", "iron": "7,784", "ironacc": "17,661", "masteremblem": "", "masteremblemacc": "" }, { "slot": 305, "emblem": 7, "emblemacc": 49, "food": "19,205", "foodacc": "68,883", "iron": "6,828", "ironacc": "24,489", "masteremblem": "", "masteremblemacc": "" }, { "slot": 306, "emblem": 7, "emblemacc": 56, "food": "22,743", "foodacc": "91,626", "iron": "8,086", "ironacc": "32,575", "masteremblem": "", "masteremblemacc": "" }, { "slot": 307, "emblem": 14, "emblemacc": 70, "food": "36,727", "foodacc": "128,353", "iron": "13,057", "ironacc": "45,632", "masteremblem": "", "masteremblemacc": "" }, { "slot": 308, "emblem": 17, "emblemacc": 87, "food": "31,352", "foodacc": "159,705", "iron": "11,145", "ironacc": "56,777", "masteremblem": "", "masteremblemacc": "" }, { "slot": 309, "emblem": 7, "emblemacc": 94, "food": "33,356", "foodacc": "193,061", "iron": "11,860", "ironacc": "68,637", "masteremblem": "", "masteremblemacc": "" }, { "slot": 310, "emblem": 17, "emblemacc": 111, "food": "38,792", "foodacc": "231,853", "iron": "13,789", "ironacc": "82,426", "masteremblem": "", "masteremblemacc": "" }, { "slot": 311, "emblem": 7, "emblemacc": 118, "food": "40,432", "foodacc": "272,285", "iron": "14,376", "ironacc": "96,802", "masteremblem": "", "masteremblemacc": "" }, { "slot": 312, "emblem": 14, "emblemacc": 132, "food": "61,448", "foodacc": "333,733", "iron": "21,845", "ironacc": "118,647", "masteremblem": "", "masteremblemacc": "" }, { "slot": 313, "emblem": 7, "emblemacc": 139, "food": "47,507", "foodacc": "381,240", "iron": "16,891", "ironacc": "135,538", "masteremblem": "", "masteremblemacc": "" }, { "slot": 314, "emblem": 7, "emblemacc": 146, "food": "51,045", "foodacc": "432,285", "iron": "18,149", "ironacc": "153,687", "masteremblem": "", "masteremblemacc": "" }, { "slot": 315, "emblem": 14, "emblemacc": 160, "food": "76,280", "foodacc": "508,565", "iron": "27,118", "ironacc": "180,805", "masteremblem": "", "masteremblemacc": "" }, { "slot": 316, "emblem": 7, "emblemacc": 167, "food": "58,121", "foodacc": "566,686", "iron": "20,665", "ironacc": "201,470", "masteremblem": "", "masteremblemacc": "" }, { "slot": 317, "emblem": 7, "emblemacc": 174, "food": "61,658", "foodacc": "628,344", "iron": "21,923", "ironacc": "223,393", "masteremblem": "", "masteremblemacc": "" }, { "slot": 318, "emblem": 7, "emblemacc": 181, "food": "65,196", "foodacc": "693,540", "iron": "23,181", "ironacc": "246,574", "masteremblem": "", "masteremblemacc": "" }, { "slot": 319, "emblem": 17, "emblemacc": 198, "food": "72,270", "foodacc": "765,810", "iron": "25,690", "ironacc": "272,264", "masteremblem": "", "masteremblemacc": "" }, { "slot": 320, "emblem": 35, "emblemacc": 233, "food": "98,226", "foodacc": "864,036", "iron": "34,920", "ironacc": "307,184", "masteremblem": "", "masteremblemacc": "" }, { "slot": 321, "emblem": 30, "emblemacc": 263, "food": "80,000", "foodacc": "944,036", "iron": "80,000", "ironacc": "387,184", "masteremblem": "3", "masteremblemacc": "3" }, { "slot": 322, "emblem": 30, "emblemacc": 293, "food": "80,000", "foodacc": "1,024,036", "iron": "80,000", "ironacc": "467,184", "masteremblem": "3", "masteremblemacc": "6" }, { "slot": 323, "emblem": 30, "emblemacc": 323, "food": "80,000", "foodacc": "1,104,036", "iron": "80,000", "ironacc": "547,184", "masteremblem": "3", "masteremblemacc": "9" }, { "slot": 324, "emblem": 30, "emblemacc": 353, "food": "80,000", "foodacc": "1,184,036", "iron": "80,000", "ironacc": "627,184", "masteremblem": "3", "masteremblemacc": "12" }, { "slot": 325, "emblem": 30, "emblemacc": 383, "food": "80,000", "foodacc": "1,264,036", "iron": "80,000", "ironacc": "707,184", "masteremblem": "3", "masteremblemacc": "15" }, { "slot": 401, "emblem": 30, "emblemacc": 30, "food": "17,658", "foodacc": "17,658", "iron": "6,278", "ironacc": "6,278", "masteremblem": "", "masteremblemacc": "" }, { "slot": 402, "emblem": 15, "emblemacc": 45, "food": "21,481", "foodacc": "39,139", "iron": "7,638", "ironacc": "13,916", "masteremblem": "", "masteremblemacc": "" }, { "slot": 403, "emblem": 15, "emblemacc": 60, "food": "30,326", "foodacc": "69,465", "iron": "10,783", "ironacc": "24,699", "masteremblem": "", "masteremblemacc": "" }, { "slot": 404, "emblem": 30, "emblemacc": 90, "food": "54,739", "foodacc": "124,204", "iron": "19,461", "ironacc": "44,160", "masteremblem": "", "masteremblemacc": "" }, { "slot": 405, "emblem": 15, "emblemacc": 105, "food": "48,016", "foodacc": "172,220", "iron": "17,073", "ironacc": "61,233", "masteremblem": "", "masteremblemacc": "" }, { "slot": 406, "emblem": 15, "emblemacc": 120, "food": "56,862", "foodacc": "229,082", "iron": "20,218", "ironacc": "81,451", "masteremblem": "", "masteremblemacc": "" }, { "slot": 407, "emblem": 30, "emblemacc": 150, "food": "91,821", "foodacc": "320,903", "iron": "32,645", "ironacc": "114,096", "masteremblem": "", "masteremblemacc": "" }, { "slot": 408, "emblem": 40, "emblemacc": 190, "food": "78,375", "foodacc": "399,278", "iron": "27,865", "ironacc": "141,961", "masteremblem": "", "masteremblemacc": "" }, { "slot": 409, "emblem": 15, "emblemacc": 205, "food": "83,397", "foodacc": "482,675", "iron": "29,653", "ironacc": "171,614", "masteremblem": "", "masteremblemacc": "" }, { "slot": 410, "emblem": 40, "emblemacc": 245, "food": "96,973", "foodacc": "579,648", "iron": "34,477", "ironacc": "206,091", "masteremblem": "", "masteremblemacc": "" }, { "slot": 411, "emblem": 15, "emblemacc": 260, "food": "101,000", "foodacc": "680,648", "iron": "35,944", "ironacc": "242,035", "masteremblem": "", "masteremblemacc": "" }, { "slot": 412, "emblem": 30, "emblemacc": 290, "food": "153,000", "foodacc": "833,648", "iron": "54,618", "ironacc": "296,653", "masteremblem": "", "masteremblemacc": "" }, { "slot": 413, "emblem": 15, "emblemacc": 305, "food": "118,000", "foodacc": "951,648", "iron": "42,234", "ironacc": "338,887", "masteremblem": "", "masteremblemacc": "" }, { "slot": 414, "emblem": 15, "emblemacc": 320, "food": "127,000", "foodacc": "1,078,648", "iron": "45,379", "ironacc": "384,266", "masteremblem": "", "masteremblemacc": "" }, { "slot": 415, "emblem": 30, "emblemacc": 350, "food": "190,000", "foodacc": "1,268,648", "iron": "67,802", "ironacc": "452,068", "masteremblem": "", "masteremblemacc": "" }, { "slot": 416, "emblem": 15, "emblemacc": 365, "food": "145,000", "foodacc": "1,413,648", "iron": "51,669", "ironacc": "503,737", "masteremblem": "", "masteremblemacc": "" }, { "slot": 417, "emblem": 15, "emblemacc": 380, "food": "154,000", "foodacc": "1,567,648", "iron": "54,814", "ironacc": "558,551", "masteremblem": "", "masteremblemacc": "" }, { "slot": 418, "emblem": 15, "emblemacc": 395, "food": "163,000", "foodacc": "1,730,648", "iron": "57,959", "ironacc": "616,510", "masteremblem": "", "masteremblemacc": "" }, { "slot": 419, "emblem": 40, "emblemacc": 435, "food": "180,000", "foodacc": "1,910,648", "iron": "64,232", "ironacc": "680,742", "masteremblem": "", "masteremblemacc": "" }, { "slot": 420, "emblem": 70, "emblemacc": 505, "food": "245,000", "foodacc": "2,155,648", "iron": "87,315", "ironacc": "768,057", "masteremblem": "", "masteremblemacc": "" }, { "slot": 421, "emblem": 50, "emblemacc": 555, "food": "200,000", "foodacc": "2,355,648", "iron": "200,000", "ironacc": "968,057", "masteremblem": "5", "masteremblemacc": "5" }, { "slot": 422, "emblem": 50, "emblemacc": 605, "food": "200,000", "foodacc": "2,555,648", "iron": "200,000", "ironacc": "1,168,057", "masteremblem": "5", "masteremblemacc": "10" }, { "slot": 423, "emblem": 50, "emblemacc": 655, "food": "200,000", "foodacc": "2,755,648", "iron": "200,000", "ironacc": "1,368,057", "masteremblem": "5", "masteremblemacc": "15" }, { "slot": 424, "emblem": 50, "emblemacc": 705, "food": "200,000", "foodacc": "2,955,648", "iron": "200,000", "ironacc": "1,568,057", "masteremblem": "5", "masteremblemacc": "20" }, { "slot": 425, "emblem": 50, "emblemacc": 755, "food": "200,000", "foodacc": "3,155,648", "iron": "200,000", "ironacc": "1,768,057", "masteremblem": "5", "masteremblemacc": "25" }, { "slot": 501, "emblem": 65, "emblemacc": 65, "food": "49,050", "foodacc": "49,050", "iron": "17,200", "ironacc": "17,200", "masteremblem": "", "masteremblemacc": "" }, { "slot": 502, "emblem": 50, "emblemacc": 115, "food": "59,670", "foodacc": "108,720", "iron": "21,080", "ironacc": "38,280", "masteremblem": "", "masteremblemacc": "" }, { "slot": 503, "emblem": 50, "emblemacc": 165, "food": "84,240", "foodacc": "192,960", "iron": "29,760", "ironacc": "68,040", "masteremblem": "", "masteremblemacc": "" }, { "slot": 504, "emblem": 65, "emblemacc": 230, "food": "152,000", "foodacc": "344,960", "iron": "53,320", "ironacc": "121,360", "masteremblem": "", "masteremblemacc": "" }, { "slot": 505, "emblem": 50, "emblemacc": 280, "food": "133,000", "foodacc": "477,960", "iron": "47,120", "ironacc": "168,480", "masteremblem": "", "masteremblemacc": "" }, { "slot": 506, "emblem": 50, "emblemacc": 330, "food": "157,000", "foodacc": "634,960", "iron": "55,800", "ironacc": "224,280", "masteremblem": "", "masteremblemacc": "" }, { "slot": 507, "emblem": 65, "emblemacc": 395, "food": "255,000", "foodacc": "889,960", "iron": "89,440", "ironacc": "313,720", "masteremblem": "", "masteremblemacc": "" }, { "slot": 508, "emblem": 80, "emblemacc": 475, "food": "217,000", "foodacc": "1,106,960", "iron": "77,880", "ironacc": "391,600", "masteremblem": "", "masteremblemacc": "" }, { "slot": 509, "emblem": 50, "emblemacc": 525, "food": "231,000", "foodacc": "1,337,960", "iron": "81,840", "ironacc": "473,440", "masteremblem": "", "masteremblemacc": "" }, { "slot": 510, "emblem": 80, "emblemacc": 605, "food": "269,000", "foodacc": "1,606,960", "iron": "96,360", "ironacc": "569,800", "masteremblem": "", "masteremblemacc": "" }, { "slot": 511, "emblem": 50, "emblemacc": 655, "food": "280,000", "foodacc": "1,886,960", "iron": "99,200", "ironacc": "669,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 512, "emblem": 65, "emblemacc": 720, "food": "426,000", "foodacc": "2,312,960", "iron": "149,000", "ironacc": "818,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 513, "emblem": 50, "emblemacc": 770, "food": "329,000", "foodacc": "2,641,960", "iron": "116,000", "ironacc": "934,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 514, "emblem": 50, "emblemacc": 820, "food": "354,000", "foodacc": "2,995,960", "iron": "125,000", "ironacc": "1,059,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 515, "emblem": 65, "emblemacc": 885, "food": "529,000", "foodacc": "3,524,960", "iron": "185,000", "ironacc": "1,244,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 516, "emblem": 50, "emblemacc": 935, "food": "403,000", "foodacc": "3,927,960", "iron": "142,000", "ironacc": "1,386,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 517, "emblem": 50, "emblemacc": 985, "food": "428,000", "foodacc": "4,355,960", "iron": "151,000", "ironacc": "1,537,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 518, "emblem": 50, "emblemacc": 1035, "food": "452,000", "foodacc": "4,807,960", "iron": "159,000", "ironacc": "1,696,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 519, "emblem": 80, "emblemacc": 1115, "food": "501,000", "foodacc": "5,308,960", "iron": "179,000", "ironacc": "1,875,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 520, "emblem": 125, "emblemacc": 1240, "food": "682,000", "foodacc": "5,990,960", "iron": "234,000", "ironacc": "2,109,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 521, "emblem": 100, "emblemacc": 1340, "food": "400,000", "foodacc": "6,390,960", "iron": "400,000", "ironacc": "2,509,000", "masteremblem": "10", "masteremblemacc": "10" }, { "slot": 522, "emblem": 100, "emblemacc": 1440, "food": "400,000", "foodacc": "6,790,960", "iron": "400,000", "ironacc": "2,909,000", "masteremblem": "10", "masteremblemacc": "20" }, { "slot": 523, "emblem": 100, "emblemacc": 1540, "food": "400,000", "foodacc": "7,190,960", "iron": "400,000", "ironacc": "3,309,000", "masteremblem": "10", "masteremblemacc": "30" }, { "slot": 524, "emblem": 100, "emblemacc": 1640, "food": "400,000", "foodacc": "7,590,960", "iron": "400,000", "ironacc": "3,709,000", "masteremblem": "10", "masteremblemacc": "40" }, { "slot": 525, "emblem": 100, "emblemacc": 1740, "food": "400,000", "foodacc": "7,990,960", "iron": "400,000", "ironacc": "4,109,000", "masteremblem": "10", "masteremblemacc": "50" }];

// 聊天模拟器表情列表
const emojiList = ['smile', 'grin', 'lol', 'rofl', 'sad', 'crying', 'blush', 'rolleyes', 'kiss', 'love', 'geek', 'monocle', 'think', 'tongue', 'cool', 'horror', 'angry', 'evil', 'hand', 'thumbsup', 'thumbsdown', 'hankey', 'ham', 'alien', 'ghost', 'richard', 'mage', 'magered', 'staff', 'heart', 'heartblue', 'heartgreen', 'heartyellow', 'heartpurple', 'pizza', 'cake', 'donut', 'coffee', 'sword', 'swords', 'axe', 'axes', 'hammer', 'helmet', 'skull', 'bunny', 'cat', 'catgrey', 'dog', 'butterfly', 'butterflyblue', 'fox', 'flower', 'sunflower', 'palmtree', 'splash', 'teardrop', 'fire', 'lightning', 'star', 'elementfire', 'elementice', 'elementnature', 'elementholy', 'elementdark'];

// --- 硬编码日期 (用于特殊筛选) ---
const oneClickMaxDate = '2025-09-29';
const purchaseCostumeDate = '2025-07-28';

// Nynaeve 技能类型的英文排序标准 (用于多语言排序)
const nynaeveSkillTypeOrder = [
    'Snipers', 'AoE Attackers (Hit-3)', 'AoE Attackers (Hit-5)', 'Chain & Random Attackers', 'DoT Attackers',
    'Revivers', 'Healers', 'Health Boosters', 'Heal over Time (HoT)', 'Healers (Special)', 'Dancers',
    'Mega Minions Summoners', 'Minions Summoners', 'Fiends Summoners', 'Taunters', 'Bypassers', 'Healing Reducers',
    'Ability Scores Modifiers', 'Negative Effects On Self Or Allies', 'Board Alterers', 'Buff Blockers',
    'Buff Stealers', 'Buffers (ATK)', 'Buffers (DEF)', 'Cleanse Blockers', 'Cleansers', 'Counterattackers',
    'Damage Reducers', 'Damage Sharers', 'Debuffers (ATK)', 'Debuffers (DEF)', 'Dispellers', 'Dodgers',
    'Effect Duration Resetters', 'Extra Damage Dealers', 'Fiends Counters', 'Ghost Form & Hiding', 'Immunity Providers',
    'Mana Corruption', 'Mana Generation Buffers', 'Mana Raisers', 'Mana Reducers or Blockers', 'Max Health Reducers',
    'Mindless Attack & Mindless Heal', 'Minions Boosters', 'Minions Counters', 'Random Position', 'Reflectors',
    'Resurrection Inhibitors', 'Silencers', 'Sleepweavers', 'Stacking Heroes', 'Status Effects Blockers', 'Status Effect Conversion'
];

// ▼▼▼▼▼ 技能标签回溯表 (繁中/英文 -> 简体中文键名) ▼▼▼▼▼
// 文件: data.js (添加或替换为这个最终版本)

// ▼▼▼▼▼【最终版】技能标签回溯表 (繁中/英文 -> 简体中文) ▼▼▼▼▼
const skillTagReverseMap = {
    // --- 繁體中文 -> 简体中文 ---
    "基礎技能": "基础技能", "治療：即時": "治疗：即时", "治療：生命值加成": "治疗：提高生命", "攻擊：單一目標": "攻击：单体", "攻擊：全體": "攻击：全体", "攻擊：小範圍": "攻击：范围", "復活": "复活", "治療：持續恢復": "治疗：持续", "攻擊：隨機": "攻击：随机", "攻擊：鄰近輕傷": "攻击：邻近轻伤", "攻擊：數量變化": "攻击：数量变化", "攻擊：兩側": "攻击：两侧", "攻擊：持續傷害": "攻击：持续伤害", "治療：特殊": "治疗：特殊", "治療：傷害量": "治疗：伤害量",
    "特殊效果": "特殊效果", "淨化狀態異常": "净化状态异常", "法力偷取": "法力偷取", "驅散增益": "驱散增益", "穿透/繞過": "穿透/绕过", "透過傷害治療": "通过伤害治疗", "面板：攻擊力": "面板：攻击力", "連鎖": "连锁", "摧毀小兵": "摧毁小兵", "恢復法力（擊殺）": "法力恢复（击杀）", "惡魔": "恶魔", "增益重新分配": "增益重新分配", "法力恢復": "法力恢复", "奪取小兵": "偷取小兵", "削減法力": "削减法力", "小兵": "小兵", "偷取增益": "偷取增益", "额外傷害": "额外伤害", "吞噬黏液": "吞噬粘物", "減少狀態異常回合": "减少状态异常回合", "穿透小兵": "穿透小兵", "摧毀惡魔": "摧毁恶魔", "負面效果重新分配": "负面效果重新分配", "额外攻擊": "额外攻击", "重置增益回合": "重置增益回合", "疊加：法力生成": "叠加：法力生成", "疊加：生命恢復": "叠加：生命恢复", "摧毀小兵獲得法力": "摧毁小兵获得法力", "透過小兵治療": "通过小兵治疗", "爆炸": "爆炸", "面板：法力生成": "面板：法力生成", "回溯/偷取技能": "回溯/偷取技能", "賭博/隨機效果": "赌博/随机效果", "面板：傷害": "面板：伤害", "重置負面效果回合": "重置负面效果回合", "移除小兵造成傷害": "移除小兵造成伤害", "面板：生命恢復": "面板：生命恢复", "無視閃避": "无视闪避", "面板：防禦力": "面板：防御力", "疊加：持續傷害": "叠加：持续伤害", "面板：暴擊": "面板：暴击", "超級小兵": "超级小兵", "超級惡魔": "超级恶魔",
    "增益效果": "增益效果", "成長：攻擊力": "成长：攻击力", "暴擊率↑": "暴击率↑", "攻擊力↑": "攻击力↑", "法力生成↑": "法力生成↑", "防禦力↑": "防御力↑", "疊加：防禦力↑": "叠加：防御力↑", "疊加：攻擊力↑": "叠加：攻击力↑", "防禦↑：對火": "防御↑：火焰", "反彈負面效果": "反弹负面效果", "傷害↑": "伤害↑", "治療量↑": "治疗量↑", "傷害↑：對神聖": "伤害↑：神圣", "嘲諷": "嘲讽", "替換為增益": "替换为增益", "反擊/反彈": "反击/反弹", "反擊/反彈：冰霜": "反击/反弹：冰霜", "反擊/反彈：黑暗": "反击/反弹：暗黑", "反擊/反彈：火焰": "反击/反弹：火焰", "反擊/反彈：神聖": "反击/反弹：神圣", "反擊/反彈：自然": "反击/反弹：自然", "傷害減免": "伤害减免", "閃避": "闪避", "免疫狀態異常": "免疫状态异常", "成長：防禦力": "成长：防御力", "阻止負面效果": "阻止负面效果", "擬態": "拟态", "阻止增益驅散": "阻止增益驱散", "復活：施法者": "复活：施法者", "傷害分擔": "伤害分担", "防禦↑：對特殊技能": "防御↑：特殊技能", "傷害↑：對自然": "伤害↑：自然", "躲藏/幽靈形態": "潜行/幽灵形态", "恢復": "恢复", "特殊技能傷害↑": "特殊技能伤害↑", "防禦↑：對自然": "防御↑：自然", "傷害↑：對火焰": "伤害↑：火焰", "傷害↑：對冰霜": "伤害↑：冰霜", "自我減益": "自我减益", "傷害↑：對黑暗": "伤害↑：暗黑", "防禦↑：對神聖": "防御↑：神圣", "增益被驅散時造成傷害": "增益被驱散时造成伤害", "阻止最大生命值↓": "阻止最大生命值↓", "自我復活": "自我复活", "防禦↑：對冰霜": "防御↑：冰霜", "防禦↑：對黑暗": "防御↑：暗黑", "防禦↑：對惡魔": "防御↑：恶魔", "阻止惡魔": "阻止恶魔", "阻止復活": "阻止复活", "自我恢復": "自我恢复",
    "负面效果": "负面效果", "增益無效化": "增益无效化", "持續傷害：毒": "持续伤害：毒", "持續傷害：流血": "持续伤害：流血", "受到傷害↑": "受到伤害↑", "命中率↓": "命中率↓", "最大生命值↓": "最大生命值↓", "持續傷害：燃燒": "持续伤害：燃烧", "瘋狂": "狂乱", "混亂/沉默/睡眠": "混乱/沉默/睡眠", "攻擊力↓": "攻击力↓", "防禦力↓": "防御力↓", "持續傷害：水": "持续伤害：水", "阻止淨化": "阻止净化", "法力生成↓/阻止": "法力生成↓/阻止", "枯萎：攻擊力": "衰退：攻击力", "防禦↓：對黑暗": "防御↓：暗黑", "替換為負面效果": "替换为负面效果", "持續傷害：沙": "持续伤害：沙", "疊加：受到傷害↑": "叠加：受到伤害↑", "疊加：防禦力↓": "叠加：防御力↓", "疊加：法力生成↓": "叠加：法力生成↓", "持續傷害：詛咒": "持续伤害：诅咒", "麻痹": "麻痹", "治療量↓": "治疗量↓", "反彈增益": "反弹增益", "減少增益回合": "减少增益回合", "防禦↓：對特殊技能": "防御↓：特殊技能", "防禦↓：對自然": "防御↓：自然", "改變顏色/位置": "改变颜色/位置", "阻止小兵": "阻止小兵", "持續傷害：霜凍": "持续伤害：冰冻", "法力奪取": "法力偷取", "負面效果被凈化時造成傷害": "负面效果被净化时造成伤害", "奪取治療": "偷取治疗", "初始化負面效果回合": "初始化负面效果回合", "防禦↓：對冰霜": "防御↓：冰霜", "阻止治療": "阻止治疗", "防禦↓：對火焰": "防御↓：火焰", "枯萎：防禦力": "衰退：防御力", "天赋技能無效化": "天赋技能无效化", "防禦↓：對神聖": "防御↓：神圣", "攻擊力↓：對黑暗": "攻击力↓：暗黑", "生命奪取": "生命偷取", "疊加：攻擊力↓": "叠加：攻击力↓",

    // --- English -> 简体中文 ---
    "Base Skill": "基础技能", "Heal: Instant": "治疗：即时", "Heal: Boost": "治疗：提高生命", "Attack: Single": "攻击：单体", "Attack: All": "攻击：全体", "Attack: Small Area / Minor": "攻击：范围", "Revive": "复活", "Heal: Over Time (HoT)": "治疗：持续", "Attack: Random": "攻击：随机", "Attack: Target and Nearby": "攻击：邻近轻伤", "Attack: Variable": "攻击：数量变化", "Attack: Both Ends": "攻击：两侧", "Attack: Damage over Time (DoT)": "攻击：持续伤害", "Heal: Special": "治疗：特殊", "Heal: From Damage Dealt": "治疗：伤害量",
    "Special Ability": "特殊效果", "Cleanse Status Ailments": "净化状态异常", "Mana Steal": "法力偷取", "Dispel Buffs": "驱散增益", "Bypass (Defensive Buffs)": "穿透/绕过", "Heal from Damage": "通过伤害治疗", "Transform: Attack Power": "面板：提高伤害", "Chain Attack": "连锁", "Destroy Minions": "摧毁小兵", "Mana on Kill": "法力恢复（击杀）", "Fiend": "恶魔", "Redistribute Buffs": "增益重新分配", "Mana Recovery": "法力恢复", "Steal Minions": "偷取小兵", "Mega Minion": "超级小兵", "Mega Fiend": "超级恶魔", "Transform: Attack": "面板：攻击力", "Mana Cut": "削减法力", "Minion": "小兵", "Steal Buffs": "偷取增益", "Extra Damage": "额外伤害", "Devouring Goo": "吞噬粘物", "Reduce Ailment Duration": "减少状态异常回合", "Bypass Minions": "穿透小兵", "Destroy Fiends": "摧毁恶魔", "Redistribute Ailments": "负面效果重新分配", "Extra Attack": "额外攻击", "Reset Buff Duration": "重置增益回合", "Stack: Mana Generation": "叠加：法力生成", "Stack: Health Recovery": "叠加：生命恢复", "Mana from Destroyed Minions": "摧毁小兵获得法力", "Heal from Minions": "通过小兵治疗", "Explosion / Detonation": "爆炸", "Transform: Mana Generation": "面板：法力生成", "Copy / Steal Skill": "回溯/偷取技能", "Gamble / Random Effect": "赌博/随机效果", "Transform: Damage": "面板：伤害", "Reset Ailment Duration": "重置负面效果回合", "Damage on Minion Removal": "移除小兵造成伤害", "Transform: Health Recovery": "面板：生命恢复", "Bypass Dodge": "无视闪避", "Transform: Defense": "面板：防御力", "Stack: DOT": "叠加：持续伤害", "Transform: Critical Chance": "面板：暴击",
    "Buffs": "增益效果", "Growth: Attack": "成长：攻击力", "Critical Chance ↑": "暴击率↑", "Attack ↑": "攻击力↑", "Mana Generation ↑": "法力生成↑", "Defense ↑": "防御力↑", "Stack: Defense ↑": "叠加：防御力↑", "Stack: Attack ↑": "叠加：攻击力↑", "Defense ↑ : Fire": "防御↑：火焰", "Reflect Ailments": "反弹负面效果", "Damage ↑": "伤害↑", "Healing Amount ↑": "治疗量↑", "Damage ↑ : Holy": "伤害↑：神圣", "Taunt": "嘲讽", "Convert to Buff": "替换为增益", "Counterattack / Reflect": "反击/反弹", "Counterattack / Reflect : Ice": "反击/反弹：冰霜", "Counterattack / Reflect : Dark": "反击/反弹：暗黑", "Counterattack / Reflect : Fire": "反击/反弹：火焰", "Counterattack / Reflect : Holy": "反击/反弹：神圣", "Counterattack / Reflect : Nature": "反击/反弹：自然", "Damage Reduction": "伤害减免", "Dodge": "闪避", "Immunity to Status Ailments": "免疫状态异常", "Growth: Defense": "成长：防御力", "Block Ailments": "阻止负面效果", "Mimic": "拟态", "Block Buff Dispelling": "阻止增益驱散", "Revive: Caster": "复活：施法者", "Damage Share": "伤害分担", "Defense ↑ : Special Skills": "防御↑：特殊技能", "Damage ↑ : Nature": "伤害↑：自然", "hidden / Ghost Form": "潜行/幽灵形态", "Recovery": "恢复", "Special Skill Damage ↑": "特殊技能伤害↑", "Defense ↑ : Nature": "防御↑：自然", "Damage ↑ : Fire": "伤害↑：火焰", "Damage ↑ : Ice": "伤害↑：冰霜", "Self-Debuff": "自我减益", "Damage ↑ : Dark": "伤害↑：暗黑", "Defense ↑ : Holy": "防御↑：神圣", "Damage on Buff Dispel": "增益被驱散时造成伤害", "Block Max Health ↓": "阻止最大生命值↓", "Self-Revive": "自我复活", "Defense ↑ : Ice": "防御↑：冰霜", "Defense ↑ : Dark": "防御↑：暗黑", "Defense ↑ : Fiends": "防御↑：恶魔", "Block Fiends": "阻止恶魔", "Block Revive": "阻止复活", "Self-Heal": "自我恢复",
    "Debuffs": "负面效果", "Buff Immunity / Block Buffs": "增益无效化", "DoT: Poison": "持续伤害：毒", "DoT: Bleed": "持续伤害：流血", "Increased Damage Taken ↑": "受到伤害↑", "Accuracy ↓": "命中率↓", "Max Health ↓": "最大生命值↓", "DoT: Burn": "持续伤害：燃烧", "Madness": "狂乱", "Confusion / Silence / Sleep": "混乱/沉默/睡眠", "Attack ↓": "攻击力↓", "Defense ↓": "防御力↓", "DoT: Water": "持续伤害：水", "Block Cleanse": "阻止净化", "Mana Generation ↓ / Block": "法力生成↓/阻止", "Weaken: Attack": "衰退：攻击力", "Defense ↓ : Dark": "防御↓：暗黑", "Convert to Ailment": "替换为负面效果", "DoT: Sand": "持续伤害：沙", "Stack: Increased Damage Taken ↑": "叠加：受到伤害↑", "Stack: Defense ↓": "叠加：防御力↓", "Stack: Mana Generation ↓": "叠加：法力生成↓", "DoT: Curse": "持续伤害：诅咒", "Paralysis": "麻痹", "Healing Amount ↓": "治疗量↓", "Reflect Buff": "反弹增益", "Reduce Buff Duration": "减少增益回合", "Defense ↓ : Special Skills": "防御↓：特殊技能", "Defense ↓ : Nature": "防御↓：自然", "Change Color / Position": "改变颜色/位置", "Block Minions": "阻止小兵", "DoT: Frost": "持续伤害：冰冻", "Mana Drain": "法力偷取", "Damage on Ailment Cleanse": "负面效果被净化时造成伤害", "Steal Healing": "偷取治疗", "Reset Ailment Duration": "初始化负面效果回合", "Defense ↓ : Ice": "防御↓：冰霜", "Block Healing": "阻止治疗", "Defense ↓ : Fire": "防御↓：火焰", "Weaken: Defense": "衰退：防御力", "Disable Special Skill": "天赋技能无效化", "Defense ↓ : Holy": "防御↓：神圣", "Attack ↓ : Dark": "攻击力↓：暗黑", "Health Drain": "生命偷取", "Stack: Attack ↓": "叠加：攻击力↓"
};