function invertMove(move) {
  if (move.endsWith('2')) return move;
  if (move.endsWith('\'')) return move.slice(0, -1);
  return move + '\'';
}

function areIndependent(move1, move2) {
  const face1 = move1[0];
  const face2 = move2[0];
  const pairs = [
    ['R', 'L'],
    ['U', 'D'],
    ['F', 'B'],
  ];
  return pairs.some(pair => pair.includes(face1) && pair.includes(face2));
}

export function check(scramble, cubeMoves) {
  const slots = scramble.map(move => ({
    expected: move,
    output: { move: move, status: '⏳', comment: 'expected but not yet performed' },
    state: 'pending' // 'pending' | 'partial' | 'done'
  }));

  const rollback = [];
  const extraErrors = [];
  let failure = false;

  for (const uMove of cubeMoves) {

    if (failure) {
      extraErrors.push({
        move: uMove,
        status: '❌',
        comment: 'unexpected move (after previous error)',
      });
      rollback.push(invertMove(uMove));
      continue;
    }

    let matchedIndex = -1;
    let matchType = null; // 'exact', 'partial', 'completion'

    // Поиск подходящего слота
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];

      // 1. Пропускаем выполненные
      if (slot.state === 'done') continue;

      // 2. Обработка Partial слота (уже начат, например R из R2)
      if (slot.state === 'partial') {
        // Пытаемся завершить (пришел второй R)
        if (slot.expected.endsWith('2') && uMove[0] === slot.expected[0]) {
          matchedIndex = i;
          matchType = 'completion';
          break;
        }

        // ВАЖНОЕ ИСПРАВЛЕНИЕ:
        // Если ход не завершает этот partial слот, проверяем независимость.
        // Если uMove независим от slot.expected (R и L), мы можем искать дальше.
        // Если зависим (R и F), мы блокируемся.
        if (!areIndependent(uMove, slot.expected)) {
          break; // Зависимый ход блокирует дальнейший поиск
        }
        // Если независим — идем к следующему слоту (continue)
        continue;
      }

      // 3. Обработка Pending слота (еще не начат)
      if (slot.state === 'pending') {
        const isExact = uMove === slot.expected;
        // Partial совпадение: ждем X2, пришел X или X' (но не X2)
        const isPartial = slot.expected.endsWith('2') && uMove[0] === slot.expected[0] && !uMove.endsWith('2');

        if (isExact || isPartial) {
          matchedIndex = i;
          matchType = isExact ? 'exact' : 'partial';
          break;
        }

        // Если не совпало, проверяем можно ли пропустить этот слот (независимость)
        if (!areIndependent(uMove, slot.expected)) {
          break; // Зависимый ход блокирует
        }
      }
    }

    // Применение результата
    if (matchedIndex !== -1) {
      const slot = slots[matchedIndex];

      if (matchType === 'completion') {
        slot.output = {
          move: slot.expected,
          status: '✅',
          comment: 'matches expected (completed)'
        };
        slot.state = 'done';
      }
      else if (matchType === 'exact') {
        slot.output = {
          move: uMove,
          status: '✅',
          comment: matchedIndex === getFirstPendingIndex(slots) ? 'matches expected' : 'independent swap allowed'
        };
        slot.state = 'done';
      }
      else if (matchType === 'partial') {
        slot.output = {
          move: uMove,
          status: '⚠️',
          comment: 'partial move, independent allowed'
        };
        slot.state = 'partial';
      }
    } else {
      failure = true;
      extraErrors.push({
        move: uMove,
        status: '❌',
        comment: 'unexpected move',
      });
      rollback.push(invertMove(uMove));
    }
  }

  const finalMoves = slots.map(s => s.output).concat(extraErrors);

  return {
    moves: finalMoves,
    rollbackMoves: rollback.reverse(),
  };
}

function getFirstPendingIndex(slots) {
  return slots.findIndex(s => s.state !== 'done');
}