// floating background nodes
  (function(){
    const container = document.getElementById('nodes');
    if(!container) return;
    const count = 14;
    for(let i=0;i<count;i++){
      const dot = document.createElement('div');
      dot.className = 'node-dot';
      dot.style.left = Math.random()*100 + 'vw';
      dot.style.top = Math.random()*90 + 'vh';
      dot.style.animationDelay = (Math.random()*8) + 's';
      dot.style.animationDuration = (10 + Math.random()*8) + 's';
      dot.style.opacity = (0.25 + Math.random()*0.4).toFixed(2);
      container.appendChild(dot);
    }
  })();

  // card cursor glow
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });
