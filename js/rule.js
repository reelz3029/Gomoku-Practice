/**
 * rule.js - 오목 룰 및 렌주 금수 룰
 */

export const EMPTY = 0;
export const BLACK = 1; // 흑돌 (홀수 턴)
export const WHITE = 2; // 백돌 (짝수 턴)

const DIRS = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 ↘
    [1, -1],  // 대각선 ↙
];

/**
 * 15x15 보드를 2D 배열로 반환
 */
export function buildBoard(tableStones) {
    const board = Array.from({ length: 15 }, () => Array(15).fill(EMPTY));
    for (const stone of tableStones) {
        const x = parseInt(stone.x);
        const y = parseInt(stone.y);
        board[x][y] = stone.color;
    }
    return board;
}

/**
 * 특정 방향으로 연속된 같은 색 돌 개수 세기
 */
function countDir(board, x, y, dx, dy, color) {
    let count = 0;
    let nx = x + dx, ny = y + dy;
    while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === color) {
        count++;
        nx += dx;
        ny += dy;
    }
    return count;
}

/**
 * 승리 체크: 정확히 5개 이상 연속 (흑은 정확히 5, 백은 5 이상)
 */
export function checkWin(board, x, y, color) {
    for (const [dx, dy] of DIRS) {
        const cnt = 1
            + countDir(board, x, y, dx, dy, color)
            + countDir(board, x, y, -dx, -dy, color);
        if (color === WHITE && cnt >= 5) return true;
        if (color === BLACK && cnt === 5) return true;
    }
    return false;
}

/* ===================== 렌주 금수 룰 ===================== */

/**
 * 가상으로 돌을 놓은 후 연속 분석
 * @returns { open, count } open: 양쪽 열린 수, count: 연속 개수
 */
function analyzeLine(board, x, y, dx, dy, color) {
    // 정방향 개수 + 끝이 열려있는지
    let cnt = 1;
    let openA = false, openB = false;

    let nx = x + dx, ny = y + dy;
    while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === color) {
        cnt++;
        nx += dx;
        ny += dy;
    }
    if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === EMPTY) openA = true;

    nx = x - dx; ny = y - dy;
    while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === color) {
        cnt++;
        nx -= dx;
        ny -= dy;
    }
    if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[nx][ny] === EMPTY) openB = true;

    return { count: cnt, openEnds: (openA ? 1 : 0) + (openB ? 1 : 0) };
}

/**
 * 장목(6목 이상) 체크
 */
function isOverline(board, x, y) {
    for (const [dx, dy] of DIRS) {
        const cnt = 1
            + countDir(board, x, y, dx, dy, BLACK)
            + countDir(board, x, y, -dx, -dy, BLACK);
        if (cnt >= 6) return true;
    }
    return false;
}

/**
 * 열린 4 체크: 한 방향에서 4개 연속이며 양쪽이 모두 열린 경우
 * (활사(活四): 막으면 5가 되는 쪽이 2개)
 */
function countOpenFours(board, x, y) {
    let openFours = 0;
    for (const [dx, dy] of DIRS) {
        const { count, openEnds } = analyzeLine(board, x, y, dx, dy, BLACK);
        if (count === 4 && openEnds === 2) openFours++;
    }
    return openFours;
}

/**
 * 열린 3 체크 (활삼): 한 수 더 두면 열린 4가 되는 경우
 * 실제로 한 수 더 두어보고 열린 4인지 확인
 */
function isOpenThree(board, x, y, dx, dy) {
    // 이 방향의 현재 연속 길이 및 빈 칸 위치 찾기
    const seq = [];
    // 방향 양쪽으로 최대 5칸 범위 스캔
    for (let d = -4; d <= 4; d++) {
        const nx = x + dx * d, ny = y + dy * d;
        if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15) {
            seq.push('W'); // 벽
        } else {
            seq.push(board[nx][ny]);
        }
    }
    // 중심 인덱스 = 4
    // 패턴 기반으로 열린 3 판정: _XXX_, _XX_X_, _X_XX_ 등
    // 단순하게: 이 방향으로 빈 칸에 흑을 놓았을 때 활사가 생기는지 확인
    const { count, openEnds } = analyzeLine(board, x, y, dx, dy, BLACK);
    if (count === 3 && openEnds === 2) {
        // 양쪽 열린 3 → 한 수 더 두면 활사 가능성 → 활삼
        return true;
    }
    return false;
}

/**
 * 활삼의 수 계산 (렌주: 33 금수)
 * 활삼 = 놓으면 열린 3이 되는 (한 수 더 두면 활사가 되는)
 */
function countOpenThrees(board, x, y) {
    let threeCount = 0;
    for (const [dx, dy] of DIRS) {
        const { count, openEnds } = analyzeLine(board, x, y, dx, dy, BLACK);
        if (count === 3 && openEnds === 2) {
            // 이것이 진짜 활삼인지: 이 활삼에서 뻗을 수 있는 빈 칸에 놓았을 때 활사가 되는지 확인
            // 간단 구현: count===3 && openEnds===2이면 활삼으로 판정
            threeCount++;
        }
    }
    return threeCount;
}

/**
 * 렌주 금수 여부 판정
 * - 33 금수: 활삼이 2개 이상
 * - 44 금수: 열린 4(또는 사)가 2개 이상
 * - 장목(6목 이상)
 */
export function isForbiddenMove(board, x, y) {
    // 가상으로 놓기
    board[x][y] = BLACK;

    // 1. 장목
    if (isOverline(board, x, y)) {
        board[x][y] = EMPTY;
        return { forbidden: true, reason: '장목' };
    }

    // 2. 44 금수
    let fourCount = 0;
    for (const [dx, dy] of DIRS) {
        const { count, openEnds } = analyzeLine(board, x, y, dx, dy, BLACK);
        // 4목: 열린 4 또는 막힌 4 (단, 5목이 되는 경우는 제외 — 이미 위에서 장목 처리)
        if (count === 4) fourCount++;
    }
    if (fourCount >= 2) {
        board[x][y] = EMPTY;
        return { forbidden: true, reason: '44 금수' };
    }

    // 3. 33 금수
    const threes = countOpenThrees(board, x, y);
    if (threes >= 2) {
        board[x][y] = EMPTY;
        return { forbidden: true, reason: '33 금수' };
    }

    board[x][y] = EMPTY;
    return { forbidden: false, reason: null };
}
