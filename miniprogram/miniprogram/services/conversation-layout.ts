/** A keyboard may cover the window or resize it; subtract only the uncovered part. */
export function conversationViewport(windowHeight:number, baselineHeight:number, headerHeight:number, keyboardHeight:number) {
  const resized=Math.max(0,baselineHeight-windowHeight);
  const covered=Math.max(0,keyboardHeight-resized);
  return {height:Math.max(0,Math.floor(windowHeight-headerHeight-covered)),keyboardOpen:keyboardHeight>0};
}

export function nearConversationEnd(scrollTop:number, scrollHeight:number, viewportHeight:number) {
  return scrollHeight-scrollTop-viewportHeight<=80;
}
