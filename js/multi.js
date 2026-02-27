/**
 * multi.js — PeerJS 기반 P2P 멀티플레이어
 *
 * HOST  → BLACK (흑, 선공)
 * GUEST → WHITE (백)
 */

import { MP } from './state.js';
import { gameTable } from './game.js';

// ── UI 헬퍼 ──────────────────────────────────────────────
function $(sel) { return document.querySelector(sel); }

function setStatus(text, type = '') {
    const el = $('.mp-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'mp-status' + (type ? ` mp-status--${type}` : '');
}

function showScreen(id) {
    document.querySelectorAll('.mp-screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

// ── PeerJS 로드 (CDN) ─────────────────────────────────────
function loadPeerJS() {
    return new Promise((resolve, reject) => {
        if (window.Peer) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('PeerJS 로드 실패'));
        document.head.appendChild(s);
    });
}

// ── 연결 공통 처리 ────────────────────────────────────────
function setupConnection(conn) {
    MP.conn = conn;

    conn.on('open', () => {
        MP.active = true;
        setStatus(
            MP.role === 'host'
                ? '🟢 연결됨 — 당신은 흑돌 (선공)'
                : '🟢 연결됨 — 당신은 백돌',
            'connected'
        );
        showScreen('mp-screen-game');
        gameTable.resetGame(MP.role === 'host' ? 'black' : 'white');
    });

    conn.on('data', (data) => {
        if (data.type === 'place')      gameTable.placeRemoteStone(data.x, data.y);
        else if (data.type === 'undo')  gameTable.undoRemote();
        else if (data.type === 'redo')  gameTable.redoRemote();
        else if (data.type === 'renju') gameTable.setRenju(data.enabled);
    });

    conn.on('close', () => {
        MP.active = false;
        MP.conn = null;
        setStatus('⚠️ 상대방이 연결을 끊었습니다.', 'error');
        const modal = document.getElementById('mp-modal');
        if (modal) modal.classList.add('open');
        showScreen('mp-screen-lobby');
    });

    conn.on('error', (err) => {
        setStatus('연결 오류: ' + err.message, 'error');
    });
}

// ── 방 만들기 (HOST) ──────────────────────────────────────
async function createRoom() {
    setStatus('연결 서버에 접속 중...', '');
    try {
        await loadPeerJS();
    } catch (e) {
        setStatus('❌ ' + e.message + '. 네트워크를 확인해주세요.', 'error');
        return;
    }

    if (MP.peer) MP.peer.destroy();
    MP.role = 'host';
    MP.peer = new Peer();

    MP.peer.on('open', (id) => {
        const codeEl = $('.room-code-display');
        if (codeEl) codeEl.textContent = id;
        showScreen('mp-screen-waiting');
        setStatus('상대방이 참가하기를 기다리는 중...', '');
    });

    MP.peer.on('connection', (conn) => setupConnection(conn));

    MP.peer.on('error', (err) => {
        setStatus('오류: ' + err.message, 'error');
    });
}

// ── 방 참가 (GUEST) ───────────────────────────────────────
async function joinRoom(roomCode) {
    if (!roomCode.trim()) {
        setStatus('방 코드를 입력해주세요.', 'error');
        return;
    }
    setStatus('연결 중...', '');
    try {
        await loadPeerJS();
    } catch (e) {
        setStatus('❌ ' + e.message, 'error');
        return;
    }

    if (MP.peer) MP.peer.destroy();
    MP.role = 'guest';
    MP.peer = new Peer();

    MP.peer.on('open', () => {
        const conn = MP.peer.connect(roomCode.trim(), { reliable: true });
        setupConnection(conn);
    });

    MP.peer.on('error', () => {
        setStatus('❌ 연결 실패: 방 코드를 확인해주세요.', 'error');
    });
}

// ── 세션 종료 ─────────────────────────────────────────────
function leaveRoom() {
    if (MP.conn) MP.conn.close();
    if (MP.peer) MP.peer.destroy();
    MP.peer = null;
    MP.conn = null;
    MP.role = null;
    MP.active = false;
    showScreen('mp-screen-lobby');
    setStatus('');
    gameTable.resetGame(null);
}

// ── 멀티 모달 초기화 ──────────────────────────────────────
export function initMultiUI() {
    const modal = document.getElementById('mp-modal');

    // 멀티플레이 버튼 → 모달 토글
    const multiBtn = document.getElementById('multi-btn');
    if (multiBtn && modal) {
        multiBtn.addEventListener('click', () => {
            modal.classList.toggle('open');
            if (modal.classList.contains('open') && !MP.active) {
                showScreen('mp-screen-lobby');
                setStatus('');
            }
        });
    }

    // 바깥 클릭 닫기
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    // X 닫기
    document.getElementById('mp-close-btn')?.addEventListener('click',
        () => modal?.classList.remove('open'));

    // 게임 중 창 닫기
    document.getElementById('mp-close-game-btn')?.addEventListener('click',
        () => modal?.classList.remove('open'));

    // 방 만들기
    document.getElementById('mp-create-btn')?.addEventListener('click', createRoom);

    // 방 참가
    document.getElementById('mp-join-btn')?.addEventListener('click', () => {
        const input = document.getElementById('mp-room-input');
        joinRoom(input?.value || '');
    });

    // Enter로 참가
    document.getElementById('mp-room-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') joinRoom(e.target.value);
    });

    // 방 코드 복사
    document.getElementById('mp-copy-btn')?.addEventListener('click', () => {
        const code = $('.room-code-display')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('mp-copy-btn');
            btn.textContent = '✓ 복사됨';
            setTimeout(() => btn.textContent = '복사', 1500);
        });
    });

    // 나가기 버튼들
    document.querySelectorAll('.mp-leave-btn').forEach(btn =>
        btn.addEventListener('click', leaveRoom));
}
