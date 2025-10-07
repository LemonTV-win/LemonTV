import { describe, expect, it } from 'bun:test';
import { detectPlatform } from './video';

describe('detectPlatform', () => {
	it('detects bilibili domains with subdomains', () => {
		expect(detectPlatform('https://live.bilibili.com/12345')).toBe('bilibili');
		expect(detectPlatform('https://share.b23.tv/abcd')).toBe('bilibili');
	});

	it('detects youtube variants', () => {
		expect(detectPlatform('https://www.youtube.com/watch?v=test')).toBe('youtube');
		expect(detectPlatform('https://youtu.be/test')).toBe('youtube');
		expect(detectPlatform('https://www.youtube-nocookie.com/embed/test')).toBe('youtube');
	});

	it('detects twitch domains case-insensitively', () => {
		expect(detectPlatform('https://TWITCH.tv/somechannel')).toBe('twitch');
	});

	it('returns null for unsupported hosts or invalid urls', () => {
		expect(detectPlatform('https://example.com/video')).toBeNull();
		expect(detectPlatform('not a url')).toBeNull();
	});
});
