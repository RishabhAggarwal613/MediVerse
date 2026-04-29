/**
 * Runs synchronously in <head> before first paint — matches next-themes defaults:
 * attribute="class", storageKey="theme", defaultTheme="system", themes light/dark.
 * Avoids FOUC/hydration where <html> briefly lacks theme classes before client JS runs.
 */
export const NEXT_THEMES_HEAD_INIT = `
(function(){
  try{
    var k='theme';
    var d=document.documentElement;
    var s=['light','dark'];
    var stored=localStorage.getItem(k);
    var t=stored==null||stored===''?'system':stored;
    var r=t==='system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')
      : (t==='dark'||t==='light'?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
    for(var i=0;i<s.length;i++) d.classList.remove(s[i]);
    d.classList.add(r);
    d.style.colorScheme=r==='dark'?'dark':'light';
  }catch(e){}
})();`;
