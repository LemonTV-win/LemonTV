import type { PageServerLoad } from './$types';
import { processImageURL } from '$lib/server/storage';

export type Social = {
	type: 'github' | 'x' | 'youtube' | 'twitch' | 'linktree' | 'bilibili';
	link: string;
};

export type Member = {
	name: string;
	roles: string[];
	socials: Social[];
	avatar: string | null;
};
export const load: PageServerLoad = async ({}) => {
	const members = [
		{
			name: 'mkpoli',
			roles: ['founder'],
			socials: [
				{
					type: 'github',
					link: 'https://github.com/mkpoli'
				},
				{
					type: 'x',
					link: 'https://x.com/mkpoli'
				}
			],
			avatar: 'https://avatars.githubusercontent.com/u/3502597?v=4'
		},
		{
			name: 'swae gae pinoe',
			roles: ['chief_editor'],
			socials: [
				{
					type: 'twitch',
					link: 'https://twitch.tv/swaegaepinoe'
				}
			],
			avatar: 'players/b7b49342-e7cd-4d2f-a33b-38f5752518d7-swaeg.jpg'
		},
		{
			name: 'XinghuiEnjoyer',
			roles: ['consultant'],
			socials: [
				{
					type: 'youtube',
					link: 'https://www.youtube.com/@XinghuiEnjoyer'
				},
				{
					type: 'twitch',
					link: 'https://twitch.tv/xinghuienjoyer'
				}
			],
			avatar:
				'https://yt3.googleusercontent.com/7IYPXmmYCaPYVA_lmgduXuierwW3Lo1qfSNq51OV0VU7C3AxMarHrtuaGgr84B6VCwnB5G70-Q=s160-c-k-c0x00ffffff-no-rj'
		},
		{
			name: 'Krihcity',
			roles: ['chief_editor'],
			socials: [
				{
					type: 'youtube',
					link: 'https://www.youtube.com/@krihcity'
				},
				{
					type: 'twitch',
					link: 'https://www.twitch.tv/krihcity'
				}
			],
			avatar:
				'https://static-cdn.jtvnw.net/jtv_user_pictures/3bb121c0-f337-435a-b20c-4d87261d2a31-profile_image-70x70.png'
		},
		{
			name: 'Eaterrius',
			roles: ['editor', 'translator'],
			socials: [
				{
					type: 'linktree',
					link: 'https://linktr.ee/eaterrius'
				},
				{
					type: 'x',
					link: 'https://x.com/eaterrius'
				}
			],
			avatar: 'players/c8e8a79c-e342-4537-86fa-14f57a875402-Eaterrius.jpg'
		},
		{
			name: '空镜槐花',
			roles: ['chief_editor'],
			socials: [
				{
					type: 'bilibili',
					link: 'https://space.bilibili.com/1906660896'
				}
			],
			avatar:
				'organizers/37713c40-1ff7-4374-bc76-131659df39bd-b_3c719ed2d7dfed0c5394334a66d6d401.jpg'
		}
	];

	for (const member of members) {
		if (member.avatar) {
			member.avatar = await processImageURL(member.avatar);
		}
	}

	return {
		members: members as Member[]
	};
};
