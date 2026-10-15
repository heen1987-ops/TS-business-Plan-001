#!/usr/bin/env node
'use strict';
// Structural checks only. No network calls, source parsing, legal decisions or approval execution.
const fs = require('node:fs');
const profiles = require('./agency-profiles.json').profiles;
const TYPES = ['INFORMATION_SYSTEM', 'R_AND_D', 'OTHER'];
const INSTRUMENTS = ['PROCUREMENT', 'AGREEMENT'];
const STAGES = ['PROPOSAL', 'PROJECT_MANAGEMENT', 'AGENCY_ONBOARDING'];
const KINDS = ['GUIDANCE', 'NOTICE', 'RFP', 'PROPOSAL_DRAFT', 'CONTRACT', 'AGREEMENT', 'APPROVED_PLAN', 'APPROVAL_RECORD', 'EVIDENCE'];
const CONTEXT = ['agencyId', 'agencyRole', 'projectId', 'businessType', 'instrument', 'noticeId', 'noticeRevision'];
const has = value => typeof value === 'string' && value.trim() !== '' && value !== 'UNKNOWN';
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const array = value => Array.isArray(value) ? value : [];
const issue = (issues, code, path, message) => issues.push({ code, path, message });

function validateAgencyProfile(profile) {
  const issues = [];
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return { valid: false, issues: [{ code: 'PROFILE_REQUIRED', path: 'agencyProfile', message: '기관 프로필 객체가 필요하다.' }] };
  }
  for (const key of ['id', 'name', 'status']) if (!has(profile[key])) issue(issues, 'PROFILE_FIELD_REQUIRED', `agencyProfile.${key}`, '기관 프로필 필수 필드가 없다.');
  for (const key of ['officialDomains', 'businessTypes', 'instruments', 'sourceIds', 'requiredContext', 'unknowns', 'branches']) {
    if (!Array.isArray(profile[key])) issue(issues, 'PROFILE_ARRAY_REQUIRED', `agencyProfile.${key}`, '목록 필드가 필요하다.');
  }
  if (!['DRAFT_REFERENCE', 'TEMPLATE', 'FUTURE', 'PROJECT_REVIEWED'].includes(profile.status)) issue(issues, 'PROFILE_STATUS_INVALID', 'agencyProfile.status', '지원하지 않는 검토 상태다.');
  if (profile.status !== 'TEMPLATE' && profile.status !== 'FUTURE') {
    for (const key of ['officialDomains', 'businessTypes', 'instruments', 'sourceIds', 'branches']) if (!array(profile[key]).length) issue(issues, 'PROFILE_SCOPE_MISSING', `agencyProfile.${key}`, '기관 정체성과 범위 및 근거를 입력해야 한다.');
  }
  if (array(profile.officialDomains).some(domain => typeof domain !== 'string' || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain))) issue(issues, 'PROFILE_DOMAIN_INVALID', 'agencyProfile.officialDomains', 'URL이 아닌 공식 도메인 이름을 입력한다.');
  if (array(profile.businessTypes).some(value => !TYPES.includes(value))) issue(issues, 'PROFILE_BUSINESS_TYPE_INVALID', 'agencyProfile.businessTypes', '사업유형이 올바르지 않다.');
  if (array(profile.instruments).some(value => !INSTRUMENTS.includes(value))) issue(issues, 'PROFILE_INSTRUMENT_INVALID', 'agencyProfile.instruments', '계약/협약 방식이 올바르지 않다.');
  if (array(profile.branches).some(value => !['PROPOSAL', 'PROJECT_MANAGEMENT'].includes(value))) issue(issues, 'PROFILE_BRANCH_INVALID', 'agencyProfile.branches', '지원 분기가 올바르지 않다.');
  if (profile.status === 'PROJECT_REVIEWED' && (!has(profile.reviewEvidenceId) || !profile.reviewContext || !has(profile.reviewContext.projectId) || !has(profile.reviewContext.noticeId) || !has(profile.reviewContext.noticeRevision))) issue(issues, 'PROFILE_REVIEW_EVIDENCE_REQUIRED', 'agencyProfile.reviewContext', '프로젝트 검토 주장에는 범위와 검토 근거 ID가 필요하다.');
  if (['EDU', 'HOSPITAL'].includes(profile.id) && !['TEMPLATE', 'FUTURE'].includes(profile.status)) issue(issues, 'PROFILE_PLACEHOLDER', 'agencyProfile.id', '분야 템플릿을 실제 기관으로 승격할 수 없다.');
  return { valid: issues.length === 0, issues };
}

