// 문서 본문 수정 뒤 무효화되는 선택적 줄 배치 캐시와 ZIP CRC 검사.
const assert=require('node:assert/strict');
const table=Array.from({length:256},(_,i)=>{let n=i;for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function crc32(buffer){let value=0xffffffff;for(const byte of buffer)value=table[(value^byte)&255]^(value>>>8);return (value^0xffffffff)>>>0}
function verifyPayload(raw,size,crc){assert.equal(raw.length,size,'ZIP 해제 길이 일치');assert.equal(crc32(raw),crc,'ZIP 실제 CRC 일치')}
function verifyPlanLayout(xml){assert(!/<(?:[A-Za-z_][\w.-]*:)?linesegarray\b/.test(xml),'복구 계획서는 본문 수정 전 줄 배치 캐시를 보존하지 않음')}
module.exports={crc32,verifyPayload,verifyPlanLayout};
