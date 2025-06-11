export interface CommunityTag {
	id: string;
	name: string;
	category: string;
	value: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DiscordServer {
	id: string;
	title: string;
	url: string;
	icon: string;
	description: string;
	additionalLink: {
		text: string;
		url: string;
	} | null;
	tags: CommunityTag[];
	createdAt: Date;
	updatedAt: Date;
}
