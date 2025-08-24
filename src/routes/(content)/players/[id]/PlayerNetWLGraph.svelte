<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import {
		Chart,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		LineController,
		Title,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';
	import type { ChartConfiguration } from 'chart.js';

	// Register Chart.js components
	Chart.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		LineController,
		Title,
		Tooltip,
		Legend,
		Filler
	);

	interface Props {
		playerStats: {
			wins: number;
			losses: number;
			totalGames: number;
			winRate: number;
			kd: number;
			totalKills: number;
			totalDeaths: number;
			totalAssists: number;
			totalDamage: number;
			averageScore: number;
		};
		playerMatches?: Array<{
			id: string;
			event: { date: string };
			playerTeamIndex: number;
			teams: Array<{
				team: { name: string };
				score: number;
			}>;
			games?: Array<{ id: number; winner: number; playerPlayed: boolean }>;
		}>;
	}

	let { playerStats, playerMatches = [] }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let chartData = $state<any[]>([]);
	let stats = $state<any>({});

	// Chart is created in onMount after DOM is ready

	// Function to create the chart
	function createChart() {
		if (!canvas || chartData.length === 0) {
			return;
		}

		const yellow = '#eab308';
		const yellowFill = 'rgba(234, 179, 8, 0.12)';
		const red = '#ef4444';
		const redFill = 'rgba(239, 68, 68, 0.12)';

		// dashed zero baseline
		const zeroLinePlugin = {
			id: 'zeroLine',
			afterDraw(chart: any) {
				const { ctx, chartArea, scales } = chart;
				if (!scales?.y || !scales?.x) return;
				const y0 = scales.y.getPixelForValue(0);
				ctx.save();
				ctx.setLineDash([6, 6]);
				ctx.strokeStyle = 'rgba(229, 231, 235, 0.35)';
				ctx.beginPath();
				ctx.moveTo(chartArea.left, y0);
				ctx.lineTo(chartArea.right, y0);
				ctx.stroke();
				ctx.restore();
			}
		};

		// streak highlights (best win above zero, worst loss below zero)
		const winStart = stats.bestWinStartIndex ?? 0;
		const winLen = stats.bestWinStreak ?? 0;
		const lossStart = stats.worstLossStartIndex ?? 0;
		const lossLen = stats.worstLossStreak ?? 0;

		const streakHighlightPlugin = {
			id: 'streakHighlight',
			beforeDatasetsDraw(chart: any) {
				const { ctx, chartArea, scales } = chart;
				if (!scales?.x || !scales?.y) return;
				const x = scales.x;
				const y = scales.y;
				const y0 = y.getPixelForValue(0);
				ctx.save();
				if (winLen > 0) {
					const xStart = x.getPixelForValue(winStart);
					const xEnd = x.getPixelForValue(winStart + winLen);
					ctx.fillStyle = yellowFill;
					ctx.fillRect(
						Math.min(xStart, xEnd),
						chartArea.top,
						Math.abs(xEnd - xStart),
						y0 - chartArea.top
					);
				}
				if (lossLen > 0) {
					const xStart = x.getPixelForValue(lossStart);
					const xEnd = x.getPixelForValue(lossStart + lossLen);
					ctx.fillStyle = redFill;
					ctx.fillRect(Math.min(xStart, xEnd), y0, Math.abs(xEnd - xStart), chartArea.bottom - y0);
				}
				ctx.restore();
			}
		};

		const config: ChartConfiguration<'line'> = {
			plugins: [zeroLinePlugin, streakHighlightPlugin],
			type: 'line',
			data: {
				labels: chartData.map((d) => {
					// If we have real match data, show date, otherwise show game number
					if (d.date) {
						const date = new Date(d.date);
						return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
					}
					return `Game ${d.game}`;
				}),
				datasets: [
					{
						label: 'Net Win/Loss',
						data: chartData.map((d) => d.netWins),
						borderColor: yellow,
						backgroundColor: 'transparent',
						borderWidth: 3,
						fill: false,
						tension: 0.1,
						pointRadius: 2,
						pointHoverRadius: 6,
						pointBackgroundColor: (ctx: any) => ((ctx.parsed?.y ?? 0) >= 0 ? yellow : red),
						pointBorderColor: (ctx: any) => ((ctx.parsed?.y ?? 0) >= 0 ? yellow : red),
						pointHoverBackgroundColor: (ctx: any) => ((ctx.parsed?.y ?? 0) >= 0 ? yellow : red),
						segment: {
							borderColor: (ctx: any) => {
								const y0 = ctx.p0?.parsed?.y ?? 0;
								const y1 = ctx.p1?.parsed?.y ?? 0;
								return (y0 + y1) / 2 >= 0 ? yellow : red;
							}
						}
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: { display: false },
					legend: {
						display: false
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						titleColor: '#e5e7eb',
						bodyColor: '#e5e7eb',
						borderColor: 'rgba(156, 163, 175, 0.3)',
						borderWidth: 1,
						callbacks: {
							label: function (context: any) {
								const value = context.parsed.y;
								const dataPoint = chartData[context.dataIndex];
								let label = value >= 0 ? `+${value} WINS` : `${Math.abs(value)} LOSSES`;

								// Add match details if available
								if (dataPoint && dataPoint.playerScore !== undefined) {
									label += ` (${dataPoint.playerScore}-${dataPoint.opponentScore})`;
								}

								return label;
							}
						}
					}
				},
				scales: {
					x: {
						display: false,
						grid: {
							display: false
						}
					},
					y: {
						display: true,
						position: 'right',
						grid: {
							color: 'rgba(156, 163, 175, 0.2)'
						},
						ticks: {
							color: '#9ca3af',
							font: {
								size: 12
							}
						},
						border: { color: 'rgba(156, 163, 175, 0.2)' }
					}
				},
				elements: {
					line: {
						borderWidth: 2
					}
				}
			}
		};
		try {
			chart = new Chart(canvas, config);
		} catch (error) {
			console.error('Error creating chart:', error);
		}
	}

	// Generate data from real match history only
	function generateNetWLData() {
		if (!playerMatches || playerMatches.length === 0) {
			console.log('No matches available, returning empty data');
			return [];
		}

		// Use real match history data
		console.log('Using real match history:', playerMatches.length, 'matches');

		const sortedMatches = [...playerMatches].sort((a, b) => {
			const dateA = new Date(a.event.date).getTime();
			const dateB = new Date(b.event.date).getTime();
			return dateA - dateB; // Sort by date ascending (oldest first)
		});

		const data = [] as any[];
		let netWins = 0;
		let counter = 0;

		for (const match of sortedMatches) {
			const playerIdx = match.playerTeamIndex;
			const games = match.games ?? [];
			for (const g of games) {
				if (!g.playerPlayed) continue;
				const isWin = g.winner === playerIdx;
				netWins += isWin ? 1 : -1;
				counter++;
				data.push({
					game: counter,
					netWins,
					matchId: match.id,
					date: match.event.date,
					playerScore: isWin ? 1 : 0,
					opponentScore: isWin ? 0 : 1
				});
			}
		}

		console.log('Generated real data (game-based):', data);
		return data;
	}

	// Calculate statistics
	function calculateStats() {
		const data = generateNetWLData();
		const last25 = data.slice(-25);
		const last50 = data.slice(-50);

		const last25Net =
			last25.length > 0 ? last25[last25.length - 1].netWins - (last25[0]?.netWins || 0) : 0;
		const last50Net =
			last50.length > 0 ? last50[last50.length - 1].netWins - (last50[0]?.netWins || 0) : 0;

		// Find best win streak and worst loss streak with start indices
		let currentStreak = 0; // positive for wins, negative for losses
		let currentStartIndex = 0;
		let bestWinStreak = 0;
		let bestWinStartIndex = 0;
		let worstLossStreak = 0; // store as negative internally
		let worstLossStartIndex = 0;

		for (let i = 1; i < data.length; i++) {
			const diff = data[i].netWins - data[i - 1].netWins;
			if (diff > 0) {
				if (currentStreak <= 0) {
					currentStartIndex = i - 1;
					currentStreak = 1;
				} else {
					currentStreak++;
				}
				if (currentStreak > bestWinStreak) {
					bestWinStreak = currentStreak;
					bestWinStartIndex = currentStartIndex;
				}
			} else if (diff < 0) {
				if (currentStreak >= 0) {
					currentStartIndex = i - 1;
					currentStreak = -1;
				} else {
					currentStreak--;
				}
				if (currentStreak < worstLossStreak) {
					worstLossStreak = currentStreak; // more negative is worse
					worstLossStartIndex = currentStartIndex;
				}
			} else {
				currentStreak = 0;
			}
		}

		return {
			last25Net,
			last50Net,
			bestWinStreak: Math.abs(bestWinStreak),
			worstLossStreak: Math.abs(worstLossStreak),
			bestWinStartIndex,
			worstLossStartIndex,
			data
		};
	}

	onMount(async () => {
		// Initialize data
		stats = calculateStats();
		chartData = stats.data;

		await tick();
		if (canvas && chartData.length > 0) {
			if (chart) {
				chart.destroy();
				chart = null;
			}
			createChart();
		}
	});

	// Cleanup chart on component destroy
	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="glass rounded-2xl p-6">
	{#if chartData.length > 0}
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h3 class="text-lg font-bold text-white">Net Win/Loss</h3>
				<p class="text-sm text-gray-400">
					Last {Math.min(playerMatches?.length || 0, 100)} games
				</p>
			</div>
			<div class="text-right">
				<div class="text-2xl font-bold text-red-400">
					{(() => {
						const finalNet = chartData[chartData.length - 1]?.netWins || 0;
						return finalNet >= 0 ? `+${finalNet} WINS` : `${Math.abs(finalNet)} LOSSES`;
					})()}
				</div>
			</div>
		</div>

		<div class="relative h-64 w-full">
			<canvas bind:this={canvas} class="h-full w-full"></canvas>
		</div>

		<div class="mt-4 grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<div class="text-sm text-gray-400">Last x25</div>
				<div
					class="text-lg font-semibold {stats.last25Net >= 0 ? 'text-green-400' : 'text-red-400'}"
				>
					{stats.last25Net >= 0 ? `+${stats.last25Net}` : stats.last25Net}
				</div>
			</div>

			<div class="space-y-2">
				<div class="text-sm text-gray-400">Last x50</div>
				<div
					class="text-lg font-semibold {stats.last50Net >= 0 ? 'text-green-400' : 'text-red-400'}"
				>
					{stats.last50Net >= 0 ? `+${stats.last50Net}` : stats.last50Net}
				</div>
			</div>

			<div class="space-y-2">
				<div class="text-sm text-gray-400">Best Win Streak</div>
				<div class="text-lg font-semibold text-green-400">
					{stats.bestWinStreak} ({stats.bestWinStreak}W)
				</div>
			</div>

			<div class="space-y-2">
				<div class="text-sm text-gray-400">Worst Loss Streak</div>
				<div class="text-lg font-semibold text-red-400">
					{stats.worstLossStreak} ({stats.worstLossStreak}L)
				</div>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-12">
			<h3 class="mb-2 text-lg font-bold text-white">Net Win/Loss</h3>
			<p class="text-center text-sm text-gray-400">
				No match history available to display net win/loss progression.
			</p>
		</div>
	{/if}
</div>
