/**
 * SSRF address denylist — pure (no env/SDK imports) so it is unit-testable.
 *
 * Used by the image-ingestion fetch in `./storage`: a resolved address that is
 * loopback/private/link-local/CGNAT/reserved must never be connected to.
 */
export function isPrivateIp(ip: string): boolean {
	const addr = ip
		.toLowerCase()
		.replace(/^\[|\]$/g, '')
		.replace(/%.*$/, ''); // strip brackets + IPv6 zone id
	const v4 = addr.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (v4) {
		const a = Number(v4[1]);
		const b = Number(v4[2]);
		return (
			a === 0 ||
			a === 10 ||
			a === 127 ||
			(a === 169 && b === 254) || // link-local
			(a === 172 && b >= 16 && b <= 31) ||
			(a === 192 && b === 168) ||
			(a === 100 && b >= 64 && b <= 127) || // CGNAT
			a >= 224 // multicast / reserved
		);
	}
	if (addr === '::1' || addr === '::') return true;
	if (addr.startsWith('::ffff:')) return isPrivateIp(addr.slice(7)); // IPv4-mapped IPv6
	if (addr.startsWith('fe80') || addr.startsWith('fc') || addr.startsWith('fd')) return true; // link-local / ULA
	return false;
}
