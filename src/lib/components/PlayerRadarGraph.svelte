<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler,
		Tooltip,
		Legend,
		RadarController
	} from 'chart.js';
	import type { ChartConfiguration, TooltipItem } from 'chart.js';
	import { m } from '$lib/paraglide/messages';

	// Register Chart.js components
	Chart.register(
		RadarController,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler,
		Tooltip,
		Legend
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
	}

	let { playerStats }: Props = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let chart: Chart | null = null;

	// Normalize values to 0-100 scale for radar chart
	function normalizeValue(value: number, max: number): number {
		return Math.min(100, (value / max) * 100);
	}

	// Calculate performance metrics
	function calculateMetrics() {
		const totalGames = playerStats.totalGames;
		const avgKillsPerGame = totalGames > 0 ? playerStats.totalKills / totalGames : 0;
		const avgDeathsPerGame = totalGames > 0 ? playerStats.totalDeaths / totalGames : 0;
		const avgAssistsPerGame = totalGames > 0 ? playerStats.totalAssists / totalGames : 0;
		const avgDamagePerGame = totalGames > 0 ? playerStats.totalDamage / totalGames : 0;

		// Define reasonable maximums for normalization
		const maxWinRate = 100; // Win rate is already a percentage
		const maxKD = 5; // K/D ratio max
		const maxKillsPerGame = 20; // Average kills per game
		const maxAssistsPerGame = 10; // Average assists per game
		const maxDamagePerGame = 5000; // Average damage per game
		const maxScore = 300; // Average score per game

		return {
			winRate: normalizeValue(playerStats.winRate, maxWinRate),
			kd: normalizeValue(playerStats.kd, maxKD),
			killsPerGame: normalizeValue(avgKillsPerGame, maxKillsPerGame),
			deathsPerGame: normalizeValue(15 - avgDeathsPerGame, 15), // Inverted: fewer deaths = better
			assistsPerGame: normalizeValue(avgAssistsPerGame, maxAssistsPerGame),
			damagePerGame: normalizeValue(avgDamagePerGame, maxDamagePerGame),
			avgScore: normalizeValue(playerStats.averageScore, maxScore)
		};
	}

	let metricText = $derived({
		winRate: m['content.stats.metrics.win_rate'],
		kdRatio: m['content.stats.metrics.kd_ratio'],
		killsPerGame: m['content.stats.metrics.kills_per_game'],
		deathsPerGame: m['content.stats.metrics.deaths_per_game'],
		survivalRate: m['content.stats.metrics.survival_rate'],
		assistsPerGame: m['content.stats.metrics.assists_per_game'],
		damagePerGame: m['content.stats.metrics.damage_per_game'],
		averageScore: m['content.stats.metrics.average_score']
	} as const);

	let metricLabels = $derived([
		metricText.winRate(),
		metricText.kdRatio(),
		metricText.killsPerGame,
		metricText.survivalRate,
		metricText.assistsPerGame(),
		metricText.damagePerGame(),
		metricText.averageScore()
	]);

	onMount(async () => {
		if (!canvas) return;

		const metrics = calculateMetrics();

		const config: ChartConfiguration<'radar'> = {
			type: 'radar',
			data: {
				labels: metricLabels,
				datasets: [
					{
						label: m['player_radar.dataset_performance'](),
						data: [
							metrics.winRate,
							metrics.kd,
							metrics.killsPerGame,
							metrics.deathsPerGame,
							metrics.assistsPerGame,
							metrics.damagePerGame,
							metrics.avgScore
						],
						backgroundColor: 'rgba(59, 130, 246, 0.2)',
						borderColor: 'rgba(59, 130, 246, 0.8)',
						borderWidth: 2,
						pointBackgroundColor: 'rgba(59, 130, 246, 1)',
						pointBorderColor: '#fff',
						pointHoverBackgroundColor: '#fff',
						pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					r: {
						beginAtZero: true,
						max: 100,
						min: 0,
						ticks: {
							display: false
						},
						grid: {
							color: 'rgba(156, 163, 175, 0.2)'
						},
						pointLabels: {
							color: '#e5e7eb',
							font: {
								size: 12,
								weight: 'bold'
							}
						}
					}
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						titleColor: '#e5e7eb',
						bodyColor: '#e5e7eb',
						borderColor: 'rgba(59, 130, 246, 0.5)',
						borderWidth: 1,
						callbacks: {
							label(context: TooltipItem<'radar'>) {
								const totals = playerStats.totalGames || 0;
								const safeDiv = (value: number) => (totals > 0 ? value / totals : 0);

								const labels = [
									`${metricText.winRate}: ${playerStats.winRate.toFixed(1)}%`,
									`${metricText.kdRatio}: ${playerStats.kd.toFixed(2)}`,
									`${metricText.killsPerGame}: ${safeDiv(playerStats.totalKills).toFixed(1)}`,
									`${metricText.deathsPerGame}: ${safeDiv(playerStats.totalDeaths).toFixed(1)}`,
									`${metricText.assistsPerGame}: ${safeDiv(playerStats.totalAssists).toFixed(1)}`,
									`${metricText.damagePerGame}: ${safeDiv(playerStats.totalDamage).toFixed(0)}`,
									`${metricText.averageScore}: ${playerStats.averageScore.toFixed(0)}`
								];
								return labels[context.dataIndex] ?? '';
							}
						}
					}
				}
			}
		};

		chart = new Chart(canvas, config);
	});

	// Cleanup chart on component destroy
	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="glass rounded-2xl p-6">
	<h3 class="mb-4 text-lg font-bold">{m['player_radar.title']()}</h3>
	<div class="relative h-80 w-full">
		<canvas bind:this={canvas}></canvas>
	</div>
	<div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400 sm:grid-cols-4">
		<div class="text-center">
			<div class="font-semibold text-blue-400">{metricText.winRate}</div>
			<div>{playerStats.winRate.toFixed(1)}%</div>
		</div>
		<div class="text-center">
			<div class="font-semibold text-green-400">{metricText.kdRatio}</div>
			<div>{playerStats.kd.toFixed(2)}</div>
		</div>
		<div class="text-center">
			<div class="font-semibold text-red-400">{metricText.killsPerGame}</div>
			<div>{(playerStats.totalKills / playerStats.totalGames || 0).toFixed(1)}</div>
		</div>
		<div class="text-center">
			<div class="font-semibold text-yellow-400">{metricText.averageScore}</div>
			<div>{playerStats.averageScore.toFixed(0)}</div>
		</div>
	</div>
</div>
