"use strict";

const directoryViews = {overview:"数据总览", users:"用户目录", groups:"群聊", publications:"发布记录", review:"社区审核"};
const hints = {users:"昵称、账号或用户编号", groups:"群名称或群编号", publications:"标题或发布编号"};
const visibility = {public:"公开", friends:"好友", private:"仅自己", everyone:"所有人"};

function showPages(result) {
  state.page = result.page;
  get("pages").hidden = result.pages < 2;
  get("page").textContent = `${result.page} / ${result.pages}`;
  get("prev").disabled = result.page === 1;
  get("next").disabled = result.page === result.pages;
}

function prepareView() {
  get("section-title").textContent = directoryViews[state.view];
  for (const entry of get("sections").querySelectorAll("button")) {
    if (entry.dataset.view === state.view) entry.setAttribute("aria-current","page");
    else entry.removeAttribute("aria-current");
  }
  get("search").hidden = !hints[state.view] || Boolean(state.room);
  get("keyword").placeholder = hints[state.view] || "";
  get("tabs").replaceChildren();
  get("queue-title").textContent = "";
  get("list").replaceChildren(element("p","正在读取…","meta"));
  get("pages").hidden = true;
}

function openView(view) {
  Object.assign(state, {view, page:1, query:"", room:"", table:""});
  get("keyword").value = "";
  notice("");
  void refresh();
}

function showOverview(tables) {
  const cards = element("div","","metrics");
  const links = {members:"users",bird_groups:"groups",publications:"publications"};
  for (const [table,view] of Object.entries(links)) {
    const item = tables.find(entry=>entry.name === table);
    if (!item) continue;
    const tile = button("",()=>openView(view),"metric");
    tile.append(element("span",item.label),element("strong",item.count.toLocaleString("zh-CN")));
    cards.append(tile);
  }
  const grid = element("div","","inventory");
  for (const item of tables) {
    const section = {members:"users",profiles:"users",bird_groups:"groups",group_members:"groups",group_messages:"groups",publications:"publications"}[item.name];
    const row = section ? button("",()=>openView(section),"inventory-row") : item.browse ?
      button("",()=>{state.table=item.name;state.page=1;void refresh();},"inventory-row") : element("div","","inventory-row");
    const label = element("div",item.label);
    label.append(element("small",item.name));
    row.append(label,element("strong",item.count.toLocaleString("zh-CN")));
    grid.append(row);
  }
  get("list").replaceChildren(cards,element("h2",`业务库 · ${tables.length} 张表`),grid);
}

function dateLabel(value) {
  return value ? new Date(value).toLocaleString("zh-CN",{timeZone:"Asia/Shanghai",hour12:false}) : "";
}

function directoryCard(title, id, lines) {
  const node = element("article");
  node.append(element("h3",title),element("div",id,"record-id"));
  for (const line of lines.filter(Boolean)) node.append(element("p",line));
  return node;
}

function openGroup(room, detail) {
  if (!state.room) state.groupPage = state.page;
  Object.assign(state, {room,detail,page:1});
  notice("");
  void refresh();
}

function directoryItem(item) {
  if (state.view === "users") {
    return directoryCard(item.nickname || "尚未设置资料",item.id,[item.handle && "账号 @"+item.handle,item.bio,
      `已加入 ${item.rooms} 个群`,item.handle && `搜索可见：${item.discoverable ? "是" : "否"}　私信：${visibility[item.dm]}　收藏：${visibility[item.bookmarks]}`]);
  }
  if (state.view === "publications") {
    return directoryCard(item.title || item.species || "无标题",item.id,[
      `${item.channel === "map" ? "地图鸟讯" : "讨论帖"} · ${results[item.status] || ({pending:"待审",withdrawn:"已撤回"})[item.status] || item.status}`,
      [item.author,item.species,dateLabel(item.created)].filter(Boolean).join(" · ")]);
  }
  if (!state.room) {
    const node = directoryCard(item.name,item.id,[`群主 ${item.nickname || item.owner}`,`已加入 ${item.members} 人 · ${item.messages} 条消息`,dateLabel(item.created)]);
    node.append(button("查看群聊",()=>openGroup(item.id,"members")));
    return node;
  }
  if (state.detail === "members") {
    const role = item.state === "invited" ? "待接受邀请" : "已加入";
    return directoryCard(item.nickname || "未设置昵称",item.id,[item.handle && "@"+item.handle,role,dateLabel(item.joined)]);
  }
  return directoryCard(item.nickname || item.sender,item.sender,[dateLabel(item.created),item.body]);
}

async function refreshDirectory(version) {
  if (state.view === "overview" && state.table) {
    const result = await api(`data/tables/${encodeURIComponent(state.table)}?page=${state.page}`);
    if (version !== state.version) return;
    get("tabs").append(button("← 数据总览",()=>openView("overview")));
    get("queue-title").textContent = `${result.label} · ${result.total} 条`;
    const fields = {id:"编号",owner:"用户编号",created:"创建时间",created_at:"创建时间",observation_id:"观察编号",source:"来源",common_name_zh:"中文名",species_id:"鸟种编号",species:"鸟种",channels:"发布渠道",name:"中文名",scientific:"学名",english:"英文名",family:"科",checked:"检查时间",post:"帖子",result:"鉴定结果",updated:"更新时间",sighting:"观察",reply:"回复",status:"状态",body:"内容",target:"对象",reviewer:"审核人",reason:"原因"};
    get("list").replaceChildren(...result.items.map(item=>{
      const entry = element("article");
      for (const [key,value] of Object.entries(item)) entry.append(element("p",`${fields[key] || key}　${value ?? '—'}`));
      return entry;
    }));
    if (!result.total) get("list").append(element("div","当前没有记录。","empty"));
    showPages(result);
    return;
  }
  if (state.view === "overview") {
    const result = await api("data/overview");
    if (version === state.version) showOverview(result.tables);
    return;
  }
  const path = state.room ? `groups/${encodeURIComponent(state.room)}/${state.detail}` : state.view;
  const params = new URLSearchParams({page:state.page});
  if (!state.room && state.query) params.set("q",state.query);
  const result = await api(`data/${path}?${params}`);
  if (version !== state.version) return;
  if (result.group) {
    get("tabs").append(button("← 群聊列表",()=>{state.room="";state.page=state.groupPage;void refresh();}));
    for (const [section,label] of [["members","群成员"],["messages","群消息"]]) {
      const entry = button(label,()=>openGroup(state.room,section));
      if (section === state.detail) entry.setAttribute("aria-current","page");
      get("tabs").append(entry);
    }
  }
  get("queue-title").textContent = `${result.group ? result.group.name+" · " : ""}共 ${result.total} 条`;
  get("list").replaceChildren(...result.items.map(directoryItem));
  if (!result.items.length) get("list").append(element("div","没有符合条件的记录。","empty"));
  showPages(result);
}

document.getElementById("sections").addEventListener("click",event=>{
  const view = event.target.closest("button")?.dataset.view;
  if (view) openView(view);
});
document.getElementById("search").addEventListener("submit",event=>{
  event.preventDefault();
  state.query = get("keyword").value.trim();
  state.page = 1;
  notice("");
  void refresh();
});
