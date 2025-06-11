import { db } from '../db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const getDiscordServers = async () => {
	const discordServers = await db.select().from(table.discordServer);
	return discordServers;
};

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