function inspectRequest(input) {
  const issues = [];
  const out = { schemaVersion: 'cck-growth-inspection/1', route: 'cck-public-business', readiness: 'NEEDS_INPUT', issues, claimChecks: [], baselineStatus: 'NOT_APPLICABLE', changes: { pending: [], evidenceLinked: [] }, execution: 'not_run', limits: ['입력 구조·출처 연결 검사이며 원문 내용·법적 적용·승인 진위·접근권한을 검증하지 않는다.', 'READY_FOR_DRAFT는 제출·승인·수주·운영 완료를 뜻하지 않는다.'] };
  if (!input || typeof input !== 'object' || Array.isArray(input)) { issue(issues, 'INPUT_REQUIRED', '', '입력 객체가 필요하다.'); return out; }
  if (input.schemaVersion !== 'cck-growth-request/1') issue(issues, 'SCHEMA_VERSION', 'schemaVersion', '지원하는 입력 판본을 지정한다.');
  const context = input.context && typeof input.context === 'object' ? input.context : {};
  const stage = context.stage;
  out.route = ({ PROPOSAL: 'cck-proposal', PROJECT_MANAGEMENT: 'cck-project-management', AGENCY_ONBOARDING: 'cck-agency-onboarding' })[stage] || 'cck-public-business';
  if (!STAGES.includes(stage)) issue(issues, 'STAGE_REQUIRED', 'context.stage', '업무 단계를 선택한다.');
  for (const key of ['agencyId', 'agencyName', 'asOf']) if (!has(context[key])) issue(issues, 'CONTEXT_REQUIRED', `context.${key}`, '업무 범위 필수 값이 없다.');
  if (!validDate(context.asOf)) issue(issues, 'AS_OF_REQUIRED', 'context.asOf', '실제 달력 날짜인 기준일 YYYY-MM-DD가 필요하다.');
  if (!['CONTRACTING_AUTHORITY', 'MANAGING_AGENCY', 'DEMAND_ORGANIZATION', 'PERFORMER'].includes(context.agencyRole)) issue(issues, 'AGENCY_ROLE_REQUIRED', 'context.agencyRole', '발주·전문·수요·수행기관 역할을 명시한다.');
  if (['EDU', 'HOSPITAL'].includes(context.agencyId)) issue(issues, 'AGENCY_UNRESOLVED', 'context.agencyId', '실제 교육청/학교/병원의 기관 프로필을 먼저 등록한다.');
  const profile = input.agencyProfile || profiles.find(item => item.id === context.agencyId);
  const profileCheck = validateAgencyProfile(profile);
  issues.push(...profileCheck.issues);
  if (profile && (profile.id !== context.agencyId || profile.name !== context.agencyName)) issue(issues, 'PROFILE_CONTEXT_MISMATCH', 'agencyProfile', '기관 ID와 명칭이 현재 범위와 다르다.');
  if (profile && ['TEMPLATE', 'FUTURE'].includes(profile.status)) issue(issues, 'PROFILE_NOT_READY', 'agencyProfile.status', '실제 기관/사업 적용을 위한 온보딩이 필요하다.');
  if (profile && stage !== 'AGENCY_ONBOARDING') {
    if (!array(profile.branches).includes(stage)) issue(issues, 'PROFILE_BRANCH_MISMATCH', 'context.stage', '기관 프로필이 지원하지 않는 업무 분기다.');
    for (const key of array(profile.requiredContext)) if (!has(context[key])) issue(issues, 'PROFILE_CONTEXT_REQUIRED', `context.${key}`, '기관별 필수 범위 필드가 없다.');
    if (profile.status === 'PROJECT_REVIEWED') for (const [key, value] of Object.entries(profile.reviewContext || {})) if (!has(value) || context[key] !== value) issue(issues, 'PROFILE_REVIEW_CONTEXT_MISMATCH', `agencyProfile.reviewContext.${key}`, '다른 사업에서 검토된 기관 프로필을 현재 사업에 확정 적용하지 않는다.');
  }
  if (stage !== 'AGENCY_ONBOARDING') {
    for (const key of ['projectId', 'noticeId', 'noticeRevision']) if (!has(context[key])) issue(issues, 'CONTEXT_REQUIRED', `context.${key}`, '기관·사업·공고·차수를 확인한다.');
    if (!TYPES.includes(context.businessType)) issue(issues, 'BUSINESS_TYPE_REQUIRED', 'context.businessType', '기관명으로 사업유형을 추정하지 않는다.');
    if (!INSTRUMENTS.includes(context.instrument)) issue(issues, 'INSTRUMENT_REQUIRED', 'context.instrument', '계약/협약 방식을 확인한다.');
    if (profile && !array(profile.businessTypes).includes(context.businessType)) issue(issues, 'PROFILE_BUSINESS_MISMATCH', 'context.businessType', '기관 프로필에 없는 사업유형이다.');
    if (profile && !array(profile.instruments).includes(context.instrument)) issue(issues, 'PROFILE_INSTRUMENT_MISMATCH', 'context.instrument', '기관 프로필에 없는 계약/협약 방식이다.');
  }
  if (stage === 'PROJECT_MANAGEMENT') {
    for (const key of ['agreementId', 'baselineRevision']) if (!has(context[key])) issue(issues, 'MANAGEMENT_CONTEXT_REQUIRED', `context.${key}`, '실제 계약/협약과 기준선 판본이 필요하다.');
    out.baselineStatus = 'UNVERIFIED';
  }
  const sources = new Map();
  if (!Array.isArray(input.sources)) issue(issues, 'SOURCES_REQUIRED', 'sources', '근거 목록이 필요하다.');
  for (const [index, source] of array(input.sources).entries()) {
    const path = `sources[${index}]`;
    if (!source || typeof source !== 'object') { issue(issues, 'SOURCE_INVALID', path, '출처 객체가 필요하다.'); continue; }
    const before = issues.length;
    for (const key of ['id', 'title', 'version', 'location']) if (!has(source[key])) issue(issues, 'SOURCE_FIELD_REQUIRED', `${path}.${key}`, '원문 식별·판본·위치를 입력한다.');
    if (!has(source.url) && !has(source.path)) issue(issues, 'SOURCE_REFERENCE_REQUIRED', path, '원문 URL 또는 파일 참조가 필요하다.');
    if (sources.has(source.id)) issue(issues, 'SOURCE_DUPLICATE', `${path}.id`, '출처 ID가 중복된다.');
    if (!KINDS.includes(source.kind)) issue(issues, 'SOURCE_KIND_REQUIRED', `${path}.kind`, '출처 종류가 필요하다.');
    if (!['PROJECT', 'AGENCY', 'GENERAL', 'HISTORICAL'].includes(source.scope)) issue(issues, 'SOURCE_SCOPE_REQUIRED', `${path}.scope`, '명시적 출처 범위가 필요하다.');
    const sc = source.context || {};
    if (source.scope === 'PROJECT') {
      const keys = stage === 'PROJECT_MANAGEMENT' ? [...CONTEXT, 'agreementId', 'baselineRevision'] : CONTEXT;
      for (const key of keys) if (!has(sc[key]) || !has(context[key]) || sc[key] !== context[key]) issue(issues, 'SOURCE_CONTEXT_MISMATCH', `${path}.context.${key}`, '다른 기관·사업·공고·협약·판본의 출처는 현재 근거로 사용할 수 없다.');
    } else if (source.scope === 'HISTORICAL') {
      for (const key of CONTEXT) if (!has(sc[key])) issue(issues, 'HISTORY_CONTEXT_REQUIRED', `${path}.context.${key}`, '과거 실적의 원 기관·사업·공고·판본을 보존한다.');
      if (source.kind !== 'EVIDENCE') issue(issues, 'SOURCE_SCOPE_KIND', path, '과거 범위는 실적 EVIDENCE만 허용한다.');
      const usage = source.usage || {};
      for (const key of CONTEXT) if (!has(usage.context?.[key]) || usage.context[key] !== context[key]) issue(issues, 'HISTORY_USAGE_MISMATCH', `${path}.usage.context.${key}`, '과거 실적의 현재 인용 범위를 명시한다.');
      if (usage.purpose !== 'PAST_PERFORMANCE' || !has(usage.permissionEvidenceRef)) issue(issues, 'HISTORY_USAGE_REQUIRED', `${path}.usage`, '실적 인용 목적과 현재 사용 근거 ID가 필요하다.');
    } else if (source.scope === 'AGENCY') {
      if (!has(sc.agencyId) || sc.agencyId !== context.agencyId) issue(issues, 'SOURCE_CONTEXT_MISMATCH', `${path}.context.agencyId`, '기관 공통 자료의 기관이 다르다.');
      if (source.kind !== 'GUIDANCE') issue(issues, 'SOURCE_SCOPE_KIND', path, '기관 일반 범위는 GUIDANCE만 허용한다.');
    } else if (source.scope === 'GENERAL' && source.kind !== 'GUIDANCE') issue(issues, 'SOURCE_SCOPE_KIND', path, '공통 범위는 GUIDANCE만 허용한다.');
    if (!['TEXT_REVIEWED', 'METADATA_ONLY', 'UNKNOWN'].includes(source.verification)) issue(issues, 'SOURCE_VERIFICATION_INVALID', `${path}.verification`, '열람 수준을 명시한다.');
    sources.set(source.id, { ...source, structurallyLinked: issues.length === before && source.verification === 'TEXT_REVIEWED' });
  }
  const projectEvidence = id => { const s = sources.get(id); return !!s && s.structurallyLinked && s.scope === 'PROJECT' && s.kind !== 'PROPOSAL_DRAFT'; };
  const historyEvidence = id => { const s = sources.get(id); return !!s && s.structurallyLinked && s.scope === 'HISTORICAL' && projectEvidence(s.usage?.permissionEvidenceRef) && sources.get(s.usage.permissionEvidenceRef).kind === 'EVIDENCE'; };
  if (profile?.status === 'PROJECT_REVIEWED' && !projectEvidence(profile.reviewEvidenceId)) issue(issues, 'PROFILE_REVIEW_UNVERIFIED', 'agencyProfile.reviewEvidenceId', '현재 범위의 기관 적용 검토 근거를 연결한다.');
  if (stage === 'PROPOSAL' && ![...sources.values()].some(s => projectEvidence(s.id) && ['NOTICE', 'RFP'].includes(s.kind))) issue(issues, 'NOTICE_EVIDENCE_REQUIRED', 'sources', '현재 공고/RFP의 본문 검토 출처를 연결한다.');
  if (stage === 'AGENCY_ONBOARDING' && profile) {
    for (const id of array(profile.sourceIds)) { const s = sources.get(id); if (!s || !s.structurallyLinked || s.scope !== 'AGENCY' || s.kind !== 'GUIDANCE') issue(issues, 'PROFILE_SOURCE_UNVERIFIED', 'agencyProfile.sourceIds', '새 기관 자료의 원문과 기관 범위 연결을 확인한다.'); }
  }
  for (const [index, claim] of array(input.claims).entries()) {
    if (!claim || !has(claim.id) || !has(claim.text)) { issue(issues, 'CLAIM_INVALID', `claims[${index}]`, '주장 ID와 본문이 필요하다.'); continue; }
    const allowed = ['PAST_PERFORMANCE', 'CAPABILITY', 'DEADLINE', 'APPROVAL', 'PROPOSED'];
    let supported = array(claim.evidenceRefs).length > 0 && array(claim.evidenceRefs).every(id => projectEvidence(id) || (claim.kind === 'PAST_PERFORMANCE' && historyEvidence(id)));
    if (claim.kind === 'APPROVAL') supported = supported && array(claim.evidenceRefs).some(id => sources.get(id)?.kind === 'APPROVAL_RECORD');
    if (claim.kind === 'DEADLINE') supported = supported && array(claim.evidenceRefs).some(id => ['NOTICE', 'RFP', 'CONTRACT', 'AGREEMENT', 'APPROVED_PLAN'].includes(sources.get(id)?.kind));
    const status = claim.kind === 'PROPOSED' ? 'PROPOSED' : supported && allowed.includes(claim.kind) ? 'EVIDENCE_LINKED' : 'UNSUPPORTED';
    out.claimChecks.push({ id: claim.id, status });
    if (status === 'UNSUPPORTED') issue(issues, 'CLAIM_UNSUPPORTED', `claims[${index}]`, '해당 범위의 본문 검토 근거가 없는 사실 주장은 미확인으로 유지한다.');
  }
  const approvalLinked = approval => !!approval && approval.status === 'EVIDENCE_REVIEWED' && has(approval.location) && has(approval.reviewedBy) && has(approval.reviewedAt) && projectEvidence(approval.sourceId) && sources.get(approval.sourceId).kind === 'APPROVAL_RECORD';
  if (stage === 'PROJECT_MANAGEMENT') {
    const baseline = input.baseline;
    const baselineSources = array(baseline?.sourceIds);
    const linked = baseline && has(baseline.id) && has(baseline.revision) && baseline.revision === context.baselineRevision && baselineSources.length > 0 && baselineSources.every(id => projectEvidence(id) && ['CONTRACT', 'AGREEMENT', 'APPROVED_PLAN'].includes(sources.get(id).kind)) && approvalLinked(baseline.approval);
    if (linked) out.baselineStatus = 'EVIDENCE_LINKED';
    else issue(issues, 'BASELINE_UNVERIFIED', 'baseline', '승인 기준선과 별도 승인 증거 연결을 확인한다. 제안 초안/승인 문자열만으로 확정하지 않는다.');
  }
  for (const [index, change] of array(input.changes).entries()) {
    if (!change || !has(change.id)) { issue(issues, 'CHANGE_INVALID', `changes[${index}]`, '변경 ID가 필요하다.'); continue; }
    (stage === 'PROJECT_MANAGEMENT' && approvalLinked(change.approval) ? out.changes.evidenceLinked : out.changes.pending).push(change.id);
  }
  out.readiness = issues.length === 0 ? 'READY_FOR_DRAFT' : 'NEEDS_INPUT';
  return out;
}

module.exports = { inspectRequest, validateAgencyProfile };
if (require.main === module) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node inspect-request.cjs <request.json>');
    const text = fs.readFileSync(process.argv[2], 'utf8');
    if (Buffer.byteLength(text, 'utf8') > 1024 * 1024) throw new Error('Input exceeds 1 MiB');
    const result = inspectRequest(JSON.parse(text.replace(/^\uFEFF/, '')));
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (result.readiness !== 'READY_FOR_DRAFT') process.exitCode = 2;
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
