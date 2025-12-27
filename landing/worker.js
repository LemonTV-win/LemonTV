import html from './index.html';

export default {
	async fetch(_request, _env, _ctx) {
		return new Response(html, {
			headers: {
				'content-type': 'text/html;charset=UTF-8'
			}
		});
	}
};
