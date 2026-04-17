import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

// Place 接口定义（与原 places.ts 保持一致）
export interface Place {
  name: string; // 地点名称（如：上海市）
  nameEn?: string; // 英文名称（可选）
  country: string; // 国家
  lat: number; // 纬度
  lng: number; // 经度
  firstVisitDate: string; // 初次访问时间（ISO 格式：2024-05 或 2024-05-01）
  description?: string; // 备注描述（可选）
}

// 国家代码映射（中文国家名 -> ISO 3166-1 alpha-2 代码）
const countryCodeMap: Record<string, string> = {
  泰国: 'TH',
  韩国: 'KR',
  新加坡: 'SG',
  印度尼西亚: 'ID',
  马尔代夫: 'MV',
  日本: 'JP',
  香港: 'HK',
  中国: 'CN',
};

// 获取国家代码
function getCountryCode(countryName?: string): string | undefined {
  if (!countryName) return undefined;
  return countryCodeMap[countryName];
}

// 使用 OpenStreetMap 的 Nominatim API 进行地理编码（免费，无需 API Key）
async function geocode(
  placeName: string,
  preferredCountry?: string
): Promise<{ lat: number; lng: number; country: string }> {
  const countryCode = getCountryCode(preferredCountry);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    placeName
  )}&addressdetails=1&limit=1${countryCode ? `&countrycode=${countryCode}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'my-blog-places-generator/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed for ${placeName}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.length || data.length === 0) {
    throw new Error(`No results found for ${placeName}`);
  }

  const result = data[0];
  const country = preferredCountry || result.address?.country || '未知';

  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    country,
  };
}

// 从地名推断英文名称
function inferEnglishName(name: string): string | undefined {
  // 常见城市名称映射
  const commonNames: Record<string, string> = {
    上海市: 'Shanghai',
    北京市: 'Beijing',
    广州市: 'Guangzhou',
    深圳市: 'Shenzhen',
    杭州市: 'Hangzhou',
    南京市: 'Nanjing',
    武汉市: 'Wuhan',
    成都市: 'Chengdu',
    西安市: "Xi'an",
    重庆市: 'Chongqing',
    天津市: 'Tianjin',
    甲米: 'Krabi',
    攀牙湾: 'Phang Nga Bay',
  };
  return commonNames[name];
}

async function generatePlaces(): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(__dirname, '../data/places-source.yml');
  const outputPath = join(__dirname, '../data/places.ts');

  console.log('📖 读取数据源:', sourcePath);

  const sourceContent = readFileSync(sourcePath, 'utf8');
  const placesSource = yaml.load(sourceContent) as Array<{
    name: string;
    firstVisitDate: string;
    description?: string;
    country?: string;
  }>;

  console.log(`📍 找到 ${placesSource.length} 个地点`);

  const places: Place[] = [];

  for (const item of placesSource) {
    try {
      console.log(` 正在获取坐标: ${item.name}...`);

      const nameEn = inferEnglishName(item.name);
      // 使用英文名称查询（如果存在），更准确
      const searchName = nameEn || item.name;
      const { lat, lng, country } = await geocode(searchName, item.country);

      // 将日期格式化为 YYYY-MM 或 YYYY-MM-DD
      const inputDate = item.firstVisitDate;
      // 如果已经是 YYYY-MM 或 YYYY-MM-DD 格式，直接使用
      let formattedDate: string;
      if (/^\d{4}-\d{2}(-\d{2})?$/.test(inputDate)) {
        formattedDate = inputDate;
      } else {
        // 否则通过 Date 对象格式化
        const visitDate = new Date(inputDate);
        formattedDate = visitDate.toISOString().split('T')[0];
      }

      const place: Place = {
        name: item.name,
        nameEn: nameEn || undefined,
        country,
        lat,
        lng,
        firstVisitDate: formattedDate,
        description: item.description,
      };

      places.push(place);
      console.log(`    ✓ ${item.name} (${lat}, ${lng})`);

      // 避免 API 请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ ${item.name}: ${errorMessage}`);
      // 跳过该地点，继续处理后续地点
      if (error instanceof TypeError && error.message.includes('JSON.parse')) {
        console.warn(`    ⚠️  跳过 ${item.name}: API 解析错误，可能是限流`);
        continue;
      }
    }
  }

  // 生成 TypeScript 文件
  const tsContent = `export interface Place {
  name: string; // 地点名称（如：上海市）
  nameEn?: string; // 英文名称（可选）
  country: string; // 国家
  lat: number; // 纬度
  lng: number; // 经度
  firstVisitDate: string; // 初次访问时间（ISO 格式：2024-05 或 2024-05-01）
  description?: string; // 备注描述（可选）
}

export const PLACES: Place[] = [
${places
  .map(p => {
    const desc = p.description
      ? p.description.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
      : '';
    const nameEscaped = p.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const nameEnEscaped = p.nameEn ? p.nameEn.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : '';
    const countryEscaped = p.country.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const nameEnLine = nameEnEscaped ? `    nameEn: '${nameEnEscaped}',\n` : '';
    const descLine = desc ? `    description: '${desc}',\n` : '';
    return `  {\n    name: '${nameEscaped}',\n${nameEnLine}    country: '${countryEscaped}',\n    lat: ${p.lat},\n    lng: ${p.lng},\n    firstVisitDate: '${p.firstVisitDate}',\n${descLine}  },`;
  })
  .join('\n')}
];

`;

  writeFileSync(outputPath, tsContent, 'utf8');
  console.log(`\n✅ 已生成: ${outputPath}`);
  console.log(`✅ 共 ${places.length} 个地点`);
}

// 运行
generatePlaces().catch(error => {
  console.error('❌ 生成失败:', error);
  process.exit(1);
});
