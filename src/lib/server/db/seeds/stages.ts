import { randomUUID } from 'node:crypto';
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
		title: 'Quarter Finals',
		stage: 'playoff',
		format: 'single'
	},
	{
		id: 7,
		eventId: EVENTS[1].id,
		title: 'Semi Finals',
		stage: 'playoff',
		format: 'single'
	},
	{
		id: 8,
		eventId: EVENTS[1].id,
		title: 'Grand Finals',
		stage: 'playoff',
		format: 'single'
	},
	// Event 3 - Showmatch event
	{
		id: 9,
		eventId: EVENTS[2].id,
		title: 'Celebration Showmatch',
		stage: 'showmatch',
		format: 'single'
	},
	// Event 4 - Regional qualifier
	{
		id: 10,
		eventId: EVENTS[3].id,
		title: 'Regional Qualifier',
		stage: 'qualifier',
		format: 'double'
	},
	// Event 5 - Major tournament
	{
		id: 11,
		eventId: EVENTS[4].id,
		title: 'Group Stage',
		stage: 'group',
		format: 'swiss'
	},
	{
		id: 12,
		eventId: EVENTS[4].id,
		title: 'Playoffs',
		stage: 'playoff',
		format: 'double'
	}
];

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
	// Event 2: Quarter Finals
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
	// Event 2: Semi Finals
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[6].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[6].id
	},
	// Event 2: Grand Finals
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[7].id
	},
	// Event 3: Showmatch
	{
		id: randomUUID(),
		format: 'BO1',
		stageId: STAGES[8].id
	},
	// Event 4: Regional Qualifier
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[9].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[9].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[9].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[9].id
	},
	// Event 5: Group Stage
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[10].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[10].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[10].id
	},
	{
		id: randomUUID(),
		format: 'BO3',
		stageId: STAGES[10].id
	},
	// Event 5: Playoffs
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[11].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[11].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[11].id
	},
	{
		id: randomUUID(),
		format: 'BO5',
		stageId: STAGES[11].id
	}
];

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
		bracket: 'group' as const,
		parallelGroup: 1
	},
	{
		id: 11,
		stageId: STAGES[4].id,
		type: 'round' as const,
		title: 'Swiss Round 2',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 2 (Quarter Finals)
	{
		id: 12,
		stageId: STAGES[5].id,
		type: 'quarterfinals' as const,
		title: 'Quarter Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 2 (Semi Finals)
	{
		id: 13,
		stageId: STAGES[6].id,
		type: 'semifinals' as const,
		title: 'Semi Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 2 (Grand Finals)
	{
		id: 14,
		stageId: STAGES[7].id,
		type: 'final' as const,
		title: 'Grand Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 3 (Showmatch)
	{
		id: 15,
		stageId: STAGES[8].id,
		type: 'round' as const,
		title: 'Celebration Showmatch',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 4 (Regional Qualifier)
	{
		id: 16,
		stageId: STAGES[9].id,
		type: 'round' as const,
		title: 'Qualifier Round 1',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 17,
		stageId: STAGES[9].id,
		type: 'round' as const,
		title: 'Qualifier Round 2',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 5 (Group Stage)
	{
		id: 18,
		stageId: STAGES[10].id,
		type: 'round' as const,
		title: 'Group Stage Round 1',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	{
		id: 19,
		stageId: STAGES[10].id,
		type: 'round' as const,
		title: 'Group Stage Round 2',
		bracket: 'group' as const,
		parallelGroup: 1
	},
	// Example stage rounds for Event 5 (Playoffs)
	{
		id: 20,
		stageId: STAGES[11].id,
		type: 'quarterfinals' as const,
		title: 'Quarter Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 21,
		stageId: STAGES[11].id,
		type: 'semifinals' as const,
		title: 'Semi Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	},
	{
		id: 22,
		stageId: STAGES[11].id,
		type: 'final' as const,
		title: 'Grand Finals',
		bracket: 'upper' as const,
		parallelGroup: 1
	}
];

export const STAGE_NODES = [
	// Event 1: Open Qualifiers
	{
		id: 1,
		stageId: STAGES[0].id,
		matchId: MATCHES[0].id,
		roundId: STAGE_ROUNDS[0].id
	},
	{
		id: 2,
		stageId: STAGES[0].id,
		matchId: MATCHES[1].id,
		roundId: STAGE_ROUNDS[0].id
	},
	{
		id: 3,
		stageId: STAGES[0].id,
		matchId: MATCHES[2].id,
		roundId: STAGE_ROUNDS[1].id
	},
	{
		id: 4,
		stageId: STAGES[0].id,
		matchId: MATCHES[3].id,
		roundId: STAGE_ROUNDS[1].id
	},
	// Event 1: Group Stage A
	{
		id: 5,
		stageId: STAGES[1].id,
		matchId: MATCHES[4].id,
		roundId: STAGE_ROUNDS[2].id
	},
	{
		id: 6,
		stageId: STAGES[1].id,
		matchId: MATCHES[5].id,
		roundId: STAGE_ROUNDS[2].id
	},
	{
		id: 7,
		stageId: STAGES[1].id,
		matchId: MATCHES[6].id,
		roundId: STAGE_ROUNDS[3].id
	},
	{
		id: 8,
		stageId: STAGES[1].id,
		matchId: MATCHES[7].id,
		roundId: STAGE_ROUNDS[3].id
	},
	// Event 1: Group Stage B
	{
		id: 9,
		stageId: STAGES[2].id,
		matchId: MATCHES[8].id,
		roundId: STAGE_ROUNDS[4].id
	},
	{
		id: 10,
		stageId: STAGES[2].id,
		matchId: MATCHES[9].id,
		roundId: STAGE_ROUNDS[4].id
	},
	{
		id: 11,
		stageId: STAGES[2].id,
		matchId: MATCHES[10].id,
		roundId: STAGE_ROUNDS[5].id
	},
	{
		id: 12,
		stageId: STAGES[2].id,
		matchId: MATCHES[11].id,
		roundId: STAGE_ROUNDS[5].id
	},
	// Event 1: Playoffs
	{
		id: 13,
		stageId: STAGES[3].id,
		matchId: MATCHES[12].id,
		roundId: STAGE_ROUNDS[6].id
	},
	{
		id: 14,
		stageId: STAGES[3].id,
		matchId: MATCHES[13].id,
		roundId: STAGE_ROUNDS[7].id
	},
	{
		id: 15,
		stageId: STAGES[3].id,
		matchId: MATCHES[14].id,
		roundId: STAGE_ROUNDS[8].id
	},
	{
		id: 16,
		stageId: STAGES[3].id,
		matchId: MATCHES[15].id,
		roundId: STAGE_ROUNDS[8].id
	},
	// Event 2: Swiss Stage
	{
		id: 17,
		stageId: STAGES[4].id,
		matchId: MATCHES[16].id,
		roundId: STAGE_ROUNDS[9].id
	},
	{
		id: 18,
		stageId: STAGES[4].id,
		matchId: MATCHES[17].id,
		roundId: STAGE_ROUNDS[9].id
	},
	{
		id: 19,
		stageId: STAGES[4].id,
		matchId: MATCHES[18].id,
		roundId: STAGE_ROUNDS[10].id
	},
	{
		id: 20,
		stageId: STAGES[4].id,
		matchId: MATCHES[19].id,
		roundId: STAGE_ROUNDS[10].id
	},
	// Event 2: Quarter Finals
	{
		id: 21,
		stageId: STAGES[5].id,
		matchId: MATCHES[20].id,
		roundId: STAGE_ROUNDS[11].id
	},
	{
		id: 22,
		stageId: STAGES[5].id,
		matchId: MATCHES[21].id,
		roundId: STAGE_ROUNDS[11].id
	},
	{
		id: 23,
		stageId: STAGES[5].id,
		matchId: MATCHES[22].id,
		roundId: STAGE_ROUNDS[11].id
	},
	{
		id: 24,
		stageId: STAGES[5].id,
		matchId: MATCHES[23].id,
		roundId: STAGE_ROUNDS[11].id
	},
	// Event 2: Semi Finals
	{
		id: 25,
		stageId: STAGES[6].id,
		matchId: MATCHES[24].id,
		roundId: STAGE_ROUNDS[12].id
	},
	{
		id: 26,
		stageId: STAGES[6].id,
		matchId: MATCHES[25].id,
		roundId: STAGE_ROUNDS[12].id
	},
	// Event 2: Grand Finals
	{
		id: 27,
		stageId: STAGES[7].id,
		matchId: MATCHES[26].id,
		roundId: STAGE_ROUNDS[13].id
	},
	// Event 3: Showmatch
	{
		id: 28,
		stageId: STAGES[8].id,
		matchId: MATCHES[27].id,
		roundId: STAGE_ROUNDS[14].id
	},
	// Event 4: Regional Qualifier
	{
		id: 29,
		stageId: STAGES[9].id,
		matchId: MATCHES[28].id,
		roundId: STAGE_ROUNDS[15].id
	},
	{
		id: 30,
		stageId: STAGES[9].id,
		matchId: MATCHES[29].id,
		roundId: STAGE_ROUNDS[15].id
	},
	{
		id: 31,
		stageId: STAGES[9].id,
		matchId: MATCHES[30].id,
		roundId: STAGE_ROUNDS[16].id
	},
	{
		id: 32,
		stageId: STAGES[9].id,
		matchId: MATCHES[31].id,
		roundId: STAGE_ROUNDS[16].id
	},
	// Event 5: Group Stage
	{
		id: 33,
		stageId: STAGES[10].id,
		matchId: MATCHES[32].id,
		roundId: STAGE_ROUNDS[17].id
	},
	{
		id: 34,
		stageId: STAGES[10].id,
		matchId: MATCHES[33].id,
		roundId: STAGE_ROUNDS[17].id
	},
	{
		id: 35,
		stageId: STAGES[10].id,
		matchId: MATCHES[34].id,
		roundId: STAGE_ROUNDS[18].id
	},
	{
		id: 36,
		stageId: STAGES[10].id,
		matchId: MATCHES[35].id,
		roundId: STAGE_ROUNDS[18].id
	},
	// Event 5: Playoffs
	{
		id: 37,
		stageId: STAGES[11].id,
		matchId: MATCHES[36].id,
		roundId: STAGE_ROUNDS[19].id
	},
	{
		id: 38,
		stageId: STAGES[11].id,
		matchId: MATCHES[37].id,
		roundId: STAGE_ROUNDS[20].id
	},
	{
		id: 39,
		stageId: STAGES[11].id,
		matchId: MATCHES[38].id,
		roundId: STAGE_ROUNDS[21].id
	},
	{
		id: 40,
		stageId: STAGES[11].id,
		matchId: MATCHES[39].id,
		roundId: STAGE_ROUNDS[21].id
	}
];

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
	// Example dependencies for Event 2 (Quarter Finals)
	{
		id: 7,
		nodeId: STAGE_NODES[12].id,
		dependencyMatchId: MATCHES[11].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 2 (Semi Finals)
	{
		id: 8,
		nodeId: STAGE_NODES[13].id,
		dependencyMatchId: MATCHES[12].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 2 (Grand Finals)
	{
		id: 9,
		nodeId: STAGE_NODES[14].id,
		dependencyMatchId: MATCHES[13].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 3 (Showmatch)
	{
		id: 10,
		nodeId: STAGE_NODES[15].id,
		dependencyMatchId: MATCHES[14].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 4 (Regional Qualifier)
	{
		id: 11,
		nodeId: STAGE_NODES[17].id,
		dependencyMatchId: MATCHES[16].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 5 (Group Stage)
	{
		id: 12,
		nodeId: STAGE_NODES[19].id,
		dependencyMatchId: MATCHES[18].id,
		outcome: 'winner' as const
	},
	// Example dependencies for Event 5 (Playoffs)
	{
		id: 13,
		nodeId: STAGE_NODES[21].id,
		dependencyMatchId: MATCHES[20].id,
		outcome: 'winner' as const
	}
];
