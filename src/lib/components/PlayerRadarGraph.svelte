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
	import type { ChartConfiguration } from 'chart.js';

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
		const maxDeathsPerGame = 15; // Average deaths per game (inverted for better performance)
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

	onMount(async () => {
		if (!canvas) return;

		const metrics = calculateMetrics();

		const config: ChartConfiguration<'radar'> = {
			type: 'radar',
			data: {
				labels: [
					'Win Rate',
					'K/D Ratio',
					'Kills/Game',
					'Survival Rate',
					'Assists/Game',
					'Damage/Game',
					'Avg Score'
				],
				datasets: [
					{
						label: 'Performance',
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
							label: function (context: any) {
								const labels = [
									`Win Rate: ${playerStats.winRate.toFixed(1)}%`,
									`K/D Ratio: ${playerStats.kd.toFixed(2)}`,
									`Kills/Game: ${(playerStats.totalKills / playerStats.totalGames || 0).toFixed(1)}`,
									`Deaths/Game: ${(playerStats.totalDeaths / playerStats.totalGames || 0).toFixed(1)}`,
									`Assists/Game: ${(playerStats.totalAssists / playerStats.totalGames || 0).toFixed(1)}`,
									`Damage/Game: ${(playerStats.totalDamage / playerStats.totalGames || 0).toFixed(0)}`,
									`Avg Score: ${playerStats.averageScore.toFixed(0)}`
								];
								return labels[context.dataIndex];
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
	<h3 class="mb-4 text-lg font-bold">Performance Radar</h3>
	<div class="relative h-80 w-full">
		<canvas bind:this={canvas}></canvas>
	</div>
	<div class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400 sm:grid-cols-4">
		<div class="text-center">
			<div class="font-semibold text-blue-400">Win Rate</div>
			<div>{playerStats.winRate.toFixed(1)}%</div>
		</div>
		<div class="text-center">
			<div class="font-semibold text-green-400">K/D Ratio</div>
			<div>{playerStats.kd.toFixed(2)}</div>
		</div>
		<div class="text-center">
			<div class="font-semibold text-red-400">Kills/Game</div>
			<div>{(playerStats.totalKills / playerStats.totalGames || 0).toFixed(1)}</div>
		</div>
		<div class="text-center">
			<div class="font-semibold text-yellow-400">Avg Score</div>
			<div>{playerStats.averageScore.toFixed(0)}</div>
		</div>
	</div>
</div>
