
const tabs=[...document.querySelectorAll('[role="tab"]')];
function activate(tab){
 tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});
}
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>activate(tab));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%tabs.length;
  if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i+tabs.length-1)%tabs.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
  if(next!==undefined){event.preventDefault();activate(tabs[next]);tabs[next].focus();}
 });
});
const dialog=document.getElementById('screen-dialog');
document.querySelectorAll('.zoom').forEach(b=>b.addEventListener('click',()=>{
 const source=b.closest('.gallery-panel').querySelector('figure img');
 const img=dialog.querySelector('img');img.src=source.src;img.alt=b.dataset.description;
 dialog.querySelector('figcaption').textContent=b.dataset.description;
 dialog.showModal();
}));
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
