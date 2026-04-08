const FLAGS = {
  1: "FLAG{l0gin_byp4ss_succ3ss}",
  2: "FLAG{uni0n_s3lect_mast3r}",
  3: "FLAG{bl1nd_b00lean_pr0}",
  4: "FLAG{3rr0r_b4sed_extr4ct}",
  5: "FLAG{t1me_b4sed_p4tience}",
  6: "FLAG{st4cked_qu3ry_p0wer}",
  7: "FLAG{w4f_byp4ss_n1nja}"
};

const FLAG_STORAGE_KEY = "sqlilab_flags";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeApiBody(body) {
  if (!body || typeof body !== "object" || body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

function getFlagStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FLAG_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function setFlagStore(store) {
  localStorage.setItem(FLAG_STORAGE_KEY, JSON.stringify(store));
}

function getSavedFlag(labId) {
  return getFlagStore()[String(labId)] || "";
}

function getCompletedLabs() {
  const store = getFlagStore();
  return Object.keys(FLAGS).filter((labId) => store[labId] === FLAGS[labId]);
}

async function apiCall(url, options = {}) {
  const start = Date.now();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: normalizeApiBody(options.body)
    });

    const text = await response.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = { raw: text };
      }
    }

    data._ok = response.ok;
    data._status = response.status;
    data._responseTime = Date.now() - start;
    return data;
  } catch (error) {
    return {
      _ok: false,
      _status: 0,
      _responseTime: Date.now() - start,
      error: error.message || "요청에 실패했습니다."
    };
  }
}

function renderTable(data, containerId) {
  const container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;

  if (!container) {
    return;
  }

  if (!Array.isArray(data) || !data.length) {
    container.innerHTML = '<div class="empty-state">표시할 데이터가 없습니다.</div>';
    return;
  }

  const columns = Array.from(
    data.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );

  const header = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const rows = data
    .map((row) => {
      const cells = columns
        .map((column) => `<td>${escapeHtml(row?.[column] ?? "")}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  container.innerHTML = `
    <div style="overflow:auto;">
      <table class="result-table">
        <thead><tr>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function replaceLiteral(source, search, replacement) {
  if (!search) {
    return source;
  }

  return source.split(search).join(replacement);
}

function alphaIndex(index) {
  let current = index + 1;
  let result = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

function highlightSQL(query, userInput) {
  let output = escapeHtml(query || "");
  const tokens = [];
  const inputs = Array.isArray(userInput) ? userInput : [userInput];
  const uniqueInputs = Array.from(
    new Set(
      inputs
        .map((value) => escapeHtml(String(value ?? "")))
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
    )
  );

  function protectMatch(match, className) {
    const token = `@@SQLTOKEN${alphaIndex(tokens.length)}@@`;
    tokens.push(`<span class="${className}">${match}</span>`);
    return token;
  }

  uniqueInputs.forEach((input) => {
    output = replaceLiteral(output, input, protectMatch(input, "sql-injection"));
  });

  output = output.replace(/(--[^\n\r]*|\/\*[\s\S]*?\*\/)/g, (match) => protectMatch(match, "sql-comment"));
  output = output.replace(/'[^']*'|"[^"]*"/g, (match) => protectMatch(match, "sql-string"));
  output = output.replace(/\b\d+(?:\.\d+)?\b/g, (match) => protectMatch(match, "sql-number"));
  output = output.replace(
    /\b(SELECT|FROM|WHERE|AND|OR|UNION|ORDER|BY|INSERT|INTO|VALUES|CASE|WHEN|THEN|ELSE|END|AS|LIKE|CAST|LIMIT|GROUP|HAVING|UPDATE|SET|DELETE|DROP|TABLE|TRUE|FALSE)\b/gi,
    (match) => protectMatch(match, "sql-keyword")
  );

  tokens.forEach((tokenHtml, index) => {
    output = replaceLiteral(output, `@@SQLTOKEN${alphaIndex(index)}@@`, tokenHtml);
  });

  return output;
}

function saveFlag(labId, flag) {
  const normalizedFlag = FLAGS[labId] || flag;

  if (!normalizedFlag) {
    return false;
  }

  const store = getFlagStore();
  store[String(labId)] = normalizedFlag;
  setFlagStore(store);
  updateProgress();
  return true;
}

function checkFlag(labId, userInput) {
  const expected = FLAGS[labId];
  const submitted = String(userInput || "").trim();

  if (!expected || !submitted) {
    return false;
  }

  const isValid = submitted === expected;

  if (isValid) {
    saveFlag(labId, submitted);
  }

  return isValid;
}

function updateProgress() {
  const completed = getCompletedLabs();
  const total = Object.keys(FLAGS).length;
  const percent = Math.round((completed.length / total) * 100);

  document.querySelectorAll("[data-lab-badge]").forEach((badge) => {
    const labId = badge.getAttribute("data-lab-badge");
    const solved = completed.includes(String(labId));

    badge.textContent = solved ? "완료" : "미완료";
    badge.classList.toggle("complete", solved);
    badge.classList.toggle("pending", !solved);
  });

  document.querySelectorAll("[data-lab-card]").forEach((card) => {
    const labId = card.getAttribute("data-lab-card");
    card.classList.toggle("is-complete", completed.includes(String(labId)));
  });

  document.querySelectorAll("[data-progress-bar]").forEach((bar) => {
    bar.style.width = `${percent}%`;
  });

  document.querySelectorAll("[data-progress-text]").forEach((node) => {
    node.textContent = `${completed.length} / ${total} 완료`;
  });

  document.querySelectorAll("[data-progress-percent]").forEach((node) => {
    node.textContent = `${percent}%`;
  });
}

function showConfetti() {
  let canvas = document.getElementById("confettiCanvas");

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confettiCanvas";
    canvas.className = "confetti-canvas";
    document.body.appendChild(canvas);
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();

  const palette = ["#58a6ff", "#3fb950", "#f85149", "#d29922", "#c9d1d9"];
  const particles = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * canvas.height * 0.8,
    size: Math.random() * 6 + 4,
    color: palette[Math.floor(Math.random() * palette.length)],
    velocityX: (Math.random() - 0.5) * 4,
    velocityY: Math.random() * 3 + 2,
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.25
  }));

  const startedAt = performance.now();
  const duration = 1800;

  function frame(now) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.rotation += particle.rotationSpeed;
      particle.velocityY += 0.035;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.72);
      context.restore();
    });

    if (now - startedAt < duration) {
      requestAnimationFrame(frame);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
  window.addEventListener("resize", resize, { once: true });
}

