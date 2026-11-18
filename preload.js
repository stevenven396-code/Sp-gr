const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('ieltsApp',{getConfig:()=>ipcRenderer.invoke('config:get'),saveConfig:(url,token)=>ipcRenderer.invoke('config:save',url,token),deleteConfig:()=>ipcRenderer.invoke('config:delete'),grade:prompt=>ipcRenderer.invoke('claude:grade',prompt),about:()=>ipcRenderer.invoke('app:about')});
