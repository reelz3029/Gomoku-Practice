/**
 * state.js — 멀티플레이 공유 상태
 * game.js ↔ multi.js 순환 참조를 끊기 위한 중간 모듈
 */

export const MP = {
    peer: null,
    conn: null,
    role: null,    // 'host' | 'guest' | null
    active: false,
};

export function sendAction(data) {
    if (MP.conn && MP.conn.open) {
        MP.conn.send(data);
    }
}
