/**
 * multi.js — PeerJS 기반 P2P 멀티플레이어
 *
 * 흐름:
 *  방장(HOST): Peer 생성 → roomCode(= peer.id) 공유 → 상대 연결 대기
 *  게스트(GUEST): roomCode 입력 → HOST에 connect()
 *
 * 역할:
 *  HOST  → BLACK (흑, 선공)
 *  GUEST → WHITE (백)
 */

import { gameTable } from './game.js';

// ── 상태 ─────────────────────────────────────────────────
export const MP = {
    peer: null,
    conn: null,
    role: null,       // 'host' | 'guest' | null
    active: false,    // 멀티 세션 중 여부
};

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
        s.onerror = reject;
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
        // 게임 리셋
        gameTable.resetGame(MP.role === 'host' ? 'black' : 'white');
    });

    conn.on('data', (data) => {
        handleRemoteAction(data);
    });

    conn.on('close', () => {
        MP.active = false;
        MP.conn = null;
        setStatus('⚠️ 상대방이 연결을 끊었습니다.', 'error');
    });

    conn.on('error', (err) => {
        setStatus('연결 오류: ' + err.message, 'error');
    });
}

// ── 원격 액션 수신 ────────────────────────────────────────
function handleRemoteAction(data) {
    if (data.type === 'place') {
        gameTable.placeRemoteStone(data.x, data.y);
    } else if (data.type === 'undo') {
        gameTable.undoRemote();
    } else if (data.type === 'redo') {
        gameTable.redoRemote();
    } else if (data.type === 'renju') {
        gameTable.setRenju(data.enabled);
    }
}

// ── 원격으로 데이터 전송 ──────────────────────────────────
export function sendAction(data) {
    if (MP.conn && MP.conn.open) {
        MP.conn.send(data);
    }
}

// ── 방 만들기 (HOST) ──────────────────────────────────────
export async function createRoom() {
    setStatus('연결 서버에 접속 중...', '');
    try {
        await loadPeerJS();
    } catch {
        setStatus('❌ PeerJS 로드 실패. 네트워크를 확인해주세요.', 'error');
        return;
    }

    if (MP.peer) { MP.peer.destroy(); }

    MP.role = 'host';
    MP.peer = new Peer();

    MP.peer.on('open', (id) => {
        const codeEl = $('.room-code-display');
        if (codeEl) codeEl.textContent = id;
        showScreen('mp-screen-waiting');
        setStatus('상대방이 참가하기를 기다리는 중...', '');
    });

    MP.peer.on('connection', (conn) => {
        setupConnection(conn);
    });

    MP.peer.on('error', (err) => {
        setStatus('오류: ' + err.message, 'error');
    });
}

// ── 방 참가 (GUEST) ───────────────────────────────────────
export async function joinRoom(roomCode) {
    if (!roomCode.trim()) {
        setStatus('방 코드를 입력해주세요.', 'error');
        return;
    }
    setStatus('연결 중...', '');
    try {
        await loadPeerJS();
    } catch {
        setStatus('❌ PeerJS 로드 실패. 네트워크를 확인해주세요.', 'error');
        return;
    }

    if (MP.peer) { MP.peer.destroy(); }

    MP.role = 'guest';
    MP.peer = new Peer();

    MP.peer.on('open', () => {
        const conn = MP.peer.connect(roomCode.trim(), { reliable: true });
        setupConnection(conn);
    });

    MP.peer.on('error', (err) => {
        setStatus('연결 실패: 방 코드를 확인해주세요.', 'error');
    });
}

// ── 세션 종료 ─────────────────────────────────────────────
export function leaveRoom() {
    if (MP.conn) MP.conn.close();
    if (MP.peer) MP.peer.destroy();
    MP.peer = null;
    MP.conn = null;
    MP.role = null;
    MP.active = false;
    showScreen('mp-screen-lobby');
    setStatus('');
    gameTable.resetGame(null); // 로컬 모드로
}

// ── 멀티 모달 초기화 ──────────────────────────────────────
export function initMultiUI() {
    // 방 만들기 버튼
    const createBtn = document.getElementById('mp-create-btn');
    if (createBtn) createBtn.addEventListener('click', createRoom);

    // 방 참가 버튼
    const joinBtn = document.getElementById('mp-join-btn');
    if (joinBtn) joinBtn.addEventListener('click', () => {
        const input = document.getElementById('mp-room-input');
        joinRoom(input?.value || '');
    });

    // 방 코드 복사
    const copyBtn = document.getElementById('mp-copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', () => {
        const code = $('.room-code-display')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = '✓ 복사됨';
            setTimeout(() => copyBtn.textContent = '복사', 1500);
        });
    });

    // 나가기
    document.querySelectorAll('.mp-leave-btn').forEach(btn => {
        btn.addEventListener('click', leaveRoom);
    });

    // 멀티 버튼 클릭 → 모달 열기/닫기
    const multiBtn = document.getElementById('multi-btn');
    const modal = document.getElementById('mp-modal');
    if (multiBtn && modal) {
        multiBtn.addEventListener('click', () => {
            modal.classList.toggle('open');
            if (modal.classList.contains('open') && !MP.active) {
                showScreen('mp-screen-lobby');
            }
        });
        // 모달 바깥 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    // X 닫기 버튼
    const closeBtn = document.getElementById('mp-close-btn');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    // 게임 중 창 닫기
    const closeGameBtn = document.getElementById('mp-close-game-btn');
    if (closeGameBtn && modal) {
        closeGameBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    // Enter 키로 참가
    const roomInput = document.getElementById('mp-room-input');
    if (roomInput) {
        roomInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') joinRoom(roomInput.value);
        });
    }
}
