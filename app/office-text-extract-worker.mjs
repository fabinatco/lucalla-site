// LOCAL candidate. Bounded XLSX/PPTX XML only; no original-file upload, links, macros or formula execution.
const limit=1048576,fail=code=>{throw Error(code)};
function crc32(b){let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
async function officeXML(bytes,kind){
 if(!(bytes instanceof ArrayBuffer)||bytes.byteLength>2097152||bytes.byteLength<22||!['xlsx','pptx'].includes(kind))fail('invalid');
 const d=new DataView(bytes),u=new Uint8Array(bytes),len=u.length;let end=-1;for(let p=len-22;p>=Math.max(0,len-65557);p--)if(d.getUint32(p,true)===0x06054b50&&p+22+d.getUint16(p+20,true)===len){end=p;break}
 if(end<0||d.getUint16(end+4,true)||d.getUint16(end+6,true))fail('invalid');const count=d.getUint16(end+10,true),size=d.getUint32(end+12,true),start=d.getUint32(end+16,true);if(count<1||count>2000||d.getUint16(end+8,true)!==count||size>262144||start+size!==end)fail('invalid');
 const targets=[],names=new Set();let p=start,declared=0;
 for(let i=0;i<count;i++){
  if(p+46>end||d.getUint32(p,true)!==0x02014b50)fail('invalid');const flags=d.getUint16(p+8,true),method=d.getUint16(p+10,true),crc=d.getUint32(p+16,true),compressed=d.getUint32(p+20,true),plain=d.getUint32(p+24,true),n=d.getUint16(p+28,true),extra=d.getUint16(p+30,true),comment=d.getUint16(p+32,true),disk=d.getUint16(p+34,true),offset=d.getUint32(p+42,true),next=p+46+n+extra+comment;
  if(next>end||disk||flags&1||compressed===0xffffffff||plain===0xffffffff||offset>=start)fail('invalid');const name=new TextDecoder('utf-8',{fatal:true}).decode(u.subarray(p+46,p+46+n));if(names.has(name)||/(?:^|\/)vbaProject\.bin$/i.test(name))fail('invalid');names.add(name);
  const selected=kind==='xlsx'?/^xl\/(?:worksheets\/sheet[1-9][0-9]*\.xml|sharedStrings\.xml)$/.test(name):/^ppt\/slides\/slide[1-9][0-9]*\.xml$/.test(name);
  if(selected){declared+=plain;if(plain>524288||declared>limit||compressed>2097152||![0,8].includes(method))fail('size');targets.push({flags,method,crc,compressed,plain,offset,name})}p=next;
 }
 if(p!==end||!targets.length)fail('invalid');const documentCount=targets.filter(x=>!x.name.endsWith('sharedStrings.xml')).length;if(!documentCount||documentCount>(kind==='xlsx'?10:50))fail('size');const result=[];let actualTotal=0;
 for(const t of targets){const o=t.offset;if(o+30>start||d.getUint32(o,true)!==0x04034b50||d.getUint16(o+6,true)!==t.flags||d.getUint16(o+8,true)!==t.method)fail('invalid');const n=d.getUint16(o+26,true),extra=d.getUint16(o+28,true),begin=o+30+n+extra;if(begin+t.compressed>start||new TextDecoder().decode(u.subarray(o+30,o+30+n))!==t.name)fail('invalid');const input=u.slice(begin,begin+t.compressed);let output;
  if(t.method===0)output=input;else{const reader=new Blob([input]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(),chunks=[];let total=0;try{for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>524288||actualTotal+total>limit){await reader.cancel();fail('size')}chunks.push(value)}}finally{reader.releaseLock()}output=new Uint8Array(total);let at=0;for(const chunk of chunks){output.set(chunk,at);at+=chunk.length}}
  actualTotal+=output.length;if(output.length!==t.plain||crc32(output)!==t.crc||actualTotal>limit)fail('invalid');const xml=new TextDecoder('utf-8',{fatal:true}).decode(output);if(/<!/i.test(xml)||/<\?(?!xml\s)/i.test(xml))fail('invalid');result.push({name:t.name,xml});
 }
 return result.sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}));
}
self.onmessage=async e=>{try{self.postMessage({ok:true,parts:await officeXML(e.data.bytes,e.data.kind)})}catch(e){self.postMessage({ok:false,error:e.message==='size'?'size':'invalid'})}};
