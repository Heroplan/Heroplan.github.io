// state.js: 管理应用程序的全局状态。

const state = {
    // --- 核心数据 ---
    allHeroes: [],      // 从JSON加载的所有英雄原始数据
    families_bonus: [], // 从JSON加载的家族加成数据
    family_values: {},  // 从JSON加载的家族/来源等多语言名称映射

    // --- 筛选与显示状态 ---
    filteredHeroes: [], // 当前筛选后显示的英雄列表
    multiSelectFilters: {}, // 存储多选筛选器的当前选中值
    availableOptions: {}, // 缓存每个筛选器的所有可用选项
    currentLang: 'cn',  // 当前语言
    currentSort: { key: 'Release date', direction: 'desc' }, // 当前表格排序规则

    // --- 临时筛选状态 ---
    temporaryFavorites: null, // 用于临时存储分享链接中的收藏列表
    temporaryDateFilter: null,  // 用于临时存储日期筛选条件
    temporaryAcademyFilter: false,

    // --- UI与交互状态 ---
    modalStack: [], // 用于管理模态框的堆栈，支持浏览器后退关闭
    scrollPositions: { // 保存不同视图的滚动位置
        list: { top: 0, left: 0 },
        wanted: { top: 0, left: 0 },
        farming: { top: 0, left: 0 },
        chat: { top: 0, left: 0 }
    },
    // ▼▼▼ 从localStorage加载已兑换的码 ▼▼▼
    redeemedCodes: (() => {
        try {
            const savedCodes = localStorage.getItem('redeemedCodes');
            // 如果localStorage中有数据，则解析并返回一个Set，否则返回一个新的空Set
            return new Set(savedCodes ? JSON.parse(savedCodes) : []);
        } catch (e) {
            console.error("无法从 localStorage 加载兑换码:", e);
            return new Set();
        }
    })(),

    // --- 队伍模拟器状态 ---
    teamSimulatorActive: false,     // 队伍模拟器是否激活
    teamSlots: Array(5).fill(null), // 5个英雄槽位的数据
    swapModeActive: false,          // 是否处于交换英雄模式
    selectedForSwapIndex: -1,       // 在交换模式下被选中的英雄索引
    teamMemberInstanceCounter: 0,   // 为每个加入队伍的英雄实例分配唯一ID
    isViewingSharedTeams: false,    // 是否正在查看分享的队伍
    sharedTeamsDataFromUrl: [],     // 从URL解析出的分享队伍数据

    // --- 抽奖模拟器状态 (位于 state.js) ---
    lotterySimulatorActive: false,    // 新增：抽奖模拟器是否激活
    lotteryAnimationMode: 'full',    // 新增：动画模式的状态，默认为 'full'
    isEditingFeaturedHero: false,   // 是否正在编辑某个精選英雄卡槽
    editingSlotIndex: null,         // 正在编辑的卡槽的索引 (0, 1, 2...)

    // --- 聊天模拟器状态 ---
    isSimulatorInitialized: false,  // 聊天模拟器是否已初始化
    hsv: { h: 0, s: 1, v: 1 },      // 颜色选择器的HSV值
    isDraggingHue: false,           // 是否正在拖动色相滑块
    isDraggingSV: false,            // 是否正在拖动饱和度/亮度面板

    // --- 导入/导出状态 ---
    _tempImportedSettings: null,    // 临时存储从代码中解析出的待导入设置
    skillTagToCategoryMap: {}, // 为技能标签分类映射表提供一个初始空对象

    modalContext: {}, // 新增：用于存储模态框的上下文，例如关闭时的回调
    selectedElementalColor: null,
};