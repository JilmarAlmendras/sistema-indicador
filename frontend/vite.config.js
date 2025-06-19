import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	define: {
		'process.env': process.env,
	},
	server: {
		host: true,
		port: 5173,
		cors: true,
	},
	preview: {
		host: '0.0.0.0',
		port: process.env.PORT || 3000,
		allowedHosts: [
			'healthcheck.railway.app',
			'sistema-indicadores-production.up.railway.app',
			'sistema-indicadores-production-0b2b.up.railway.app',
			// Permitir cualquier subdominio de railway.app
			/\.railway\.app$/
		],
	},
	build: {
		outDir: 'dist',
		sourcemap: false,
		target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					charts: ['recharts'],
					gantt: ['@syncfusion/ej2-react-gantt'],
					ui: ['@radix-ui/react-icons', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-toast'],
				},
			},
		},
		commonjsOptions: {
			include: [/node_modules/],
		},
	},
	optimizeDeps: {
		include: [
			'@syncfusion/ej2-react-gantt',
			'@radix-ui/react-icons',
			'@radix-ui/react-label', 
			'@radix-ui/react-select',
			'@radix-ui/react-slot',
			'@radix-ui/react-toast',
			'react', 
			'react-dom', 
			'recharts'
		],
		force: true,
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
