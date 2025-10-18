/*
 * @Author: 
 * @Date: 2024-04-09 20:28:12
 * @LastEditors: 
 * @LastEditTime: 2024-04-09 20:52:49
 * @FilePath: \appOl\src\main.js
 * @Description: 
 */
import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
