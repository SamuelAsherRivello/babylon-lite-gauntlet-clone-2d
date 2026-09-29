import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'project-name/test/browser',timeout:360000,workers:1,reporter:'list',use:{browserName:'chromium',channel:'msedge',headless:true,viewport:{width:1440,height:1050},launchOptions:{args:['--enable-unsafe-webgpu','--disable-background-timer-throttling','--disable-renderer-backgrounding']}}});
