import db from 'src/db/db';

const OPENSHEET_API_URL = 'https://opensheet.elk.sh';

const CACHE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Синхронизирует скрамблы из Google Sheet с локальной базой данных IndexedDB.
 * Выполняет сетевой запрос только если кэш устарел.
 * @param {string} sheetId - ID таблицы Google Sheet.
 * @param {string} sheetName - Имя листа (например, 'scrambles' или '1').
 * @returns {Promise<void>}
 */
async function syncScrambles(sheetId, sheetName = '1') {
  const meta = await db.practiceScrambleMeta.get(sheetId);
  if (meta && Date.now() - meta.timestamp < CACHE_LIFETIME_MS) {
    console.log(`[ScrambleService] Cache is fresh for sheetId: ${sheetId}`);
    return;
  }

  console.log('[ScrambleService] Cache is stale or missing. Fetching from opensheet...');

  try {
    const response = await fetch(`${OPENSHEET_API_URL}/${sheetId}/${sheetName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const networkData = await response.json();

    console.log('networkData: ', networkData);
    // ВАЖНО: Убедитесь, что заголовки в Google Sheet - 'Category' и 'Scramble'
    // 'Category' и 'Scramble' - это ключи, которые создаст opensheet

    await db.transaction('rw', db.practiceScrambles, db.practiceScrambleMeta, async () => {
      await db.practiceScrambles.where({ sheetId }).delete();

      // Готовим данные для сохранения, добавляя sheetId к каждой записи
      const scramblesToSave = networkData.map((item) => ({
        sheetId: sheetId,
        category: item.Category,
        group: item.Group,
        scramble: item.Scramble,
        name: item.Name,
        recommendedSolution: item.RecommenedSolution?.trim(),
        solutions: item.Solutions.split('\n').map(solution => solution.trim()),
        fileName: item.FileName
      }));

      await db.practiceScrambles.bulkAdd(scramblesToSave);

      await db.practiceScrambleMeta.put({ sheetId, timestamp: Date.now() });
    });

    console.log(`[ScrambleService] Synced ${networkData.length} scrambles for sheetId: ${sheetId}`);
  } catch (error) {
    console.error('[ScrambleService] Sync failed:', error);
    if (!meta) throw new Error('Network failed and no cache available.');
  }
}



/**
 * @param {string} sheetId - ID таблицы.
 * @param {string} category - Категория скрамбла.
 * @returns {Promise<string>} - Случайный скрамбл.
 */
export async function getRandomPracticeScramble(sheetId, category) {
  console.log(sheetId, category);
  if (!sheetId || !category) throw new Error('Sheet ID and category must be provided.');

  await syncScrambles(sheetId);

  const count = await db.practiceScrambles.where({ sheetId, category }).count();

  if (count === 0) {
    return `No scrambles found for "${category}"`;
  }

  const randomIndex = Math.floor(Math.random() * count);
  return await db.practiceScrambles.where({ sheetId, category }).offset(randomIndex).first();
}

/**
 * Получает список уникальных категорий из IndexedDB.
 * @param {string} sheetId - ID таблицы.
 * @returns {Promise<string[]>} - Массив уникальных категорий.
 */
export async function getCategories(sheetId) {
  if (!sheetId) throw new Error('Sheet ID must be provided.');

  await syncScrambles(sheetId);

  const allRecords = await db.practiceScrambles.where({ sheetId }).toArray();
  return Array.from(new Set(allRecords.map((s) => s.category)));
}

export async function getGroups(sheetId, category) {
  console.log('call', sheetId, category);
  if (!sheetId) throw new Error('Sheet ID must be provided.');

  await syncScrambles(sheetId);

  const allRecords = await db.practiceScrambles.where({ sheetId, category }).toArray();
  return Array.from(new Set(allRecords.map((s) => s.group))).filter(el => el);
}

export async function getAllBySheetIdAndCategoryAndGroup(sheetId, category, group) {
  return (!group || group === 'All')
    ? await db.practiceScrambles.where({ sheetId, category }).toArray()
    : await db.practiceScrambles.where({ sheetId, category, group }).toArray();
}
