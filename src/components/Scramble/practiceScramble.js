// src/services/ScrambleService.js
import db from 'src/db/db'; // Ваш главный экземпляр Dexie

// Базовый URL для opensheet API
const OPENSHEET_API_URL = 'https://opensheet.elk.sh';

// Время жизни кэша в IndexedDB (например, 1 день)
const CACHE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Синхронизирует скрамблы из Google Sheet с локальной базой данных IndexedDB.
 * Выполняет сетевой запрос только если кэш устарел.
 * @param {string} sheetId - ID таблицы Google Sheet.
 * @param {string} sheetName - Имя листа (например, 'scrambles' или '1').
 * @returns {Promise<void>}
 */
async function syncScrambles(sheetId, sheetName = '1') {
  // 1. Проверяем метаданные кэша на свежесть
  const meta = await db.practiceScrambleMeta.get(sheetId);
  if (meta && (Date.now() - meta.timestamp) < CACHE_LIFETIME_MS) {
    console.log(`[ScrambleService] Cache is fresh for sheetId: ${sheetId}`);
    return; // Кэш актуален, выходим
  }

  console.log('[ScrambleService] Cache is stale or missing. Fetching from opensheet...');

  try {
    // 2. Формируем URL и загружаем данные из сети
    const response = await fetch(`${OPENSHEET_API_URL}/${sheetId}/${sheetName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const networkData = await response.json();

    // ВАЖНО: Убедитесь, что заголовки в Google Sheet - 'Category' и 'Scramble'
    // 'Category' и 'Scramble' - это ключи, которые создаст opensheet

    // 3. Сохраняем свежие данные в IndexedDB в рамках одной транзакции
    await db.transaction('rw', db.practiceScrambles, db.practiceScrambleMeta, async () => {
      // Очищаем старые скрамблы для этого sheetId
      await db.practiceScrambles.where({ sheetId }).delete();

      // Готовим данные для сохранения, добавляя sheetId к каждой записи
      const scramblesToSave = networkData.map(item => (
        {
        sheetId: sheetId,
        category: item.Category,
        scramble: item.Scramble,
        name: item.Name,
        recommendedSolution: item.RecommenedSolution,
        solutions: item.Solutions.split('\n')
      }));

      await db.practiceScrambles.bulkAdd(scramblesToSave);

      // Обновляем метаданные о времени загрузки
      await db.practiceScrambleMeta.put({ sheetId, timestamp: Date.now() });
    });

    console.log(`[ScrambleService] Synced ${networkData.length} scrambles for sheetId: ${sheetId}`);

  } catch (error) {
    console.error('[ScrambleService] Sync failed:', error);
    // Если сети нет, но есть старые данные в кэше, приложение продолжит работать
    // Если нет ни сети, ни кэша, будет выброшена ошибка ниже
    if (!meta) throw new Error('Network failed and no cache available.');
  }
}

/**
 * **ОПТИМИЗИРОВАНО**: Получает случайный скрамбл из IndexedDB.
 * @param {string} sheetId - ID таблицы.
 * @param {string} category - Категория скрамбла.
 * @returns {Promise<string>} - Случайный скрамбл.
 */
export async function getRandomPracticeScramble(sheetId, category) {
  console.log(sheetId, category);
  if (!sheetId || !category) throw new Error('Sheet ID and category must be provided.');

  // Убеждаемся, что данные синхронизированы (или есть в кэше)
  await syncScrambles(sheetId);

  // 1. Получаем ТОЛЬКО количество скрамблов нужной категории
  const count = await db.practiceScrambles
    .where({ sheetId, category }) // Используем наш супер-быстрый индекс
    .count();

  if (count === 0) {
    return `No scrambles found for "${category}"`;
  }

  // 2. Выбираем случайный "сдвиг" (offset)
  const randomIndex = Math.floor(Math.random() * count);

  // 3. Получаем из базы данных ОДНУ запись по этому сдвигу
   // .first() эквивалентно .limit(1) и возвращает один объект
  return await db.practiceScrambles
    .where({ sheetId, category })
    .offset(randomIndex)
    .first();
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
  return Array.from(new Set(allRecords.map(s => s.category)));
}
