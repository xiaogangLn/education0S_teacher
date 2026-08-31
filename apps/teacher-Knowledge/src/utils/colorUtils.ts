// utils/colorUtils.ts
export const colorPalettes = [
    // 亮蓝色系
    { bg: 'bg-blue-100/60', text: 'text-blue-600', border: 'border-blue-200/60', hover: 'hover:bg-blue-200/60' },
    // 亮绿色系
    { bg: 'bg-green-100/60', text: 'text-green-600', border: 'border-green-200/60', hover: 'hover:bg-green-200/60' },
    // 亮紫色系
    { bg: 'bg-purple-100/60', text: 'text-purple-600', border: 'border-purple-200/60', hover: 'hover:bg-purple-200/60' },
    // 亮橙色系
    { bg: 'bg-orange-100/60', text: 'text-orange-600', border: 'border-orange-200/60', hover: 'hover:bg-orange-200/60' },
    // 亮粉色系
    { bg: 'bg-pink-100/60', text: 'text-pink-600', border: 'border-pink-200/60', hover: 'hover:bg-pink-200/60' },
    // 亮靛蓝色系
    { bg: 'bg-indigo-100/60', text: 'text-indigo-600', border: 'border-indigo-200/60', hover: 'hover:bg-indigo-200/60' },
    // 亮天蓝色系
    { bg: 'bg-sky-100/60', text: 'text-sky-600', border: 'border-sky-200/60', hover: 'hover:bg-sky-200/60' },
    // 亮青柠色系
    { bg: 'bg-lime-100/60', text: 'text-lime-600', border: 'border-lime-200/60', hover: 'hover:bg-lime-200/60' },
    // 亮翠绿色系
    { bg: 'bg-emerald-100/60', text: 'text-emerald-600', border: 'border-emerald-200/60', hover: 'hover:bg-emerald-200/60' },
    // 亮红色系
    { bg: 'bg-red-100/60', text: 'text-red-600', border: 'border-red-200/60', hover: 'hover:bg-red-200/60' },
    // 亮琥珀色系
    { bg: 'bg-amber-100/60', text: 'text-amber-600', border: 'border-amber-200/60', hover: 'hover:bg-amber-200/60' },
    // 亮紫色系
    { bg: 'bg-violet-100/60', text: 'text-violet-600', border: 'border-violet-200/60', hover: 'hover:bg-violet-200/60' },
];

export const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colorPalettes.length);
    return colorPalettes[randomIndex];
};

// 基于字符串生成固定颜色（同一标题始终同一颜色）
export const getColorByString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalettes.length;
    return colorPalettes[index];
};

// ✅ 确保相邻颜色不同
export const getColorsForItems = (items: Array<{ id: number | string; title: string }>) => {
    const result: Array<{ id: number | string; color: typeof colorPalettes[0] }> = [];
    let lastColorIndex = -1;

    items.forEach((item) => {
        // 基于标题生成初始颜色索引
        let hash = 0;
        for (let i = 0; i < item.title.length; i++) {
            hash = item.title.charCodeAt(i) + ((hash << 5) - hash);
        }
        let colorIndex = Math.abs(hash) % colorPalettes.length;

        // 如果与上一个颜色相同，则选择下一个
        if (colorIndex === lastColorIndex) {
            colorIndex = (colorIndex + 1) % colorPalettes.length;
        }

        lastColorIndex = colorIndex;
        result.push({
            id: item.id,
            color: colorPalettes[colorIndex],
        });
    });

    return result;
};