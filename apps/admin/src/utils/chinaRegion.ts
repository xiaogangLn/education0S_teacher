import { pcaTextArr } from 'element-china-area-data';

export type RegionOption = {
  label: string;
  value: string;
  children?: RegionOption[];
};

/** 全国省市区（中文名），供 Cascader 使用 */
export const chinaRegionOptions = pcaTextArr as RegionOption[];

/**
 * 将库里的省/市/区回显为 Cascader 路径。
 * 兼容直辖市历史数据 city 写成「北京市」而目录为「市辖区」的情况。
 */
export function resolveRegionPath(
  province?: string | null,
  city?: string | null,
  district?: string | null,
): string[] | undefined {
  const pName = String(province || '').trim();
  const cName = String(city || '').trim();
  const dName = String(district || '').trim();
  if (!pName) return undefined;

  const provinceNode = chinaRegionOptions.find((item) => item.value === pName || item.label === pName);
  if (!provinceNode) {
    return [pName, cName, dName].filter(Boolean);
  }

  let cityNode = provinceNode.children?.find((item) => item.value === cName || item.label === cName);
  if (!cityNode && (!cName || cName === pName)) {
    cityNode =
      provinceNode.children?.find((item) => item.value === '市辖区' || item.label === '市辖区') ||
      provinceNode.children?.[0];
  }
  if (!cityNode) {
    return [provinceNode.value];
  }

  const districtNode = cityNode.children?.find((item) => item.value === dName || item.label === dName);
  if (!districtNode) {
    return dName ? [provinceNode.value, cityNode.value, dName] : [provinceNode.value, cityNode.value];
  }

  return [provinceNode.value, cityNode.value, districtNode.value];
}