function closeFlagModal() {
  const overlay = document.getElementById("flagModal");

  if (overlay) {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }
}

function showFlagModal(flag, labId) {
  const displayFlag = FLAGS[labId] || flag;

  if (!displayFlag) {
    return;
  }

  saveFlag(labId, displayFlag);
  showConfetti();

  let overlay = document.getElementById("flagModal");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "flagModal";
    overlay.className = "modal-overlay flag-modal";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="flagModalTitle">
        <h3 id="flagModalTitle">FLAG 획득</h3>
        <p>실습 완료가 기록되었습니다. 아래 FLAG가 대시보드 진행률에 반영됩니다.</p>
        <div class="modal-flag" id="flagModalValue"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-success" id="flagModalClose">확인</button>
        </div>
      </div>
    `;

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeFlagModal();
      }
    });

    document.body.appendChild(overlay);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeFlagModal();
      }
    });
  }

  const valueNode = document.getElementById("flagModalValue");
  const closeButton = document.getElementById("flagModalClose");

  if (valueNode) {
    valueNode.textContent = displayFlag;
  }

  if (closeButton) {
    closeButton.onclick = closeFlagModal;
  }

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
}

document.addEventListener("DOMContentLoaded", updateProgress);

window.FLAGS = FLAGS;
window.apiCall = apiCall;
window.renderTable = renderTable;
window.highlightSQL = highlightSQL;
window.saveFlag = saveFlag;
window.checkFlag = checkFlag;
window.updateProgress = updateProgress;
window.showConfetti = showConfetti;
window.showFlagModal = showFlagModal;
window.getSavedFlag = getSavedFlag;
window.getCompletedLabs = getCompletedLabs;
window.escapeHtml = escapeHtml;
