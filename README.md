# SQL Injection Lab

교육 목적으로 제작된 의도적 취약 환경입니다. 실제 서비스 환경에서는 절대 사용하면 안 됩니다.

## 개요

이 프로젝트는 `sql.js` 기반의 메모리 내 SQLite 데이터베이스와 정적 프런트엔드를 사용해 SQL Injection 주요 유형을 실습하도록 구성된 웹사이트입니다. 모든 Lab은 의도적으로 안전하지 않게 구현되어 있으며, 한국어 UI와 진행률 저장 기능을 포함합니다.

## Lab 목록

1. 로그인 우회 (`lab1-login`)
2. UNION 기반 데이터 추출 (`lab2-union`)
3. Boolean Blind SQL Injection (`lab3-blind`)
4. Error-Based SQL Injection (`lab4-error`)
5. Time-Based Blind SQL Injection (`lab5-time`)
6. Stacked Queries (`lab6-stacked`)
7. WAF 우회 (`lab7-waf`)

## 기술 스택

- `sql.js` 기반 SQLite 에뮬레이션
- Vercel Serverless Functions
- HTML / CSS / Vanilla JavaScript
- `localStorage` 기반 진행률 저장

## 로컬 실행

```bash
cd /mnt/d/project/sql-injection-lab
npm install
npx vercel dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 배포

```bash
cd /mnt/d/project/sql-injection-lab
vercel
```

프로덕션 배포는 다음과 같습니다.

```bash
vercel --prod
```

## 윤리 경고

- 이 프로젝트는 교육 및 방어 훈련용입니다.
- 본 코드를 실제 시스템에 적용하면 심각한 보안 사고로 이어질 수 있습니다.
- 허가되지 않은 시스템에 대한 공격 시도는 불법일 수 있습니다.
- 실습은 반드시 로컬 환경 또는 승인된 교육 환경에서만 수행해야 합니다.
