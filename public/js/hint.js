const LAB_HINTS = {
  1: [
    {
      title: "1단계 힌트",
      content: "<p>입력값은 작은따옴표(<code>'</code>)로 감싸져 SQL에 삽입됩니다. 따옴표를 닫을 수 있는지부터 생각해 보세요.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>로그인 조건은 <code>username</code> 과 <code>password</code> 가 모두 맞아야 합니다. <code>OR</code> 연산으로 전체 조건을 참으로 만들 수 있습니다.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p>예시 페이로드: <code>admin'--</code> 또는 <code>' OR 1=1--</code>. 주석으로 뒤쪽 비밀번호 조건을 무시할 수 있습니다.</p>"
    }
  ],
  2: [
    {
      title: "1단계 힌트",
      content: "<p>원래 쿼리는 상품 테이블만 조회합니다. 다른 데이터를 합치려면 <code>UNION SELECT</code> 를 사용해야 합니다.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>먼저 <code>ORDER BY</code> 로 컬럼 개수를 맞춰 보세요. 이후 같은 개수의 컬럼으로 <code>UNION SELECT</code> 를 구성해야 합니다.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p>SQLite 메타데이터는 <code>sqlite_master</code> 에 있습니다. 테이블 이름이나 숨겨진 행을 찾는 방향으로 접근해 보세요.</p>"
    }
  ],
  3: [
    {
      title: "1단계 힌트",
      content: "<p>이 실습은 결과 값 대신 참/거짓만 보여 줍니다. 조건이 참이면 사용자 존재, 거짓이면 사용자 없음으로 바뀝니다.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>문자 하나씩 확인하려면 <code>SUBSTR(...)</code> 를 사용하세요. 먼저 길이를 추정하고, 그 다음 각 위치의 문자를 비교합니다.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p><code>LENGTH(...)</code> 와 <code>SUBSTR(...)</code> 를 조합하면 비밀 문자열을 순서대로 복원할 수 있습니다. 예: <code>1 OR SUBSTR((SELECT password FROM users WHERE username='flag_keeper'),1,1)='F'</code></p>"
    },
    {
      title: "4단계 자동화 예시",
      content: `
        <p>반복 추측은 스크립트로 자동화하는 편이 효율적입니다.</p>
        <pre class="code-block"><code>const chars = "FLAG{}_abcdefghijklmnopqrstuvwxyz0123456789";
let result = "";

for (let pos = 1; pos &lt;= 32; pos += 1) {
  for (const ch of chars) {
    const payload = \`1 OR SUBSTR((SELECT password FROM users WHERE username='flag_keeper'),\${pos},1)='\${ch}'\`;
    // /api/lab3-blind?id=${encodeURIComponent(payload)}
    // exists === true 이면 해당 문자가 맞습니다.
  }
}</code></pre>
      `
    }
  ],
  4: [
    {
      title: "1단계 힌트",
      content: "<p>정상 응답 대신 에러 메시지를 유도하면, 원래 보이지 않던 데이터가 노출될 수 있습니다.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>SQLite에서는 타입 변환 과정에서 오류를 만들 수 있습니다. <code>CAST</code> 나 잘못된 연산을 이용해 보세요.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p>예시 방향: <code>1 UNION SELECT 1, CAST((SELECT flag FROM secret_flags WHERE lab_id=4) AS INTEGER), 3, 4, 5, 6</code>. 컬럼 수와 타입을 맞춰가며 조정하세요.</p>"
    }
  ],
  5: [
    {
      title: "1단계 힌트",
      content: "<p>이 Lab은 본문 내용보다 응답 시간 차이가 핵심입니다. 조건이 참이면 지연이 발생합니다.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>입력값 앞에 <code>delay_if_true:</code> 를 붙이면 괄호 안 SQL 조건이 평가됩니다. 참이면 약 2초 지연됩니다.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p>예시 페이로드: <code>delay_if_true:(SELECT SUBSTR(flag,1,1) FROM secret_flags WHERE lab_id=5)='F'</code>. 한 글자씩 참/거짓을 측정하세요.</p>"
    }
  ],
  6: [
    {
      title: "1단계 힌트",
      content: "<p>입력값은 문자열로 INSERT 문 안에 들어갑니다. 문자열을 닫고 새 SQL 문을 이어 붙일 수 있는지 보세요.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>여러 문장을 실행하려면 세미콜론(<code>;</code>)이 필요합니다. 마지막 남은 구문은 주석으로 정리하면 편합니다.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p>예시 페이로드: <code>x'); SELECT flag FROM secret_flags WHERE lab_id=6;--</code>. 추가 SELECT 결과가 함께 반환되는지 확인해 보세요.</p>"
    }
  ],
  7: [
    {
      title: "1단계 힌트",
      content: "<p>난이도에 따라 차단 규칙이 달라집니다. 먼저 어떤 키워드가 막히는지 관찰하세요.</p>"
    },
    {
      title: "2단계 힌트",
      content: "<p>Low/Medium은 대소문자 처리나 단순 문자열 포함 검사 위주입니다. 키워드를 쪼개거나 중복시키는 방식이 통할 수 있습니다.</p>"
    },
    {
      title: "3단계 힌트",
      content: "<p>High는 정규식으로 더 많이 막습니다. 난이도별 우회 예시를 비교해 보세요. Low: <code>union select</code>, Medium: <code>unION seLECT</code> 는 막힐 수 있으므로 다른 표현을 시도, High: 이중 키워드나 인코딩 대신 논리 우회 구조 자체를 바꿔야 합니다.</p>"
    }
  ]
};

function initHints(labId, containerId = "hintContainer") {
  const container = document.getElementById(containerId);
  const hints = LAB_HINTS[labId] || [];

  if (!container) {
    return;
  }

  if (!hints.length) {
    container.innerHTML = '<div class="empty-state">등록된 힌트가 없습니다.</div>';
    return;
  }

  container.innerHTML = `
    <div class="hint-list">
      ${hints
        .map(
          (hint, index) => `
            <article class="hint-item${index === 0 ? " is-open" : ""}">
              <button type="button" class="hint-toggle" aria-expanded="${index === 0 ? "true" : "false"}">
                <span>${hint.title}</span>
                <span>${index === 0 ? "접기" : "열기"}</span>
              </button>
              <div class="hint-content">${hint.content}</div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  container.querySelectorAll(".hint-item").forEach((item) => {
    const button = item.querySelector(".hint-toggle");
    const indicator = button?.querySelector("span:last-child");

    if (!button || !indicator) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      indicator.textContent = isOpen ? "접기" : "열기";
    });
  });
}

window.LAB_HINTS = LAB_HINTS;
window.initHints = initHints;
