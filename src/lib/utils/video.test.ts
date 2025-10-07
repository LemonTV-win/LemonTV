import { describe, expect, it } from 'bun:test';
import { detectPlatform } from './video';

describe('detectPlatform', () => {
	it('detects bilibili URLs', () => {
		expect(detectPlatform('https://www.bilibili.com/video/BV1')).toBe('bilibili');
		expect(detectPlatform('https://space.bilibili.com/100')).toBe('bilibili');
		expect(detectPlatform('https://live.bilibili.com/12345')).toBe('bilibili');
		expect(detectPlatform('https://share.b23.tv/abcd')).toBe('bilibili');
	});

	it('detects youtube URLs', () => {
		expect(detectPlatform('https://www.youtube.com/watch?v=test')).toBe('youtube');
		expect(detectPlatform('https://youtu.be/test')).toBe('youtube');
		expect(detectPlatform('https://www.youtube-nocookie.com/embed/test')).toBe('youtube');
		expect(detectPlatform('HTTPS://WWW.YOUTUBE.COM/WATCH?v=dQw4w9WgXcQ')).toBe('youtube');
	});

	it('detects twitch URLs', () => {
		expect(detectPlatform('https://TWITCH.tv/somechannel')).toBe('twitch');
		expect(detectPlatform('https://m.twitch.tv/videos/123456')).toBe('twitch');
		expect(detectPlatform('https://clips.twitch.tv/LegendaryClip')).toBe('twitch');
	});

	it('returns null for unsupported hosts or invalid urls', () => {
		expect(detectPlatform('https://example.com/video')).toBeNull();
		expect(detectPlatform('not a url')).toBeNull();
	});

	it('returns null for partial matches that are not platforms', () => {
		expect(detectPlatform('https://notyoutube.co/watch?v=123')).toBeNull();
	});
});
