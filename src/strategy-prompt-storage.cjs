'use strict';
const key=id=>'ts-strategy-prompt:v1:'+id;
function read(storage,id,fallback){try{const raw=storage.getItem(key(id));if(raw===null)return {text:fallback,saved:false};const item=JSON.parse(raw);if(item.version!==1||typeof item.text!=='string'||item.text.length>50000)throw new Error('invalid');return {...item,saved:true};}catch{return {text:fallback,saved:false,error:'저장본 읽기 실패 · 원문 보존 / 기본 프롬프트 표시'};}}
function write(storage,id,text){try{if(typeof text!=='string'||text.length>50000)throw new Error('invalid');const item={version:1,text,updatedAt:new Date().toISOString()};storage.setItem(key(id),JSON.stringify(item));return {ok:true,...item};}catch{return {ok:false,error:'브라우저 저장 실패 · 현재 편집 내용의 복사 필요'};}}
module.exports={key,read,write};
