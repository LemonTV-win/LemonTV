import { describe, it, expect } from 'bun:test';
import { isPrivateIp } from './storage-ssrf';

describe('isPrivateIp', () => {
	it('rejects IPv4 loopback / private / link-local / CGNAT / reserved', () => {
		for (const ip of [
			'127.0.0.1',
			'127.1.2.3',
			'0.0.0.0',
			'10.0.0.5',
			'172.16.0.1',
			'172.31.255.255',
			'192.168.1.1',
			'169.254.169.254', // cloud metadata
			'100.64.0.1', // CGNAT
			'224.0.0.1', // multicast
			'255.255.255.255'
		]) {
			expect(isPrivateIp(ip)).toBe(true);
		}
	});

	it('allows public IPv4', () => {
		for (const ip of [
			'8.8.8.8',
			'1.1.1.1',
			'104.244.42.1',
			'172.15.0.1',
			'172.32.0.1',
			'100.63.0.1',
			'100.128.0.1'
		]) {
			expect(isPrivateIp(ip)).toBe(false);
		}
	});

	it('rejects IPv6 loopback / ULA / link-local (incl. brackets + zone id)', () => {
		for (const ip of ['::1', '[::1]', '::', 'fe80::1', 'fe80::1%eth0', 'fc00::1', 'fd12:3456::1']) {
			expect(isPrivateIp(ip)).toBe(true);
		}
	});

	it('handles IPv4-mapped IPv6 by the embedded v4', () => {
		expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
		expect(isPrivateIp('::ffff:10.0.0.1')).toBe(true);
		expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false);
	});

	it('allows public IPv6', () => {
		expect(isPrivateIp('2606:4700:4700::1111')).toBe(false);
		expect(isPrivateIp('2001:4860:4860::8888')).toBe(false);
	});
});
