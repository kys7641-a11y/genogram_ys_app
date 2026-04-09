import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 배포 시 저장소 이름을 VITE_BASE_URL 환경변수로 주입
// 예: VITE_BASE_URL=/genogram-app/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
});
