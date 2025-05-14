import { execSync } from 'child_process';

interface Commit {
	timestamp: number;
	message: string;
}

function formatDateTime(timestamp: number): string {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const timezone = date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];

	return `${year}-${month}-${day} ${hours}:${minutes} ${timezone}`;
}

function generateChangelog() {
	try {
		// Get git log with timestamp and message
		const gitLog = execSync('git log --pretty=format:"%at|%s"', { encoding: 'utf-8' });

		// Parse commits and sort by timestamp
		const commits: Commit[] = gitLog
			.split('\n')
			.filter((line) => line.trim())
			.map((line) => {
				const [timestamp, message] = line.split('|');
				return {
					timestamp: parseInt(timestamp) * 1000, // Convert to milliseconds
					message
				};
			})
			.sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending

		// Group commits by editing periods (24 hour threshold)
		const HOURS_24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
		const periods: { start: number; commits: string[] }[] = [];

		let currentPeriod: { start: number; commits: string[] } | null = null;

		commits.forEach((commit) => {
			if (!currentPeriod || commit.timestamp < currentPeriod.start - HOURS_24) {
				// Start new period
				currentPeriod = {
					start: commit.timestamp,
					commits: []
				};
				periods.push(currentPeriod);
			}
			currentPeriod.commits.push(commit.message);
		});

		// Generate changelog
		let changelog = '# Changelog\n\n';

		periods.forEach((period, index) => {
			const startTime = formatDateTime(period.start);
			const endTime =
				index < periods.length - 1 ? formatDateTime(periods[index + 1].start) : 'present';

			changelog += `## Editing Period: ${startTime} to ${endTime}\n\n`;
			period.commits.forEach((message) => {
				changelog += `- ${message}\n`;
			});
			changelog += '\n';
		});

		// Print to stdout
		console.log(changelog);
	} catch (error) {
		console.error('Error generating changelog:', error);
		process.exit(1);
	}
}

generateChangelog();
