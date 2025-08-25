import { randomUUID } from 'node:crypto';
import * as schema from '$lib/server/db/schemas';
import { EVENTS } from './events';

export const STAGES = [
	// Event 1 - Full tournament structure
	{
		id: 1,
		eventId: EVENTS[0].id,
		title: 'Open Qualifiers',
		stage: 'qualifier',
		format: 'single'
	},
	{
		id: 2,
		eventId: EVENTS[0].id,
		title: 'Group Stage A',
		stage: 'group',
		format: 'round-robin'
	},
	{
		id: 3,
		eventId: EVENTS[0].id,
		title: 'Group Stage B',
		stage: 'group',
		format: 'round-robin'
	},
	{
		id: 4,
		eventId: EVENTS[0].id,
		title: 'Playoffs',
		stage: 'playoff',
		format: 'double'
	},
	// Event 2 - LAN tournament
	{
		id: 5,
		eventId: EVENTS[1].id,
		title: 'Swiss Stage',
		stage: 'group',
		format: 'swiss'
	},
	{
		id: 6,
		eventId: EVENTS[1].id,
		title: 'Playoffs',
		stage: 'playoff',
		format: 'single'
	},
	// Event 3 - Showmatch event
	{
		id: 7,
		eventId: EVENTS[2].id,
		title: 'Celebration Showmatch',
		stage: 'showmatch',
		format: 'single'
	},
	// Event 4 - Regional qualifier
	{
		id: 8,
		eventId: EVENTS[3].id,
		title: 'Regional Qualifier',
		stage: 'qualifier',
		format: 'double'
	},
	// Event 5 - Major tournament
	{
		id: 9,
		eventId: EVENTS[4].id,
		title: 'Group Stage',
		stage: 'group',
		format: 'swiss'
	},
	{
		id: 10,
		eventId: EVENTS[4].id,
		title: 'Playoffs',
		stage: 'playoff',
		format: 'double'
	}
] satisfies (typeof schema.stage.$inferInsert)[];

export const MATCHES = [
	// Event 1: Open Qualifiers
	{
		id: randomUUID(),
		format: 'BO1',
		stageId: STAGES[0].id
	},
	{
		id: randomUUID(),
		format: 'BO1',
		stageId: STAGES[0].id
	},
	{
		id: randomUUID(),
		format: 'BO1',
		stageId: STAGES[0].id
	},
	{
		id: randomUUID(),
		format: 'BO1',
		stageId: STAGES[0].id
	},
	// Event 1: Group Stage A
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[1].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[1].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[1].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[1].id
	},
	// Event 1: Group Stage B
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[2].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[2].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[2].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[2].id
	},
	// Event 1: Playoffs
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[3].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[3].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[3].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[3].id
	},
	// Event 2: Swiss Stage
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[4].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[4].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[4].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[4].id
	},
	// Event 2: Playoffs (Quarter Finals, Semi Finals, Grand Finals, Third Place)
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[5].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[5].id
	},
	// Event 3: Showmatch
	{
		id: randomUUID(),
		format: 'BO1',
		stageId: STAGES[6].id
	},
	// Event 4: Regional Qualifier
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[7].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[7].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[7].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[7].id
	},
	// Event 5: Group Stage
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[8].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[8].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[8].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[8].id
	},
	// Event 5: Playoffs
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[9].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[9].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[9].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[9].id
	}
] satisfies (typeof schema.match.$inferInsert)[];

