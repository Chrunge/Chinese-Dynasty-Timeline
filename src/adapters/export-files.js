'use strict';
// Binary file encoding is independent of canvas rendering and comparison selection.
(function(root){
 const Zhou=root.Zhou||(root.Zhou={});
function concatExportBytes(chunks){const size=chunks.reduce((n,c)=>n+c.length,0),bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}return bytes;}
function buildImagePDF(images){
 const encode=s=>new TextEncoder().encode(s),objects=[null,encode('<< /Type /Catalog /Pages 2 0 R >>')],kids=images.map((_,i)=>(3+i*3)+' 0 R').join(' ');objects.push(encode('<< /Type /Pages /Count '+images.length+' /Kids ['+kids+'] >>'));
 images.forEach((bytes,i)=>{const pageId=3+i*3,imageId=pageId+1,contentId=pageId+2,content='q\n841.89 0 0 595.28 0 0 cm\n/Im0 Do\nQ\n';objects.push(encode('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 '+imageId+' 0 R >> >> /Contents '+contentId+' 0 R >>'));objects.push(concatExportBytes([encode('<< /Type /XObject /Subtype /Image /Width 2400 /Height 1700 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+bytes.length+' >>\nstream\n'),bytes,encode('\nendstream')]));objects.push(encode('<< /Length '+encode(content).length+' >>\nstream\n'+content+'endstream'));});
 const chunks=[encode('%PDF-1.4\n')],offsets=[0];let position=chunks[0].length;for(let i=1;i<objects.length;i++){offsets[i]=position;const obj=concatExportBytes([encode(i+' 0 obj\n'),objects[i],encode('\nendobj\n')]);chunks.push(obj);position+=obj.length;}const xref=position;chunks.push(encode('xref\n0 '+objects.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n'));return new Blob(chunks,{type:'application/pdf'});
}
function exportCRC32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function buildImagesZIP(files){
 const chunks=[],central=[];let offset=0;const header=(size,signature)=>{const b=new Uint8Array(size),v=new DataView(b.buffer);v.setUint32(0,signature,true);return {b,v};};
 for(let i=0;i<files.length;i++){const bytes=files[i],name=new TextEncoder().encode('zhou-comparison-'+String(i+1).padStart(3,'0')+'.png'),crc=exportCRC32(bytes),h=header(30,0x04034b50);h.v.setUint16(4,20,true);h.v.setUint16(12,33,true);h.v.setUint32(14,crc,true);h.v.setUint32(18,bytes.length,true);h.v.setUint32(22,bytes.length,true);h.v.setUint16(26,name.length,true);chunks.push(h.b,name,bytes);const c=header(46,0x02014b50);c.v.setUint16(4,20,true);c.v.setUint16(6,20,true);c.v.setUint16(14,33,true);c.v.setUint32(16,crc,true);c.v.setUint32(20,bytes.length,true);c.v.setUint32(24,bytes.length,true);c.v.setUint16(28,name.length,true);c.v.setUint32(42,offset,true);central.push(c.b,name);offset+=30+name.length+bytes.length;}
 const centralBytes=concatExportBytes(central),end=header(22,0x06054b50);end.v.setUint16(8,files.length,true);end.v.setUint16(10,files.length,true);end.v.setUint32(12,centralBytes.length,true);end.v.setUint32(16,offset,true);return new Blob([...chunks,centralBytes,end.b],{type:'application/zip'});
}
 Object.assign(Zhou,{concatExportBytes,buildImagePDF,exportCRC32,buildImagesZIP});
})(globalThis);
