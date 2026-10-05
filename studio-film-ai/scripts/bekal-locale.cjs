/* Compile-time UI translation: never edits project content or technical IDs. */
const ts = require('typescript');
const path = require('node:path');
const dictionary = require('../src/bekal-id.json');
const normalize = s => s.replace(/\s+/g, ' ').trim();
const translate = s => {
 const value=normalize(s), direct=dictionary[value] || dictionary[value.toLowerCase()];
 if(typeof direct==='string') return direct;
 const match=value.match(/^(Generate|Create|Add|Remove|Delete|Clear|Reset|Select|Choose|Open|Show|Hide|Enable|Disable|Save|Download|Upload|Import|Export|Copy|Edit|Preview|Analyze|Review) (.+?)(\.{3})?$/i);
 if(match) { const object=dictionary[match[2]] || dictionary[match[2].toLowerCase()]; const verb=dictionary[match[1]] || dictionary[match[1].toLowerCase()]; if(typeof object==='string' && typeof verb==='string') return verb+' '+object.toLowerCase()+(match[3] || ''); }
 return s;
};
function localizeSource(source, fileName) {
 const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
 const edits = [];
 let usesLabelHelper=false;
 const displayProps = new Set(['hint', 'usedFor', 'title', 'description', 'desc', 'tooltip', 'placeholder', 'emptyMessage', 'detail', 'message']);
 const attrs = new Set(['title', 'placeholder', 'aria-label', 'alt']);
 function isDisplay(n) {
  let child=n, p=n.parent;
  if(ts.isCallExpression(p) && (p.expression.getText(sf)==='alert' || (p.expression.getText(sf)==='setError' && /\s/.test(n.text)))) return true;
  if(ts.isPropertyAssignment(p)) return displayProps.has(p.name.getText(sf).replace(/['"]/g,''));
  if(ts.isJsxAttribute(p)) return attrs.has(p.name.getText(sf));
  while(p && !ts.isStatement(p)) {
   if(ts.isBinaryExpression(p)) {
    const op=p.operatorToken.kind;
    if (!((op===ts.SyntaxKind.AmpersandAmpersandToken || op===ts.SyntaxKind.BarBarToken || op===ts.SyntaxKind.QuestionQuestionToken) && child===p.right) && op!==ts.SyntaxKind.PlusToken) return false;
   }
   if(ts.isConditionalExpression(p) && child===p.condition) return false;
   if(ts.isCallExpression(p) || ts.isElementAccessExpression(p) || ts.isArrayLiteralExpression(p)) return false;
   if(ts.isJsxExpression(p)) {
    const attr=p.parent;
    return !ts.isJsxAttribute(attr) || attrs.has(attr.name.getText(sf));
   }
   if(ts.isArrowFunction(p) || ts.isFunctionExpression(p)) return false;
   child=p; p=p.parent;
  }
  return false;
 }
 function visit(n) {
  if(ts.isJsxExpression(n) && n.expression && (!ts.isJsxAttribute(n.parent) || attrs.has(n.parent.name.getText(sf)))) {
   const expr=n.expression;
   if((ts.isPropertyAccessExpression(expr) && ['label','hint','usedFor','desc'].includes(expr.name.text)) || (ts.isIdentifier(expr) && ['label','hint','usedFor'].includes(expr.text))) {
    edits.push({start:expr.getStart(sf),end:expr.end,text:'__bekalUiLabel('+expr.getText(sf)+')'});usesLabelHelper=true;
   }
  }
  if(ts.isJsxText(n)) {
   const value=normalize(n.text), converted=translate(value);
   if(converted!==value) edits.push({start:n.getStart(sf),end:n.end,text:n.text.replace(/\S[\s\S]*\S|\S/,converted)});
   else if(dictionary[value]) edits.push({start:n.getStart(sf),end:n.end,text:n.text.replace(/\S[\s\S]*\S|\S/,dictionary[value])});
  } else if(ts.isStringLiteral(n) && isDisplay(n)) {
   const value=translate(n.text);
   if(value!==n.text) edits.push({start:n.getStart(sf),end:n.end,text:JSON.stringify(value)});
  }
  ts.forEachChild(n,visit);
 }
 visit(sf);
 for(const e of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,e.start)+e.text+source.slice(e.end);
 if(usesLabelHelper) { let helper=path.relative(path.dirname(fileName),path.resolve(__dirname,'../src/bekalUiLabel')).replace(/\\/g,'/');if(!helper.startsWith('.'))helper='./'+helper;source='import { bekalUiLabel as __bekalUiLabel } from '+JSON.stringify(helper)+';\n'+source;}
 return source;
}
module.exports={localizeSource};
