/**
 * ==========================================================================
 * 天赋树系统模块 (Talent Tree System Module)
 * V2 - 修正了路径切换逻辑，完全复刻参考文件的交互行为
 * ==========================================================================
 */
const TalentTree = (() => {
    // 【新增】模块级变量，用于存储当前职业的key，解决图标路径问题
    let currentClassKey = 'ranger'; 

    // --- 模块私有变量 ---

    
    const masterTalentData = { '21_1': { text: '攻击 +50', type: 'choice' }, '21_2': { text: '防御 +60', type: 'choice' }, '22_1': { text: '攻击 +50', type: 'choice' }, '22_2': { text: '防御 +60', type: 'choice' }, '23_1': { text: '生命 +50', type: 'mandatory' }, '24_1': { text: '攻击 +50', type: 'choice' }, '24_2': { text: '防御 +60', type: 'choice' }, '25_1': { text: '生命 +50', type: 'mandatory' }, };
    const classData = {
        'ranger': { name: '游侠', key: 'ranger', data: { '1_1': { text: '游侠天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '游侠天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '游侠天赋', type: 'mandatory' }, '8_1': { text: '防御 +3%', type: 'choice' }, '8_2': { text: '法力 +2%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '攻击 +3%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '游侠天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '游侠天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '生命 +3%', type: 'choice' }, '19_2': { text: '治疗 +2%', type: 'choice' }, '20_1': { text: '暴击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '游侠终极天赋', type: 'mandatory' } } },
        'fighter': { name: '战士', key: 'fighter', data: { '1_1': { text: '战士天赋', type: 'mandatory' }, '2_1': { text: '防御 +18', type: 'choice' }, '2_2': { text: '攻击 +15', type: 'choice' }, '3_1': { text: '攻击 +15', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '战士天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '防御 +18', type: 'choice' }, '6_1': { text: '攻击 +15', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '战士天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '治疗 +2%', type: 'choice' }, '9_1': { text: '防御 +18', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '防御 +3%', type: 'mandatory' }, '11_1': { text: '攻击 +15', type: 'choice' }, '11_2': { text: '防御 +18', type: 'choice' }, '12_1': { text: '战士天赋', type: 'mandatory' }, '13_1': { text: '防御 +18', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '攻击 +15', type: 'choice' }, '15_1': { text: '战士天赋', type: 'mandatory' }, '16_1': { text: '攻击 +15', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '防御 +18', type: 'choice' }, '17_2': { text: '攻击 +15', type: 'choice' }, '18_1': { text: '防御 +18', type: 'mandatory' }, '19_1': { text: '法力 +2%', type: 'choice' }, '19_2': { text: '暴击 +2%', type: 'choice' }, '20_1': { text: '攻击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '战士终极天赋', type: 'mandatory' } } },
        'paladin': { name: '圣骑士', key: 'paladin', data: { '1_1': { text: '圣骑天赋', type: 'mandatory' }, '2_1': { text: '防御 +18', type: 'choice' }, '2_2': { text: '攻击 +15', type: 'choice' }, '3_1': { text: '攻击 +15', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '圣骑天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '防御 +18', type: 'choice' }, '6_1': { text: '攻击 +15', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '圣骑天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '治疗 +2%', type: 'choice' }, '9_1': { text: '防御 +18', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '攻击 +3%', type: 'mandatory' }, '11_1': { text: '攻击 +15', type: 'choice' }, '11_2': { text: '防御 +18', type: 'choice' }, '12_1': { text: '圣骑天赋', type: 'mandatory' }, '13_1': { text: '防御 +18', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '攻击 +15', type: 'choice' }, '15_1': { text: '圣骑天赋', type: 'mandatory' }, '16_1': { text: '攻击 +15', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '防御 +18', type: 'choice' }, '17_2': { text: '攻击 +15', type: 'choice' }, '18_1': { text: '防御 +18', type: 'mandatory' }, '19_1': { text: '法力 +2%', type: 'choice' }, '19_2': { text: '暴击 +2%', type: 'choice' }, '20_1': { text: '防御 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '圣骑士终极天赋', type: 'mandatory' } } },
        'barbarian': { name: '野蛮人', key: 'barbarian', data: { '1_1': { text: '野蛮人天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '生命 +36', type: 'choice' }, '3_1': { text: '生命 +36', type: 'choice' }, '3_2': { text: '防御 +18', type: 'choice' }, '4_1': { text: '野蛮人天赋', type: 'mandatory' }, '5_1': { text: '防御 +18', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '生命 +36', type: 'choice' }, '6_2': { text: '防御 +18', type: 'choice' }, '7_1': { text: '野蛮人天赋', type: 'mandatory' }, '8_1': { text: '治疗 +2%', type: 'choice' }, '8_2': { text: '攻击 +3%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '防御 +18', type: 'choice' }, '10_1': { text: '暴击 +2%', type: 'mandatory' }, '11_1': { text: '生命 +36', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '野蛮人天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '防御 +18', type: 'choice' }, '14_1': { text: '防御 +18', type: 'choice' }, '14_2': { text: '生命 +36', type: 'choice' }, '15_1': { text: '野蛮人天赋', type: 'mandatory' }, '16_1': { text: '生命 +36', type: 'choice' }, '16_2': { text: '防御 +18', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '生命 +36', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '法力 +2%', type: 'choice' }, '19_2': { text: '防御 +3%', type: 'choice' }, '20_1': { text: '生命 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '野蛮人终极天赋', type: 'mandatory' } } },
        'cleric': { name: '牧师', key: 'cleric', data: { '1_1': { text: '牧师天赋', type: 'mandatory' }, '2_1': { text: '生命 +36', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '攻击 +15', type: 'choice' }, '4_1': { text: '牧师天赋', type: 'mandatory' }, '5_1': { text: '攻击 +15', type: 'choice' }, '5_2': { text: '生命 +36', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '攻击 +15', type: 'choice' }, '7_1': { text: '牧师天赋', type: 'mandatory' }, '8_1': { text: '攻击 +3%', type: 'choice' }, '8_2': { text: '防御 +3%', type: 'choice' }, '9_1': { text: '生命 +36', type: 'choice' }, '9_2': { text: '攻击 +15', type: 'choice' }, '10_1': { text: '生命 +3%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '生命 +36', type: 'choice' }, '12_1': { text: '牧师天赋', type: 'mandatory' }, '13_1': { text: '生命 +36', type: 'choice' }, '13_2': { text: '攻击 +15', type: 'choice' }, '14_1': { text: '攻击 +15', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '牧师天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '攻击 +15', type: '' }, '17_1': { text: '生命 +36', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '生命 +36', type: 'mandatory' }, '19_1': { text: '暴击 +2%', type: 'choice' }, '19_2': { text: '法力 +2%', type: 'choice' }, '20_1': { text: '治疗 +2%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '牧师终极天赋', type: 'mandatory' } } },
        'druid': { name: '德鲁伊', key: 'druid', data: { '1_1': { text: '德鲁伊天赋', type: 'mandatory' }, '2_1': { text: '生命 +36', type: 'choice' }, '2_2': { text: '攻击 +15', type: 'choice' }, '3_1': { text: '攻击 +15', type: 'choice' }, '3_2': { text: '防御 +18', type: 'choice' }, '4_1': { text: '德鲁伊天赋', type: 'mandatory' }, '5_1': { text: '防御 +18', type: 'choice' }, '5_2': { text: '生命 +36', type: 'choice' }, '6_1': { text: '攻击 +15', type: 'choice' }, '6_2': { text: '防御 +18', type: 'choice' }, '7_1': { text: '德鲁伊天赋', type: 'mandatory' }, '8_1': { text: '治疗 +2%', type: 'choice' }, '8_2': { text: '攻击 +3%', type: 'choice' }, '9_1': { text: '生命 +36', type: 'choice' }, '9_2': { text: '防御 +18', type: 'choice' }, '10_1': { text: '生命 +3%', type: 'mandatory' }, '11_1': { text: '攻击 +15', type: 'choice' }, '11_2': { text: '生命 +36', type: 'choice' }, '12_1': { text: '德鲁伊天赋', type: 'mandatory' }, '13_1': { text: '生命 +36', type: 'choice' }, '13_2': { text: '防御 +18', type: 'choice' }, '14_1': { text: '防御 +18', type: 'choice' }, '14_2': { text: '攻击 +15', type: 'choice' }, '15_1': { text: '德鲁伊天赋', type: 'mandatory' }, '16_1': { text: '攻击 +15', type: 'choice' }, '16_2': { text: '防御 +18', type: 'choice' }, '17_1': { text: '生命 +36', type: 'choice' }, '17_2': { text: '攻击 +15', type: 'choice' }, '18_1': { text: '生命 +36', type: 'mandatory' }, '19_1': { text: '暴击 +2%', type: 'choice' }, '19_2': { text: '防御 +3%', type: 'choice' }, '20_1': { text: '法力 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '德鲁伊终极天赋', type: 'mandatory' } } },
        'monk': { name: '僧侣', key: 'monk', data: { '1_1': { text: '僧侣天赋', type: 'mandatory' }, '2_1': { text: '生命 +36', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '攻击 +15', type: 'choice' }, '4_1': { text: '僧侣天赋', type: 'mandatory' }, '5_1': { text: '攻击 +15', type: 'choice' }, '5_2': { text: '生命 +36', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '攻击 +15', type: 'choice' }, '7_1': { text: '僧侣天赋', type: 'mandatory' }, '8_1': { text: '防御 +3%', type: 'choice' }, '8_2': { text: '生命 +3%', type: 'choice' }, '9_1': { text: '生命 +36', type: 'choice' }, '9_2': { text: '攻击 +15', type: 'choice' }, '10_1': { text: '暴击 +2%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '生命 +36', type: 'choice' }, '12_1': { text: '僧侣天赋', type: 'mandatory' }, '13_1': { text: '生命 +36', type: 'choice' }, '13_2': { text: '攻击 +15', type: 'choice' }, '14_1': { text: '攻击 +15', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '僧侣天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '攻击 +15', type: 'choice' }, '17_1': { text: '生命 +36', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '生命 +36', type: 'mandatory' }, '19_1': { text: '治疗 +2%', type: 'choice' }, '19_2': { text: '攻击 +3%', type: 'choice' }, '20_1': { text: '法力 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '僧侣终极天赋', type: 'mandatory' } } },
        'rogue': { name: '盗贼', key: 'rogue', data: { '1_1': { text: '盗贼天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '生命 +36', type: 'choice' }, '3_1': { text: '生命 +36', type: 'choice' }, '3_2': { text: '防御 +18', type: 'choice' }, '4_1': { text: '盗贼天赋', type: 'mandatory' }, '5_1': { text: '防御 +18', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '生命 +36', type: 'choice' }, '6_2': { text: '防御 +18', type: 'choice' }, '7_1': { text: '盗贼天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '法力 +2%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '防御 +18', type: 'choice' }, '10_1': { text: '攻击 +3%', type: 'mandatory' }, '11_1': { text: '生命 +36', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '盗贼天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '防御 +18', type: 'choice' }, '14_1': { text: '防御 +18', type: 'choice' }, '14_2': { text: '生命 +36', type: 'choice' }, '15_1': { text: '盗贼天赋', type: 'mandatory' }, '16_1': { text: '生命 +36', type: 'choice' }, '16_2': { text: '防御 +18', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '生命 +36', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '防御 +3%', type: 'choice' }, '19_2': { text: '治疗 +2%', type: 'choice' }, '20_1': { text: '暴击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '盗贼终极天赋', type: 'mandatory' } } },
        'sorcerer': { name: '术士', key: 'sorcerer', data: { '1_1': { text: '术士天赋', type: 'mandatory' }, '2_1': { text: '防御 +18', type: 'choice' }, '2_2': { text: '生命 +36', type: 'choice' }, '3_1': { text: '生命 +36', type: 'choice' }, '3_2': { text: '攻击 +15', type: 'choice' }, '4_1': { text: '术士天赋', type: 'mandatory' }, '5_1': { text: '攻击 +15', type: 'choice' }, '5_2': { text: '防御 +18', type: 'choice' }, '6_1': { text: '生命 +36', type: 'choice' }, '6_2': { text: '攻击 +15', type: 'choice' }, '7_1': { text: '术士天赋', type: 'mandatory' }, '8_1': { text: '治疗 +2%', type: 'choice' }, '8_2': { text: '暴击 +2%', type: 'choice' }, '9_1': { text: '防御 +18', type: 'choice' }, '9_2': { text: '攻击 +15', type: 'choice' }, '10_1': { text: '生命 +3%', type: 'mandatory' }, '11_1': { text: '生命 +36', type: 'choice' }, '11_2': { text: '防御 +18', type: 'choice' }, '12_1': { text: '术士天赋', type: 'mandatory' }, '13_1': { text: '防御 +18', type: 'choice' }, '13_2': { text: '攻击 +15', type: 'choice' }, '14_1': { text: '攻击 +15', type: 'choice' }, '14_2': { text: '生命 +36', type: 'choice' }, '15_1': { text: '术士天赋', type: 'mandatory' }, '16_1': { text: '生命 +36', type: 'choice' }, '16_2': { text: '攻击 +15', type: 'choice' }, '17_1': { text: '防御 +18', type: 'choice' }, '17_2': { text: '生命 +36', type: 'choice' }, '18_1': { text: '防御 +18', type: 'mandatory' }, '19_1': { text: '攻击 +3%', type: 'choice' }, '19_2': { text: '防御 +3%', type: 'choice' }, '20_1': { text: '法力 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '术士终极天赋', type: 'mandatory' } } },
        'wizard': { name: '巫师', key: 'wizard', data: { '1_1': { text: '巫师天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '巫师天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '巫师天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '防御 +3%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '暴击 +2%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '巫师天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '巫师天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '治疗 +2%', type: 'choice' }, '19_2': { text: '法力 +2%', type: 'choice' }, '20_1': { text: '攻击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '巫师终极天赋', type: 'mandatory' } } }
    };
    const classReverseMap = {
        "Barbarian": "barbarian", "野蛮人": "barbarian", "野人": "barbarian",
        "Cleric": "cleric", "牧师": "cleric", "牧師": "cleric",
        "Druid": "druid", "德鲁伊": "druid", "德魯伊": "druid",
        "Fighter": "fighter", "战士": "fighter", "戰士": "fighter",
        "Monk": "monk", "僧侣": "monk", "僧侶": "monk",
        "Paladin": "paladin", "圣骑士": "paladin", "騎士": "paladin",
        "Ranger": "ranger", "游侠": "ranger", "遊俠": "ranger",
        "Rogue": "rogue", "盗贼": "rogue", "盜賊": "rogue",
        "Sorcerer": "sorcerer", "术士": "sorcerer", "術士": "sorcerer",
        "Wizard": "wizard", "巫师": "wizard", "巫師": "wizard"
    };

    let talentData = {};
    let selectedNodes = new Set();
    let currentContainer = null;
    let onStatsChangeCallback = () => { };
    let talentTermsDict = {}; // 【新增】用于存储当前语言的天赋术语字典

    // --- 内部辅助函数 ---

    function _setupTalentData(classKey) {
        // 【修正】当设置天赋数据时，同时在模块变量中保存当前职业的key
        currentClassKey = classKey;
        if (!classData[classKey]) {
            console.error(`未找到职业 '${classKey}' 的天赋数据`);
            talentData = {};
            return;
        }
        talentData = JSON.parse(JSON.stringify(classData[classKey].data));
        const baseUnlocks = { '1_1': ['2_1', '2_2'], '2_1': ['3_1'], '2_2': ['3_2'], '3_1': ['4_1'], '3_2': ['4_1'], '4_1': ['5_1', '5_2'], '5_1': ['6_1'], '5_2': ['6_2'], '6_1': ['7_1'], '6_2': ['7_1'], '7_1': ['8_1', '8_2'], '8_1': ['9_1'], '8_2': ['9_2'], '9_1': ['10_1'], '9_2': ['10_1'], '10_1': ['11_1', '11_2'], '11_1': ['12_1'], '11_2': ['12_1'], '12_1': ['13_1', '13_2'], '13_1': ['14_1'], '13_2': ['14_2'], '14_1': ['15_1'], '14_2': ['15_1'], '15_1': ['16_1', '16_2'], '16_1': ['17_1'], '16_2': ['17_2'], '17_1': ['18_1'], '17_2': ['18_1'], '18_1': ['19_1', '19_2'], '19_1': ['20_1'], '19_2': ['20_1'], '20_1': ['21_1', '21_2'], '21_1': ['22_1'], '21_2': ['22_2'], '22_1': ['23_1'], '22_2': ['23_1'], '23_1': ['24_1', '24_2'], '24_1': ['25_1'], '24_2': ['25_1'], '25_1': ['26_1'], '26_1': [] };
        const basePrereqs = { '1_1': null, '2_1': ['1_1'], '2_2': ['1_1'], '3_1': ['2_1'], '3_2': ['2_2'], '4_1': ['3_1', '3_2'], '5_1': ['4_1'], '5_2': ['4_1'], '6_1': ['5_1'], '6_2': ['5_2'], '7_1': ['6_1', '6_2'], '8_1': ['7_1'], '8_2': ['7_1'], '9_1': ['8_1'], '9_2': ['8_2'], '10_1': ['9_1', '9_2'], '11_1': ['10_1'], '11_2': ['10_1'], '12_1': ['11_1', '11_2'], '13_1': ['12_1'], '13_2': ['12_1'], '14_1': ['13_1'], '14_2': ['13_2'], '15_1': ['14_1', '14_2'], '16_1': ['15_1'], '16_2': ['15_1'], '17_1': ['16_1'], '17_2': ['16_2'], '18_1': ['17_1', '17_2'], '19_1': ['18_1'], '19_2': ['18_1'], '20_1': ['19_1', '19_2'], '21_1': ['20_1'], '21_2': ['20_1'], '22_1': ['21_1'], '22_2': ['21_2'], '23_1': ['22_1', '22_2'], '24_1': ['23_1'], '24_2': ['23_1'], '25_1': ['24_1', '24_2'], '26_1': ['25_1'] };
        const basePositions = { '1_1': { level: 1, index: 0 }, '2_1': { level: 2, index: 0 }, '2_2': { level: 2, index: 1 }, '3_1': { level: 3, index: 0 }, '3_2': { level: 3, index: 1 }, '4_1': { level: 4, index: 0 }, '5_1': { level: 5, index: 0 }, '5_2': { level: 5, index: 1 }, '6_1': { level: 6, index: 0 }, '6_2': { level: 6, index: 1 }, '7_1': { level: 7, index: 0 }, '8_1': { level: 8, index: 0 }, '8_2': { level: 8, index: 1 }, '9_1': { level: 9, index: 0 }, '9_2': { level: 9, index: 1 }, '10_1': { level: 10, index: 0 }, '11_1': { level: 11, index: 0 }, '11_2': { level: 11, index: 1 }, '12_1': { level: 12, index: 0 }, '13_1': { level: 13, index: 0 }, '13_2': { level: 13, index: 1 }, '14_1': { level: 14, index: 0 }, '14_2': { level: 14, index: 1 }, '15_1': { level: 15, index: 0 }, '16_1': { level: 16, index: 0 }, '16_2': { level: 16, index: 1 }, '17_1': { level: 17, index: 0 }, '17_2': { level: 17, index: 1 }, '18_1': { level: 18, index: 0 }, '19_1': { level: 19, index: 0 }, '19_2': { level: 19, index: 1 }, '20_1': { level: 20, index: 0 }, '21_1': { level: 21, index: 0 }, '21_2': { level: 21, index: 1 }, '22_1': { level: 22, index: 0 }, '22_2': { level: 22, index: 1 }, '23_1': { level: 23, index: 0 }, '24_1': { level: 24, index: 0 }, '24_2': { level: 24, index: 1 }, '25_1': { level: 25, index: 0 }, '26_1': { level: 26, index: 0 } };
        Object.keys(talentData).forEach(nodeId => {
            talentData[nodeId].id = nodeId;
            talentData[nodeId].unlocks = baseUnlocks[nodeId];
            talentData[nodeId].prereq = basePrereqs[nodeId];
            talentData[nodeId].position = basePositions[nodeId];
        });
    }

    function _calculateBonuses() {
        const bonuses = {
            attack_flat: 0, defense_flat: 0, health_flat: 0,
            attack_percent: 0, defense_percent: 0, health_percent: 0,
            mana_percent: 0, healing_percent: 0, crit_percent: 0
        };
        selectedNodes.forEach(nodeId => {
            const nodeText = talentData[nodeId]?.text || '';
            const parts = nodeText.split(' ');
            if (parts.length < 2) return;
            const statName = parts[0];
            const valueStr = parts[1];
            const value = parseInt(valueStr.replace(/[+%]/g, ''));
            if (isNaN(value)) return;
            if (nodeText.includes('%')) {
                if (statName === '攻击') bonuses.attack_percent += value;
                else if (statName === '防御') bonuses.defense_percent += value;
                else if (statName === '生命') bonuses.health_percent += value;
                else if (statName === '法力') bonuses.mana_percent += value;
                else if (statName === '治疗') bonuses.healing_percent += value;
                else if (statName === '暴击') bonuses.crit_percent += value;
            } else {
                if (statName === '攻击') bonuses.attack_flat += value;
                else if (statName === '防御') bonuses.defense_flat += value;
                else if (statName === '生命') bonuses.health_flat += value;
            }
        });
        return bonuses;
    }

    function _updateUI() {
        if (selectedNodes.has('25_1')) {
            selectedNodes.add('26_1');
        }
        Object.keys(talentData).forEach(nodeId => {
            const nodeElement = currentContainer.querySelector(`#node-${nodeId}`);
            if (!nodeElement) return;
            const isSelected = selectedNodes.has(nodeId);
            nodeElement.classList.toggle('selected', isSelected);
        });
        currentContainer.querySelectorAll('.connector').forEach(conn => {
            const [startId, endId] = conn.dataset.connects.split('-');
            const isConnActive = selectedNodes.has(startId) && selectedNodes.has(endId) && talentData[endId].prereq.includes(startId);
            conn.classList.toggle('active', isConnActive);
        });

        // 【修正】回调时，同时传递属性加成对象和已选择的节点数量
        let spendablePoints = selectedNodes.size;
        if (selectedNodes.has('26_1')) {
            spendablePoints--; // 最终天赋节点不计入消耗
        }
        onStatsChangeCallback(_calculateBonuses(), spendablePoints);
    }

    // ---【逻辑复刻】从参考文件完整移植的交互逻辑函数 ---

    const _findForkNode = (startNodeId) => {
        let q = [startNodeId];
        let visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            const node = talentData[currentId];
            if (!node.prereq) return talentData['1_1'];
            for (const parentId of node.prereq) {
                if (talentData[parentId].type === 'mandatory') return talentData[parentId];
                if (!visited.has(parentId)) { visited.add(parentId); q.push(parentId); }
            }
        }
        return talentData['1_1'];
    };

    const _findMergeNode = (startNodeId) => {
        let q = [startNodeId];
        let visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            const node = talentData[currentId];
            if (!node.unlocks || node.unlocks.length === 0) return null;
            for (const childId of node.unlocks) {
                if (talentData[childId].type === 'mandatory') return talentData[childId];
                if (!visited.has(childId)) { visited.add(childId); q.push(childId); }
            }
        }
        return null;
    };

    const _getSmartPath = (targetNodeId) => {
        // 【核心修正】使用递归算法，智能寻找连接到已选节点的最短路径

        // 内部递归辅助函数
        function findShortestPath(nodeId) {
            // 基本情况1: 如果当前节点已经是亮的，我们找到了连接点，返回路径
            if (selectedNodes.has(nodeId)) {
                return [nodeId];
            }

            const nodeInfo = talentData[nodeId];
            // 基本情况2: 如果到达了根节点（没有父节点），返回路径
            if (!nodeInfo || !nodeInfo.prereq) {
                return [nodeId];
            }

            let bestPath = null;

            // 探索所有父路径
            for (const parentId of nodeInfo.prereq) {
                const subPath = findShortestPath(parentId);
                if (subPath) {
                    // 如果找到了第一条路径，或者找到了更短的路径，则更新最佳路径
                    if (bestPath === null || subPath.length < bestPath.length) {
                        bestPath = subPath;
                    }
                }
            }

            // 将当前节点添加到最佳路径的前面并返回
            if (bestPath) {
                return [nodeId, ...bestPath];
            }
            return null; // 理论上不应发生，因为总能回到根节点
        }

        const foundPath = findShortestPath(targetNodeId);
        return new Set(foundPath || []);
    };

    const _findGuidedSegment = (forkNode, mergeNode, viaNodeId) => {
        const segment = new Set();
        let q = [viaNodeId];
        let visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            if (currentId === forkNode.id) break;
            segment.add(currentId);
            if (talentData[currentId].prereq) {
                talentData[currentId].prereq.forEach(p => {
                    if (!visited.has(p)) { visited.add(p); q.push(p); }
                });
            }
        }
        q = [viaNodeId];
        visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            if (currentId === mergeNode.id) break;
            segment.add(currentId);
            if (talentData[currentId].unlocks) {
                talentData[currentId].unlocks.forEach(c => {
                    if (!visited.has(c)) { visited.add(c); q.push(c); }
                });
            }
        }
        return segment;
    }

    function _handleNodeClick(clickedNodeId) {
        if (clickedNodeId === '26_1') return;

        if (selectedNodes.has(clickedNodeId)) {
            const nodesToDeselect = new Set();
            const queue = [clickedNodeId];
            const visited = new Set(queue);
            while (queue.length > 0) {
                const currentId = queue.shift();
                nodesToDeselect.add(currentId);
                talentData[currentId].unlocks.forEach(childId => {
                    if (selectedNodes.has(childId) && !visited.has(childId)) {
                        visited.add(childId);
                        queue.push(childId);
                    }
                });
            }
            nodesToDeselect.forEach(id => selectedNodes.delete(id));
            _updateUI();
            return;
        }

        const clickedNode = talentData[clickedNodeId];
        let isSwitchOperation = false;
        if (clickedNode.type === 'choice') {
            const forkNode = _findForkNode(clickedNodeId);
            const mergeNode = _findMergeNode(clickedNodeId);
            if (forkNode && mergeNode) {
                const q = [...forkNode.unlocks];
                const visited = new Set(q);
                while (q.length > 0) {
                    const currentId = q.shift();
                    if (currentId === mergeNode.id) continue;
                    if (selectedNodes.has(currentId)) { isSwitchOperation = true; break; }
                    if (talentData[currentId] && talentData[currentId].unlocks) {
                        talentData[currentId].unlocks.forEach(childId => {
                            if (!visited.has(childId)) { visited.add(childId); q.push(childId); }
                        });
                    }
                }
            }
        }
        if (isSwitchOperation) {
            const forkNode = _findForkNode(clickedNodeId);
            const mergeNode = _findMergeNode(clickedNodeId);
            const nodesToClear = new Set();
            const q = [...forkNode.unlocks];
            const visited = new Set(q);
            while (q.length > 0) {
                const currentId = q.shift();
                if (currentId === mergeNode.id) continue;
                nodesToClear.add(currentId);
                if (talentData[currentId] && talentData[currentId].unlocks) {
                    talentData[currentId].unlocks.forEach(childId => {
                        if (!visited.has(childId)) { visited.add(childId); q.push(childId); }
                    });
                }
            }
            nodesToClear.forEach(id => selectedNodes.delete(id));
            if (mergeNode && selectedNodes.has(mergeNode.id)) {
                const newSegment = _findGuidedSegment(forkNode, mergeNode, clickedNodeId);
                newSegment.forEach(id => selectedNodes.add(id));
            } else {
                const pathToClickedNode = _getSmartPath(clickedNodeId);
                pathToClickedNode.forEach(id => selectedNodes.add(id));
            }
        } else {
            const fullPath = _getSmartPath(clickedNodeId);
            fullPath.forEach(id => selectedNodes.add(id));
        }

        _updateUI();
    }


    /**
     * 【已修正】根据策略自动选择天赋路径，并根据天赋等级进行裁剪
     * @param {string} strategy - 策略字符串, e.g., 'atk-def-hp'
     * @param {boolean} manaPriority - 是否优先选择法力
     * @param {string} talentLevel - 天赋等级 ('none', 'talent20', 'talent25')
     */
    function _applyAutoPath(strategy, manaPriority, talentLevel) {
        selectedNodes.clear();

        // 如果是“无天赋”，则直接返回一个空路径
        if (talentLevel === 'none') {
            return;
        }

        const weights = { '攻击': 0, '防御': 0, '生命': 0, '法力': 0.5, '治疗': 0, '暴击': 0 };
        const parts = strategy.split('-');
        const statMap = { atk: '攻击', def: '防御', hp: '生命' };
        weights[statMap[parts[0]]] = 4;
        weights[statMap[parts[1]]] = 2;
        weights[statMap[parts[2]]] = 1;
        if (manaPriority) {
            weights['法力'] = 8;
        }

        const getNodeScore = (nodeId) => {
            const nodeText = talentData[nodeId]?.text || '';
            const match = nodeText.match(/^(攻击|防御|生命|法力|治疗|暴击)/);
            if (match) return weights[match[1]] || 0;
            return 0;
        };

        // 总是先计算出完整的25天赋路径
        const mandatoryNodes = Object.keys(talentData).filter(id => talentData[id].type === 'mandatory');
        mandatoryNodes.forEach(id => selectedNodes.add(id));

        const segments = [
            { path1: ['2_1', '3_1'], path2: ['2_2', '3_2'] }, { path1: ['5_1', '6_1'], path2: ['5_2', '6_2'] },
            { path1: ['8_1', '9_1'], path2: ['8_2', '9_2'] }, { path1: ['11_1'], path2: ['11_2'] },
            { path1: ['13_1', '14_1'], path2: ['13_2', '14_2'] }, { path1: ['16_1', '17_1'], path2: ['16_2', '17_2'] },
            { path1: ['19_1'], path2: ['19_2'] }, { path1: ['21_1', '22_1'], path2: ['21_2', '22_2'] },
            { path1: ['24_1'], path2: ['24_2'] },
        ];

        segments.forEach(seg => {
            const score1 = seg.path1.reduce((acc, id) => acc + getNodeScore(id), 0);
            const score2 = seg.path2.reduce((acc, id) => acc + getNodeScore(id), 0);
            const winningPath = (score1 >= score2) ? seg.path1 : seg.path2;
            winningPath.forEach(id => selectedNodes.add(id));
        });

        // 【新增逻辑】如果选择的是20天赋，则移除所有20级以后的节点
        if (talentLevel === 'talent20') {
            const nodesToRemove = [];
            for (const nodeId of selectedNodes) {
                const level = parseInt(nodeId.split('_')[0]);
                if (level > 20) {
                    nodesToRemove.push(nodeId);
                }
            }
            nodesToRemove.forEach(id => selectedNodes.delete(id));
        }
    }

    function _createTreeHTML() {
        if (!currentContainer) return;
        const treeDiv = document.createElement('div');
        treeDiv.className = 'talent-tree';
        const levels = {};
        let maxLevel = 0;
        Object.values(talentData).forEach(node => {
            const level = node.position.level;
            if (!levels[level]) levels[level] = [];
            levels[level].push(node);
            if (level > maxLevel) maxLevel = level;
        });
        for (let i = 1; i <= maxLevel; i++) {
            const levelNodes = levels[i] || [];
            const levelDiv = document.createElement('div');
            levelDiv.className = 'talent-tree-level';
            const leftNode = levelNodes.find(n => n.position.index === 0);
            const rightNode = levelNodes.find(n => n.position.index === 1);
            const leftWrapper = document.createElement('div');
            leftWrapper.className = 'node-wrapper';
            if (leftNode) leftWrapper.appendChild(_createNodeDiv(leftNode.id));
            const rightWrapper = document.createElement('div');
            rightWrapper.className = 'node-wrapper';
            if (rightNode) rightWrapper.appendChild(_createNodeDiv(rightNode.id));
            if (levelNodes.length === 1 && levelNodes[0].position.index === 0) {
                levelDiv.style.justifyContent = 'center';
                levelDiv.appendChild(leftWrapper);
            } else {
                levelDiv.appendChild(leftWrapper);
                levelDiv.appendChild(rightWrapper);
            }
            treeDiv.appendChild(levelDiv);
        }
        Object.keys(talentData).forEach(nodeId => {
            const nodeInfo = talentData[nodeId];
            if (nodeInfo.unlocks) {
                nodeInfo.unlocks.forEach(targetId => {
                    const targetNodeInfo = talentData[targetId];
                    if (targetNodeInfo && targetNodeInfo.prereq && targetNodeInfo.prereq.includes(nodeId)) {
                        const conn = document.createElement('div');
                        conn.className = 'connector';
                        conn.dataset.connects = `${nodeId}-${targetId}`;
                        treeDiv.appendChild(conn);
                    }
                });
            }
        });
        currentContainer.innerHTML = '';
        currentContainer.appendChild(treeDiv);
        _positionConnectors();
    }

    function _createNodeDiv(nodeId) {
        const nodeInfo = talentData[nodeId];
        const nodeDiv = document.createElement('div');
        nodeDiv.id = `node-${nodeId}`;
        nodeDiv.className = `talent-node ${nodeInfo.type}`;

        // 【修正】调用翻译函数来生成节点的title提示文本
        nodeDiv.title = _getTranslatedNodeText(nodeInfo);

        const imageLayers = _getNodeImageLayers(nodeId, nodeInfo);
        imageLayers.forEach(layer => {
            const img = document.createElement('img');
            img.className = layer.class;
            img.src = layer.src;
            img.alt = '';
            nodeDiv.appendChild(img);
        });
        const valueText = _getNodeDisplayValue(nodeInfo);
        if (valueText) {
            const valueSpan = document.createElement('span');
            valueSpan.className = 'node-value';
            valueSpan.textContent = valueText;
            nodeDiv.appendChild(valueSpan);
        }
        nodeDiv.onclick = () => _handleNodeClick(nodeId);
        return nodeDiv;
    }

    /**
     * 【已修正】获取节点图标的图层信息
     * @param {string} nodeId 
     * @param {object} nodeInfo 
     * @returns {Array<object>}
     */
    function _getNodeImageLayers(nodeId, nodeInfo) {
        const images = [];
        const level = parseInt(nodeId.split('_')[0]);
        const text = nodeInfo.text;

        // 【核心修正】将判断条件从 <= 25 扩展为 >= 21，以包含26级的终极天赋节点
        images.push({ src: `imgs/talents/${(level >= 21) ? 'node_master' : 'node'}.webp`, class: 'node-img-base' });

        const statKeywordMap = { '攻击': 'attack.webp', '防御': 'defense.webp', '生命': 'health.webp', '法力': 'mana.webp', '治疗': 'healing.webp', '暴击': 'critical.webp' };
        let iconSrc = null;

        if (text.includes('天赋')) {
            // 使用已正确设置的 currentClassKey，确保图标路径正确
            iconSrc = `imgs/classes/${currentClassKey}.webp`;
        } else {
            for (const keyword in statKeywordMap) {
                if (text.includes(keyword)) {
                    iconSrc = `imgs/talents/${statKeywordMap[keyword]}`;
                    break;
                }
            }
        }

        if (iconSrc) {
            images.push({ src: iconSrc, class: 'node-img-overlay' });
        }
        if (text.includes('%') && !text.includes('法力') && !text.includes('暴击') && !text.includes('治疗')) {
            images.push({ src: 'imgs/talents/plus.webp', class: 'node-img-plus' });
        }
        if (nodeId === '20_1' || nodeId === '26_1') {
            images.push({ src: 'imgs/talents/final.webp', class: 'node-img-final-border' });
        }
        return images;
    }
    
    /**
     * 【新增】根据字典翻译节点描述文本
     * @param {object} nodeInfo 
     * @returns {string} 翻译后的完整节点文本
     */
    function _getTranslatedNodeText(nodeInfo) {
        if (!talentTermsDict) return nodeInfo.text; // 如果字典不存在，返回原文

        const originalText = nodeInfo.text;
        const parts = originalText.split(' ');

        if (parts.length > 1) {
            // 处理 "攻击 +15" 这样的文本
            const termKey = parts[0];
            const value = parts.slice(1).join(' ');
            const translatedTerm = talentTermsDict[termKey] || termKey;
            return `${translatedTerm} ${value}`;
        } else {
            // 处理 "游侠天赋" 这样的完整文本
            return talentTermsDict[originalText] || originalText;
        }
    }

    function _getNodeDisplayValue(nodeInfo) {
        const text = nodeInfo.text;
        if (text.includes('天赋')) return '';
        const match = text.match(/\+\s*(\d+)(%?)/);
        if (!match) return '';
        return `+${match[1]}${match[2]}`;
    }

    function _positionConnectors() {
        if (!currentContainer) return;
        setTimeout(() => {
            currentContainer.querySelectorAll('.connector').forEach(conn => {
                const [startId, endId] = conn.dataset.connects.split('-');
                const startNode = currentContainer.querySelector(`#node-${startId}`);
                const endNode = currentContainer.querySelector(`#node-${endId}`);
                if (!startNode || !endNode) { conn.style.display = 'none'; return; };
                const containerRect = currentContainer.getBoundingClientRect();
                const startRect = startNode.getBoundingClientRect();
                const endRect = endNode.getBoundingClientRect();
                const startX = startRect.left + startRect.width / 2 - containerRect.left + currentContainer.scrollLeft;
                const startY = startRect.top + startRect.height / 2 - containerRect.top + currentContainer.scrollTop;
                const endX = endRect.left + endRect.width / 2 - containerRect.left + currentContainer.scrollLeft;
                const endY = endRect.top + endRect.height / 2 - containerRect.top + currentContainer.scrollTop;
                const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                conn.style.width = `${length}px`;
                conn.style.height = '4px';
                conn.style.top = `${startY - 2}px`;
                conn.style.left = `${startX}px`;
                conn.style.transformOrigin = 'left center';
                conn.style.transform = `rotate(${angle}deg)`;
            });
        }, 100);
    }


    // --- 模块公共API ---
    return {
        init: function (container, heroClassName, settings, callback, termsDict) {
            currentContainer = container;
            onStatsChangeCallback = callback || (() => { });

            // 【修正】保存传入的翻译字典
            talentTermsDict = termsDict || {};

            const classKey = classReverseMap[heroClassName] || 'ranger';
            _setupTalentData(classKey);
            _createTreeHTML();
            this.setPath(settings.strategy, settings.manaPriority);
            const resizeObserver = new ResizeObserver(_positionConnectors);
            resizeObserver.observe(currentContainer);
        },
        /**
         * 【已修正】根据策略设置天赋路径并更新UI
         * @param {string} strategy 
         * @param {boolean} manaPriority 
         * @param {string} talentLevel - 新增参数，用于控制路径节点数量
         */
        setPath: function (strategy, manaPriority, talentLevel) {
            _applyAutoPath(strategy, manaPriority, talentLevel);
            _updateUI();
        },

        // 【新增】清空天赋树选择的公共方法
        clear: function () {
            selectedNodes.clear();
            _updateUI();
        },
        getBonusesForPath: function (heroClassName, strategy, manaPriority) {
            const classKey = classReverseMap[heroClassName] || 'ranger';
            _setupTalentData(classKey);
            _applyAutoPath(strategy, manaPriority);
            return _calculateBonuses();
        }
    };

})();