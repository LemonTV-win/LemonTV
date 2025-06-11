import { db } from '../db';
import * as table from '$lib/server/db/schemas/about/community';
import { eq, and } from 'drizzle-orm';
import type { DiscordServer } from '$lib/data/community';

export async function getDiscordServers(): Promise<DiscordServer[]> {
	const discordServers = await db.select().from(table.discordServer);
	const serverTags = await db
		.select({
			serverId: table.discordServerTag.serverId,
			tag: table.communityTag
		})
		.from(table.discordServerTag)
		.innerJoin(table.communityTag, eq(table.discordServerTag.tagId, table.communityTag.id));

	// Group tags by server
	const serversWithTags = discordServers.map((server) => ({
		...server,
		tags: serverTags.filter((st) => st.serverId === server.id).map((st) => st.tag)
	}));

	return serversWithTags.map((server) => ({
		...server,
		additionalLink:
			server.additionalLinkText && server.additionalLinkUrl
				? { text: server.additionalLinkText, url: server.additionalLinkUrl }
				: null
	}));
}

export const createDiscordServer = async (server: table.DiscordServer) => {
	const discordServer = await db.insert(table.discordServer).values(server);
	return discordServer;
};

export const updateDiscordServer = async (server: table.DiscordServer) => {
	const discordServer = await db
		.update(table.discordServer)
		.set(server)
		.where(eq(table.discordServer.id, server.id));
	return discordServer;
};

export const deleteDiscordServer = async (id: string) => {
	const discordServer = await db.delete(table.discordServer).where(eq(table.discordServer.id, id));
	return discordServer;
};

// Tag management functions
export const getTags = async () => {
	return await db.select().from(table.communityTag);
};

export const createTag = async (tag: table.CommunityTag) => {
	return await db.insert(table.communityTag).values(tag);
};

export const updateTag = async (tag: table.CommunityTag) => {
	return await db.update(table.communityTag).set(tag).where(eq(table.communityTag.id, tag.id));
};

export const deleteTag = async (id: string) => {
	return await db.delete(table.communityTag).where(eq(table.communityTag.id, id));
};

// Server-Tag relationship functions
export const addTagToServer = async (serverId: string, tagId: string) => {
	return await db.insert(table.discordServerTag).values({
		serverId,
		tagId,
		createdAt: new Date(),
		updatedAt: new Date()
	});
};

export const removeTagFromServer = async (serverId: string, tagId: string) => {
	return await db
		.delete(table.discordServerTag)
		.where(
			and(eq(table.discordServerTag.serverId, serverId), eq(table.discordServerTag.tagId, tagId))
		);
};

export const getServerTags = async (serverId: string) => {
	return await db
		.select({
			tag: table.communityTag
		})
		.from(table.discordServerTag)
		.innerJoin(table.communityTag, eq(table.discordServerTag.tagId, table.communityTag.id))
		.where(eq(table.discordServerTag.serverId, serverId));
};
