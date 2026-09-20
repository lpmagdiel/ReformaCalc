export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["manifest.webmanifest","robots.txt","sw.js"]),
	mimeTypes: {".webmanifest":"application/manifest+json",".txt":"text/plain",".js":"text/javascript"},
	_: {
		client: {start:"_app/immutable/entry/start.CzQ_q7Tv.js",app:"_app/immutable/entry/app.BaM1rzXX.js",imports:["_app/immutable/entry/start.CzQ_q7Tv.js","_app/immutable/chunks/B9JM69NW.js","_app/immutable/chunks/D-xaY2UH.js","_app/immutable/entry/app.BaM1rzXX.js","_app/immutable/chunks/D-xaY2UH.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/buscar",
				pattern: /^\/buscar\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