export const STAGE_ROUNDS = [
	// Example stage rounds for Event 1 (Open Qualifiers)
	{
		id: 1,
		stageId: STAGES[0].id,
		type: 'round' as const,
		title: 'Qualifier Round 1',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 2,
		stageId: STAGES[0].id,
		type: 'round' as const,
		title: 'Qualifier Round 2',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 1 (Group Stage A)
	{
		id: 3,
		stageId: STAGES[1].id,
		type: 'group' as const,
		title: 'Group A Round 1',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	{
		id: 4,
		stageId: STAGES[1].id,
		type: 'group' as const,
		title: 'Group A Round 2',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 1 (Group Stage B)
	{
		id: 5,
		stageId: STAGES[2].id,
		type: 'group' as const,
		title: 'Group B Round 1',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	{
		id: 6,
		stageId: STAGES[2].id,
		type: 'group' as const,
		title: 'Group B Round 2',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 1 (Playoffs)
	{
		id: 7,
		stageId: STAGES[3].id,
		type: 'quarterfinals' as const,
		title: 'Quarter Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 8,
		stageId: STAGES[3].id,
		type: 'semifinals' as const,
		title: 'Semi Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 9,
		stageId: STAGES[3].id,
		type: 'final' as const,
		title: 'Grand Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 2 (Swiss Stage)
	{
		id: 10,
		stageId: STAGES[4].id,
		type: 'round' as const,
		title: 'Swiss Round 1',
		bracket: 'group' as const
	},
	{
		id: 11,
		stageId: STAGES[4].id,
		type: 'round' as const,
		title: 'Swiss Round 2',
		bracket: 'group' as const
	},
	// Example stage rounds for Event 2 (Quarter Finals)
	{
		id: 12,
		stageId: STAGES[5].id,
		type: 'quarterfinals' as const,
		title: 'Quarter Finals',
		bracket: 'upper' as const
	},
	// Example stage rounds for Event 2 (Semi Finals)
	{
		id: 13,
		stageId: STAGES[5].id,
		type: 'semifinals' as const,
		title: 'Semi Finals',
		bracket: 'upper' as const
	},
	// Example stage rounds for Event 2 (Grand Finals)
	{
		id: 14,
		stageId: STAGES[5].id,
		type: 'final' as const,
		title: 'Grand Finals',
		bracket: 'upper' as const
	},
	// Example stage rounds for Event 2 (Third Place)
	{
		id: 15,
		stageId: STAGES[5].id,
		type: 'thirdplace' as const,
		title: 'Third Place',
		bracket: 'upper' as const,
		parallelGroup: 14
	},
	// Example stage rounds for Event 3 (Showmatch)
	{
		id: 16,
		stageId: STAGES[6].id,
		type: 'round' as const,
		title: 'Celebration Showmatch',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 4 (Regional Qualifier)
	{
		id: 17,
		stageId: STAGES[7].id,
		type: 'round' as const,
		title: 'Qualifier Round 1',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 18,
		stageId: STAGES[7].id,
		type: 'round' as const,
		title: 'Qualifier Round 2',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 5 (Group Stage)
	{
		id: 19,
		stageId: STAGES[8].id,
		type: 'round' as const,
		title: 'Group Stage Round 1',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	{
		id: 20,
		stageId: STAGES[8].id,
		type: 'round' as const,
		title: 'Group Stage Round 2',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 5 (Playoffs)
	{
		id: 21,
		stageId: STAGES[9].id,
		type: 'quarterfinals' as const,
		title: 'Quarter Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 22,
		stageId: STAGES[9].id,
		type: 'semifinals' as const,
		title: 'Semi Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 23,
		stageId: STAGES[9].id,
		type: 'final' as const,
		title: 'Grand Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	}
] satisfies (typeof schema.stageRound.$inferInsert)[];

export const STAGE_NODES = [
	// Event 1: Open Qualifiers
	{
		id: 1,
		stageId: STAGES[0].id,
		matchId: MATCHES[0].id,
		roundId: STAGE_ROUNDS[0].id,
		order: 0
	},
	{
		id: 2,
		stageId: STAGES[0].id,
		matchId: MATCHES[1].id,
		roundId: STAGE_ROUNDS[0].id,
		order: 1
	},
	{
		id: 3,
		stageId: STAGES[0].id,
		matchId: MATCHES[2].id,
		roundId: STAGE_ROUNDS[1].id,
		order: 0
	},
	{
		id: 4,
		stageId: STAGES[0].id,
		matchId: MATCHES[3].id,
		roundId: STAGE_ROUNDS[1].id,
		order: 1
	},
	// Event 1: Group Stage A
	{
		id: 5,
		stageId: STAGES[1].id,
		matchId: MATCHES[4].id,
		roundId: STAGE_ROUNDS[2].id,
		order: 0
	},
	{
		id: 6,
		stageId: STAGES[1].id,
		matchId: MATCHES[5].id,
		roundId: STAGE_ROUNDS[2].id,
		order: 1
	},
	{
		id: 7,
		stageId: STAGES[1].id,
		matchId: MATCHES[6].id,
		roundId: STAGE_ROUNDS[3].id,
		order: 0
	},
	{
		id: 8,
		stageId: STAGES[1].id,
		matchId: MATCHES[7].id,
		roundId: STAGE_ROUNDS[3].id,
		order: 1
	},
	// Event 1: Group Stage B
	{
		id: 9,
		stageId: STAGES[2].id,
		matchId: MATCHES[8].id,
		roundId: STAGE_ROUNDS[4].id,
		order: 0
	},
	{
		id: 10,
		stageId: STAGES[2].id,
		matchId: MATCHES[9].id,
		roundId: STAGE_ROUNDS[4].id,
		order: 1
	},
	{
		id: 11,
		stageId: STAGES[2].id,
		matchId: MATCHES[10].id,
		roundId: STAGE_ROUNDS[5].id,
		order: 0
	},
	{
		id: 12,
		stageId: STAGES[2].id,
		matchId: MATCHES[11].id,
		roundId: STAGE_ROUNDS[5].id,
		order: 1
	},
	// Event 1: Playoffs
	{
		id: 13,
		stageId: STAGES[3].id,
		matchId: MATCHES[12].id,
		roundId: STAGE_ROUNDS[6].id,
		order: 0
	},
	{
		id: 14,
		stageId: STAGES[3].id,
		matchId: MATCHES[13].id,
		roundId: STAGE_ROUNDS[7].id,
		order: 0
	},
	{
		id: 15,
		stageId: STAGES[3].id,
		matchId: MATCHES[14].id,
		roundId: STAGE_ROUNDS[8].id,
		order: 0
	},
	{
		id: 16,
		stageId: STAGES[3].id,
		matchId: MATCHES[15].id,
		roundId: STAGE_ROUNDS[8].id,
		order: 1
	},
	// Event 2: Swiss Stage
	{
		id: 17,
		stageId: STAGES[4].id,
		matchId: MATCHES[16].id,
		roundId: STAGE_ROUNDS[9].id,
		order: 0
	},
	{
		id: 18,
		stageId: STAGES[4].id,
		matchId: MATCHES[17].id,
		roundId: STAGE_ROUNDS[9].id,
		order: 1
	},
	{
		id: 19,
		stageId: STAGES[4].id,
		matchId: MATCHES[18].id,
		roundId: STAGE_ROUNDS[10].id,
		order: 0
	},
	{
		id: 20,
		stageId: STAGES[4].id,
		matchId: MATCHES[19].id,
		roundId: STAGE_ROUNDS[10].id,
		order: 1
	},
	// Event 2: Playoffs - Quarter Finals
	{
		id: 21,
		stageId: STAGES[5].id,
		matchId: MATCHES[20].id,
		roundId: STAGE_ROUNDS[11].id,
		order: 0 // Team 1 vs Team 2
	},
	{
		id: 22,
		stageId: STAGES[5].id,
		matchId: MATCHES[21].id,
		roundId: STAGE_ROUNDS[11].id,
		order: 1 // Team 3 vs Team 4
	},
	{
		id: 23,
		stageId: STAGES[5].id,
		matchId: MATCHES[22].id,
		roundId: STAGE_ROUNDS[11].id,
		order: 2 // Team 5 vs Team 6
	},
	{
		id: 24,
		stageId: STAGES[5].id,
		matchId: MATCHES[23].id,
		roundId: STAGE_ROUNDS[11].id,
		order: 3 // Team 7 vs Team 8
	},
	// Event 2: Main Bracket - Semi Finals
	{
		id: 25,
		stageId: STAGES[5].id,
		matchId: MATCHES[24].id,
		roundId: STAGE_ROUNDS[12].id,
		order: 0 // Team 1 vs Team 3
	},
	{
		id: 26,
		stageId: STAGES[5].id,
		matchId: MATCHES[25].id,
		roundId: STAGE_ROUNDS[12].id,
		order: 1 // Team 5 vs Team 7
	},
	// Event 2: Main Bracket - Grand Finals
	{
		id: 27,
		stageId: STAGES[5].id,
		matchId: MATCHES[26].id,
		roundId: STAGE_ROUNDS[13].id,
		order: 0 // Team 1 vs Team 5
	},
	// Event 2: Main Bracket - Third Place
	{
		id: 28,
		stageId: STAGES[5].id,
		matchId: MATCHES[27].id,
		roundId: STAGE_ROUNDS[14].id,
		order: 0 // Team 3 vs Team 7
	},
	// Event 3: Showmatch
	{
		id: 29,
		stageId: STAGES[6].id,
		matchId: MATCHES[28].id,
		roundId: STAGE_ROUNDS[15].id,
		order: 0
	},
	// Event 4: Regional Qualifier
	{
		id: 30,
		stageId: STAGES[7].id,
		matchId: MATCHES[29].id,
		roundId: STAGE_ROUNDS[16].id,
		order: 0
	},
	{
		id: 31,
		stageId: STAGES[7].id,
		matchId: MATCHES[30].id,
		roundId: STAGE_ROUNDS[16].id,
		order: 1
	},
	{
		id: 32,
		stageId: STAGES[7].id,
		matchId: MATCHES[31].id,
		roundId: STAGE_ROUNDS[17].id,
		order: 0
	},
	{
		id: 33,
		stageId: STAGES[7].id,
		matchId: MATCHES[32].id,
		roundId: STAGE_ROUNDS[17].id,
		order: 1
	},
	// Event 5: Group Stage
	{
		id: 34,
		stageId: STAGES[8].id,
		matchId: MATCHES[33].id,
		roundId: STAGE_ROUNDS[18].id,
		order: 0
	},
	{
		id: 35,
		stageId: STAGES[8].id,
		matchId: MATCHES[34].id,
		roundId: STAGE_ROUNDS[18].id,
		order: 1
	},
	{
		id: 36,
		stageId: STAGES[8].id,
		matchId: MATCHES[35].id,
		roundId: STAGE_ROUNDS[19].id,
		order: 0
	},
	{
		id: 37,
		stageId: STAGES[8].id,
		matchId: MATCHES[36].id,
		roundId: STAGE_ROUNDS[19].id,
		order: 1
	},
	// Event 5: Playoffs
	{
		id: 38,
		stageId: STAGES[9].id,
		matchId: MATCHES[37].id,
		roundId: STAGE_ROUNDS[20].id,
		order: 0
	},
	{
		id: 39,
		stageId: STAGES[9].id,
		matchId: MATCHES[38].id,
		roundId: STAGE_ROUNDS[21].id,
		order: 0
	},
	{
		id: 40,
		stageId: STAGES[9].id,
		matchId: MATCHES[39].id,
		roundId: STAGE_ROUNDS[22].id,
		order: 0
	},
	{
		id: 41,
		stageId: STAGES[9].id,
		matchId: MATCHES[40].id,
		roundId: STAGE_ROUNDS[22].id,
		order: 1
	}
] satisfies (typeof schema.stageNode.$inferInsert)[];

export const STAGE_NODE_DEPENDENCIES = [
	// Example dependencies for Event 1 (Open Qualifiers)
	{
		id: 1,
		nodeId: STAGE_NODES[1].id,
		dependencyMatchId: MATCHES[0].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 1 (Group Stage A)
	{
		id: 2,
		nodeId: STAGE_NODES[3].id,
		dependencyMatchId: MATCHES[2].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 1 (Group Stage B)
	{
		id: 3,
		nodeId: STAGE_NODES[5].id,
		dependencyMatchId: MATCHES[4].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 1 (Playoffs)
	{
		id: 4,
		nodeId: STAGE_NODES[7].id,
		dependencyMatchId: MATCHES[6].id,
		outcome: 'winner' as const
	},
	{
		id: 5,
		nodeId: STAGE_NODES[8].id,
		dependencyMatchId: MATCHES[7].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 2 (Swiss Stage)
	{
		id: 6,
		nodeId: STAGE_NODES[10].id,
		dependencyMatchId: MATCHES[9].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 2 (Semi Finals)
	{
		id: 7,
		nodeId: STAGE_NODES[24].id,
		dependencyMatchId: MATCHES[20].id,
		outcome: 'winner' as const
	},
	{
		id: 8,
		nodeId: STAGE_NODES[24].id,
		dependencyMatchId: MATCHES[21].id,
		outcome: 'winner' as const
	},
	{
		id: 9,
		nodeId: STAGE_NODES[25].id,
		dependencyMatchId: MATCHES[22].id,
		outcome: 'winner' as const
	},
	{
		id: 10,
		nodeId: STAGE_NODES[25].id,
		dependencyMatchId: MATCHES[23].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 2 (Grand Finals)
	{
		id: 11,
		nodeId: STAGE_NODES[26].id,
		dependencyMatchId: MATCHES[24].id,
		outcome: 'winner' as const
	},
	{
		id: 12,
		nodeId: STAGE_NODES[26].id,
		dependencyMatchId: MATCHES[25].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 2 (Third Place)
	{
		id: 13,
		nodeId: STAGE_NODES[27].id,
		dependencyMatchId: MATCHES[24].id,
		outcome: 'loser' as const
	},
	{
		id: 14,
		nodeId: STAGE_NODES[27].id,
		dependencyMatchId: MATCHES[25].id,
		outcome: 'loser' as const
	}
] satisfies (typeof schema.stageNodeDependency.$inferInsert)[];
