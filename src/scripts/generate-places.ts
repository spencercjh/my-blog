import { renameSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import prettier from 'prettier';
import { PLACES as existingPlaces } from '../data/places';

export interface Place {
  name: string; // 地点名称（如：上海市）
  nameEn?: string; // 英文名称（可选）
  country: string; // 国家
  lat: number; // 纬度
  lng: number; // 经度
  firstVisitDate: string; // 初次访问时间（ISO 格式：2024-05 或 2024-05-01）
  description?: string; // 备注描述（可选）
}

export interface PlaceSource {
  name: string;
  country?: string;
  firstVisitDate: string;
  description?: string;
}

type Coordinates = Pick<Place, 'lat' | 'lng'>;
type GeocodeResult = Coordinates & Pick<Place, 'country'>;
type Geocode = (placeName: string, preferredCountry?: string) => Promise<GeocodeResult>;

const GEOCODE_TIMEOUT_MS = 15_000;

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
  臺灣: 'TW',
  台湾: 'TW',
  越南: 'VN',
  柬埔寨: 'KH',
};

function getCountryCode(countryName?: string): string | undefined {
  if (!countryName) return undefined;
  return countryCodeMap[countryName];
}

// 使用 OpenStreetMap 的 Nominatim API 进行地理编码（免费，无需 API Key）
async function geocode(placeName: string, preferredCountry?: string): Promise<GeocodeResult> {
  const countryCode = getCountryCode(preferredCountry);
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: placeName,
    addressdetails: '1',
    limit: '1',
  });
  if (countryCode) params.set('countrycodes', countryCode);

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), GEOCODE_TIMEOUT_MS);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'my-blog-places-generator/1.0',
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Geocoding failed for ${placeName}: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
      address?: { country?: string };
    }>;

    if (data.length === 0) {
      throw new Error(`No results found for ${placeName}`);
    }

    const result = data[0];
    return {
      lat: Number(result.lat),
      lng: Number(result.lon),
      country: preferredCountry || result.address?.country || '未知',
    };
  } catch (error) {
    if (abortController.signal.aborted) {
      throw new Error(`Geocoding timed out for ${placeName}`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function inferEnglishName(name: string): string | undefined {
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

export function formatVisitDate(inputDate: string): string {
  const isoDate = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(inputDate);
  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]);
    const day = isoDate[3] ? Number(isoDate[3]) : 1;
    const normalizedDate = new Date(0);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    normalizedDate.setUTCFullYear(year, month - 1, day);

    if (
      normalizedDate.getUTCFullYear() !== year ||
      normalizedDate.getUTCMonth() !== month - 1 ||
      normalizedDate.getUTCDate() !== day
    ) {
      throw new Error(`Invalid firstVisitDate: ${inputDate}`);
    }
    return inputDate;
  }

  const visitDate = new Date(inputDate);
  if (Number.isNaN(visitDate.valueOf())) {
    throw new Error(`Invalid firstVisitDate: ${inputDate}`);
  }
  return visitDate.toISOString().split('T')[0];
}

function placeKey(place: Pick<PlaceSource, 'name' | 'firstVisitDate'>): string {
  return `${place.name}\u0000${formatVisitDate(place.firstVisitDate)}`;
}

export function readCoordinates(
  placeName: string,
  lat: number | undefined,
  lng: number | undefined
): Coordinates | undefined {
  if (lat === undefined && lng === undefined) return undefined;
  if (lat === undefined || lng === undefined) {
    throw new Error(`${placeName}: lat and lng must be provided together`);
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error(`${placeName}: invalid latitude ${lat}`);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error(`${placeName}: invalid longitude ${lng}`);
  }
  return { lat, lng };
}

export async function resolvePlace(
  item: PlaceSource,
  cachedPlace: Place | undefined,
  geocodePlace: Geocode = geocode
): Promise<{ place: Place; geocoded: boolean }> {
  const cachedCoordinates = cachedPlace
    ? readCoordinates(cachedPlace.name, cachedPlace.lat, cachedPlace.lng)
    : undefined;

  let geocodeResult: GeocodeResult | undefined;
  if (!cachedCoordinates) {
    const searchName = inferEnglishName(item.name) || item.name;
    geocodeResult = await geocodePlace(searchName, item.country);
    readCoordinates(item.name, geocodeResult.lat, geocodeResult.lng);
  }

  const coordinates = cachedCoordinates || geocodeResult;
  if (!coordinates) throw new Error(`${item.name}: failed to resolve coordinates`);

  const country = item.country || cachedPlace?.country || geocodeResult?.country;
  if (!country) throw new Error(`${item.name}: failed to resolve country`);

  return {
    place: {
      name: item.name,
      nameEn: cachedPlace?.nameEn || inferEnglishName(item.name),
      country,
      ...coordinates,
      firstVisitDate: formatVisitDate(item.firstVisitDate),
      description: item.description,
    },
    geocoded: Boolean(geocodeResult),
  };
}

function escapeSingleQuoted(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function renderPlaces(places: Place[]): string {
  return `export interface Place {
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
  .map(place => {
    const nameEnLine = place.nameEn ? `    nameEn: '${escapeSingleQuoted(place.nameEn)}',\n` : '';
    const descriptionLine = place.description
      ? `    description: '${escapeSingleQuoted(place.description)}',\n`
      : '';
    return `  {
    name: '${escapeSingleQuoted(place.name)}',
${nameEnLine}    country: '${escapeSingleQuoted(place.country)}',
    lat: ${place.lat},
    lng: ${place.lng},
    firstVisitDate: '${place.firstVisitDate}',
${descriptionLine}  },`;
  })
  .join('\n')}
];
`;
}

export async function generatePlaces(): Promise<void> {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(scriptDirectory, '../data/places-source.yml');
  const outputPath = join(scriptDirectory, '../data/places.ts');

  console.log('📖 读取数据源:', sourcePath);
  const sourceContent = readFileSync(sourcePath, 'utf8');
  const placesSource = yaml.load(sourceContent) as PlaceSource[];
  if (!Array.isArray(placesSource)) throw new Error('places-source.yml must contain an array');

  console.log(`📍 找到 ${placesSource.length} 个地点`);
  const cache = new Map(existingPlaces.map(place => [placeKey(place), place]));
  const places: Place[] = [];

  for (const item of placesSource) {
    const { place, geocoded } = await resolvePlace(item, cache.get(placeKey(item)));
    places.push(place);
    console.log(
      `  ✓ ${item.name} (${place.lat}, ${place.lng})${geocoded ? ' [新坐标]' : ' [固定坐标]'}`
    );
    if (geocoded) await new Promise(resolveDelay => setTimeout(resolveDelay, 1000));
  }

  const prettierConfig = await prettier.resolveConfig(outputPath);
  const tsContent = await prettier.format(renderPlaces(places), {
    ...prettierConfig,
    filepath: outputPath,
  });
  const temporaryOutputPath = `${outputPath}.${process.pid}.tmp`;
  try {
    writeFileSync(temporaryOutputPath, tsContent, 'utf8');
    renameSync(temporaryOutputPath, outputPath);
  } catch (error) {
    rmSync(temporaryOutputPath, { force: true });
    throw error;
  }
  console.log(`\n✅ 已生成: ${outputPath}`);
  console.log(`✅ 共 ${places.length} 个地点`);
}

const entrypoint = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (entrypoint === fileURLToPath(import.meta.url)) {
  generatePlaces().catch(error => {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  });
}
