import { randomUUID } from 'node:crypto';
import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import type { TCountryCode } from 'countries-list';

const firstUser = await db.select().from(schema.user).limit(1);

export const PLAYERS = [
	// Team 1 Players (7 players)
	{
		id: randomUUID(),
		name: 'Alex "Thunder" Rodriguez',
		slug: 'alex-thunder-rodriguez',
		nationality: 'US' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex-thunder&backgroundColor=b6e3f4',
		userId: firstUser.length > 0 ? firstUser[0].id : null
	},
	{
		id: randomUUID(),
		name: 'Sarah "Viper" Chen',
		slug: 'sarah-viper-chen',
		nationality: 'US' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah-viper&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Marcus "Shadow" Johnson',
		slug: 'marcus-shadow-johnson',
		nationality: 'US' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=marcus-shadow&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Jin "Dragon" Kim',
		slug: 'jin-dragon-kim',
		nationality: 'KR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=jin-dragon&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Emma "Frost" Williams',
		slug: 'emma-frost-williams',
		nationality: 'CA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=emma-frost&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'David "Phoenix" Martinez',
		slug: 'david-phoenix-martinez',
		nationality: 'US' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=david-phoenix&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Lisa "Raven" Thompson',
		slug: 'lisa-raven-thompson',
		nationality: 'CA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lisa-raven&backgroundColor=b6e3f4'
	},
	// Team 2 Players (7 players)
	{
		id: randomUUID(),
		name: 'Hiroshi "Samurai" Tanaka',
		slug: 'hiroshi-samurai-tanaka',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=hiroshi-samurai&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Min-ji "Luna" Park',
		slug: 'min-ji-luna-park',
		nationality: 'KR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=min-ji-luna&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Wei "Storm" Zhang',
		slug: 'wei-storm-zhang',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=wei-storm&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Yuki "Blitz" Yamamoto',
		slug: 'yuki-blitz-yamamoto',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=yuki-blitz&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Jae-hyun "Void" Lee',
		slug: 'jae-hyun-void-lee',
		nationality: 'KR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=jae-hyun-void&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Xia "Nova" Wang',
		slug: 'xia-nova-wang',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=xia-nova&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Kenji "Zen" Nakamura',
		slug: 'kenji-zen-nakamura',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=kenji-zen&backgroundColor=ffd5dc'
	},
	// Team 3 Players (7 players)
	{
		id: randomUUID(),
		name: 'Lukas "Wolf" Mueller',
		slug: 'lukas-wolf-mueller',
		nationality: 'DE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lukas-wolf&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Pierre "Eagle" Dubois',
		slug: 'pierre-eagle-dubois',
		nationality: 'FR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=pierre-eagle&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Oliver "Hawk" Smith',
		slug: 'oliver-hawk-smith',
		nationality: 'GB' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=oliver-hawk&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Erik "Viking" Andersson',
		slug: 'erik-viking-andersson',
		nationality: 'SE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=erik-viking&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Hans "Bear" Weber',
		slug: 'hans-bear-weber',
		nationality: 'DE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=hans-bear&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Claude "Fox" Moreau',
		slug: 'claude-fox-moreau',
		nationality: 'FR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=claude-fox&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Marco "Lion" Rossi',
		slug: 'marco-lion-rossi',
		nationality: 'IT' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=marco-lion&backgroundColor=c0aede'
	},
	// Team 4 Players (7 players)
	{
		id: randomUUID(),
		name: 'Li "Tiger" Wei',
		slug: 'li-tiger-wei',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=li-tiger&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Ming "Phoenix" Chen',
		slug: 'ming-phoenix-chen',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=ming-phoenix&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Kai "Dragon" Wong',
		slug: 'kai-dragon-wong',
		nationality: 'HK' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=kai-dragon&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Yuan "Storm" Liu',
		slug: 'yuan-storm-liu',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=yuan-storm&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Jin "Blade" Tan',
		slug: 'jin-blade-tan',
		nationality: 'SG' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=jin-blade&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Feng "Thunder" Zhao',
		slug: 'feng-thunder-zhao',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=feng-thunder&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Tai "Shadow" Lin',
		slug: 'tai-shadow-lin',
		nationality: 'TW' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=tai-shadow&backgroundColor=ffd5dc'
	},
	// Team 5 Players (7 players)
	{
		id: randomUUID(),
		name: 'Jack "Kangaroo" Wilson',
		slug: 'jack-kangaroo-wilson',
		nationality: 'AU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=jack-kangaroo&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Maya "Kiwi" Thompson',
		slug: 'maya-kiwi-thompson',
		nationality: 'NZ' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=maya-kiwi&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Gabriel "Eagle" Santos',
		slug: 'gabriel-eagle-santos',
		nationality: 'PH' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=gabriel-eagle&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Isabella "Koala" Brown',
		slug: 'isabella-koala-brown',
		nationality: 'AU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=isabella-koala&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Liam "Tui" Davis',
		slug: 'liam-tui-davis',
		nationality: 'NZ' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=liam-tui&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Sophia "Wombat" Garcia',
		slug: 'sophia-wombat-garcia',
		nationality: 'AU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sophia-wombat&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Mateo "Hawk" Cruz',
		slug: 'mateo-hawk-cruz',
		nationality: 'PH' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mateo-hawk&backgroundColor=ffd5dc'
	},
	// Team 6 Players (7 players)
	{
		id: randomUUID(),
		name: 'Dmitry "Bear" Petrov',
		slug: 'dmitry-bear-petrov',
		nationality: 'RU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=dmitry-bear&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Olena "Wolf" Kovalenko',
		slug: 'olena-wolf-kovalenko',
		nationality: 'UA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=olena-wolf&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Piotr "Eagle" Kowalski',
		slug: 'piotr-eagle-kowalski',
		nationality: 'PL' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=piotr-eagle&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Ivan "Tiger" Sokolov',
		slug: 'ivan-tiger-sokolov',
		nationality: 'RU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=ivan-tiger&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Anastasia "Falcon" Melnyk',
		slug: 'anastasia-falcon-melnyk',
		nationality: 'UA' as TCountryCode,
		avatar:
			'https://api.dicebear.com/7.x/avataaars/png?seed=anastasia-falcon&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Tomasz "Lynx" Nowak',
		slug: 'tomasz-lynx-nowak',
		nationality: 'PL' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=tomasz-lynx&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Vladimir "Wolf" Volkov',
		slug: 'vladimir-wolf-volkov',
		nationality: 'RU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=vladimir-wolf&backgroundColor=c0aede'
	},
	// Team 7 Players (7 players)
	{
		id: randomUUID(),
		name: 'Magnus "Viking" Hansen',
		slug: 'magnus-viking-hansen',
		nationality: 'NO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=magnus-viking&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Freja "Valkyrie" Nielsen',
		slug: 'freja-valkyrie-nielsen',
		nationality: 'DK' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=freja-valkyrie&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Eero "Frost" Virtanen',
		slug: 'eero-frost-virtanen',
		nationality: 'FI' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=eero-frost&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Astrid "Storm" Berg',
		slug: 'astrid-storm-berg',
		nationality: 'NO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=astrid-storm&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Lars "Thunder" Jorgensen',
		slug: 'lars-thunder-jorgensen',
		nationality: 'DK' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lars-thunder&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Aino "Aurora" Laaksonen',
		slug: 'aino-aurora-laaksonen',
		nationality: 'FI' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=aino-aurora&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Wojciech "Bear" Mazur',
		slug: 'wojciech-bear-mazur',
		nationality: 'PL' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=wojciech-bear&backgroundColor=c0aede'
	},
	// Team 8 Players (7 players)
	{
		id: randomUUID(),
		name: 'Rafael "Jaguar" Silva',
		slug: 'rafael-jaguar-silva',
		nationality: 'BR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=rafael-jaguar&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Sofia "Condor" Rodriguez',
		slug: 'sofia-condor-rodriguez',
		nationality: 'AR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sofia-condor&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Diego "Puma" Gonzalez',
		slug: 'diego-puma-gonzalez',
		nationality: 'CL' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=diego-puma&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Valentina "Llama" Torres',
		slug: 'valentina-llama-torres',
		nationality: 'PE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=valentina-llama&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Carlos "Eagle" Ramirez',
		slug: 'carlos-eagle-ramirez',
		nationality: 'CO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=carlos-eagle&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Ana "Jaguar" Morales',
		slug: 'ana-jaguar-morales',
		nationality: 'MX' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=ana-jaguar&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Mateo "Puma" Fernandez',
		slug: 'mateo-puma-fernandez',
		nationality: 'UY' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mateo-puma&backgroundColor=ffdfbf'
	},
	// Additional Teams - Team 9 (7 players)
	{
		id: randomUUID(),
		name: 'Ahmed "Desert" Al-Mahmoud',
		slug: 'ahmed-desert-al-mahmoud',
		nationality: 'SA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=ahmed-desert&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Fatima "Phoenix" Al-Zahra',
		slug: 'fatima-phoenix-al-zahra',
		nationality: 'AE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=fatima-phoenix&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Omar "Lion" Hassan',
		slug: 'omar-lion-hassan',
		nationality: 'EG' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=omar-lion&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Layla "Falcon" Mansour',
		slug: 'layla-falcon-mansour',
		nationality: 'LB' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=layla-falcon&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Khalid "Eagle" Rahman',
		slug: 'khalid-eagle-rahman',
		nationality: 'KW' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=khalid-eagle&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Nour "Storm" El-Sayed',
		slug: 'nour-storm-el-sayed',
		nationality: 'EG' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=nour-storm&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Zaid "Wolf" Al-Rashid',
		slug: 'zaid-wolf-al-rashid',
		nationality: 'SA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=zaid-wolf&backgroundColor=ffdfbf'
	},
	// Additional Teams - Team 10 (7 players)
	{
		id: randomUUID(),
		name: 'Priya "Tiger" Patel',
		slug: 'priya-tiger-patel',
		nationality: 'IN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=priya-tiger&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Arjun "Lion" Singh',
		slug: 'arjun-lion-singh',
		nationality: 'IN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=arjun-lion&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Mei "Dragon" Lin',
		slug: 'mei-dragon-lin',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mei-dragon&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Raj "Eagle" Kumar',
		slug: 'raj-eagle-kumar',
		nationality: 'IN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=raj-eagle&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Yuki "Phoenix" Tanaka',
		slug: 'yuki-phoenix-tanaka',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=yuki-phoenix&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Aisha "Storm" Khan',
		slug: 'aisha-storm-khan',
		nationality: 'PK' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=aisha-storm&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Hiroto "Blade" Yamamoto',
		slug: 'hiroto-blade-yamamoto',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=hiroto-blade&backgroundColor=ffd5dc'
	},
	// Additional Teams - Team 11 (7 players)
	{
		id: randomUUID(),
		name: 'Isabella "Rose" Santos',
		slug: 'isabella-rose-santos',
		nationality: 'BR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=isabella-rose&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Lucas "Thunder" Costa',
		slug: 'lucas-thunder-costa',
		nationality: 'BR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lucas-thunder&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Valentina "Moon" Rodriguez',
		slug: 'valentina-moon-rodriguez',
		nationality: 'AR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=valentina-moon&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Santiago "Sun" Fernandez',
		slug: 'santiago-sun-fernandez',
		nationality: 'AR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=santiago-sun&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Camila "Star" Silva',
		slug: 'camila-star-silva',
		nationality: 'BR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=camila-star&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Mateo "Ocean" Torres',
		slug: 'mateo-ocean-torres',
		nationality: 'CL' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mateo-ocean&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Sofia "River" Morales',
		slug: 'sofia-river-morales',
		nationality: 'MX' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sofia-river&backgroundColor=ffdfbf'
	},
	// Additional Teams - Team 12 (7 players)
	{
		id: randomUUID(),
		name: 'Emma "Frost" Johansson',
		slug: 'emma-frost-johansson',
		nationality: 'SE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=emma-frost-se&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Lars "Storm" Bergman',
		slug: 'lars-storm-bergman',
		nationality: 'NO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lars-storm-no&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Anna "Aurora" Virtanen',
		slug: 'anna-aurora-virtanen',
		nationality: 'FI' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=anna-aurora&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Johan "Viking" Hansen',
		slug: 'johan-viking-hansen',
		nationality: 'DK' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=johan-viking&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Elin "Snow" Lindberg',
		slug: 'elin-snow-lindberg',
		nationality: 'SE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=elin-snow&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Magnus "Ice" Jorgensen',
		slug: 'magnus-ice-jorgensen',
		nationality: 'NO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=magnus-ice&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Helena "Frost" Virtanen',
		slug: 'helena-frost-virtanen',
		nationality: 'FI' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=helena-frost&backgroundColor=c0aede'
	},
	// Additional Team 13 - Shadow Phoenixes (6 players)
	{
		id: randomUUID(),
		name: 'Akira "Shadow" Nakamura',
		slug: 'akira-shadow-nakamura',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=akira-shadow&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Zara "Phoenix" Al-Rashid',
		slug: 'zara-phoenix-al-rashid',
		nationality: 'AE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=zara-phoenix&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Mikhail "Specter" Volkov',
		slug: 'mikhail-specter-volkov',
		nationality: 'RU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mikhail-specter&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Luna "Eclipse" Santos',
		slug: 'luna-eclipse-santos',
		nationality: 'PE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=luna-eclipse&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Kai "Wraith" Thompson',
		slug: 'kai-wraith-thompson',
		nationality: 'NZ' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=kai-wraith&backgroundColor=b6e3f4'
	},
	{
		id: randomUUID(),
		name: 'Elena "Viper" Kozlov',
		slug: 'elena-viper-kozlov',
		nationality: 'UA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=elena-viper&backgroundColor=ffdfbf'
	},
	// Additional Team 14 - Storm Eagles (6 players)
	{
		id: randomUUID(),
		name: 'Hassan "Storm" Ibrahim',
		slug: 'hassan-storm-ibrahim',
		nationality: 'EG' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=hassan-storm&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Yuki "Eagle" Tanaka',
		slug: 'yuki-eagle-tanaka',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=yuki-eagle&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Liam "Thunder" O\'Connor',
		slug: 'liam-thunder-oconnor',
		nationality: 'IE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=liam-thunder&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Aria "Lightning" Kumar',
		slug: 'aria-lightning-kumar',
		nationality: 'IN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=aria-lightning&backgroundColor=b6e3f4'
	},
	{
		id: randomUUID(),
		name: 'Viktor "Falcon" Petrov',
		slug: 'viktor-falcon-petrov',
		nationality: 'BG' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=viktor-falcon&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Mei "Spark" Chen',
		slug: 'mei-spark-chen',
		nationality: 'TW' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mei-spark&backgroundColor=ffd5dc'
	},
	// Substitute/Backup Players for existing teams (30 players)
	// Thunder Wolves substitutes
	{
		id: randomUUID(),
		name: 'Tyler "Backup" Williams',
		slug: 'tyler-backup-williams',
		nationality: 'US' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=tyler-backup&backgroundColor=b6e3f4'
	},
	{
		id: randomUUID(),
		name: 'Grace "Reserve" Johnson',
		slug: 'grace-reserve-johnson',
		nationality: 'CA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=grace-reserve&backgroundColor=ffdfbf'
	},
	// Dragon Phoenix substitutes
	{
		id: randomUUID(),
		name: 'Kenta "Sub" Yamamoto',
		slug: 'kenta-sub-yamamoto',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=kenta-sub&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Soo-jin "Bench" Park',
		slug: 'soo-jin-bench-park',
		nationality: 'KR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=soo-jin-bench&backgroundColor=c0aede'
	},
	// Viking Storm substitutes
	{
		id: randomUUID(),
		name: 'Hans "Backup" Schmidt',
		slug: 'hans-backup-schmidt',
		nationality: 'DE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=hans-backup&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Marie "Reserve" Dubois',
		slug: 'marie-reserve-dubois',
		nationality: 'FR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=marie-reserve&backgroundColor=ffdfbf'
	},
	// Tiger Blades substitutes
	{
		id: randomUUID(),
		name: 'Dao "Sub" Nguyen',
		slug: 'dao-sub-nguyen',
		nationality: 'VN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=dao-sub&backgroundColor=b6e3f4'
	},
	{
		id: randomUUID(),
		name: 'Ping "Bench" Wang',
		slug: 'ping-bench-wang',
		nationality: 'CN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=ping-bench&backgroundColor=ffd5dc'
	},
	// Kangaroo Eagles substitutes
	{
		id: randomUUID(),
		name: 'Blake "Backup" Mitchell',
		slug: 'blake-backup-mitchell',
		nationality: 'AU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=blake-backup&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Isla "Reserve" Thompson',
		slug: 'isla-reserve-thompson',
		nationality: 'NZ' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=isla-reserve&backgroundColor=d1d4f9'
	},
	// Bear Falcons substitutes
	{
		id: randomUUID(),
		name: 'Alexei "Sub" Smirnov',
		slug: 'alexei-sub-smirnov',
		nationality: 'RU' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=alexei-sub&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Nadia "Bench" Kozlova',
		slug: 'nadia-bench-kozlova',
		nationality: 'UA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=nadia-bench&backgroundColor=b6e3f4'
	},
	// Frost Valkyries substitutes
	{
		id: randomUUID(),
		name: 'Olaf "Backup" Kristensen',
		slug: 'olaf-backup-kristensen',
		nationality: 'NO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=olaf-backup&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Astrid "Reserve" Eriksson',
		slug: 'astrid-reserve-eriksson',
		nationality: 'SE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=astrid-reserve&backgroundColor=c0aede'
	},
	// Jaguar Condors substitutes
	{
		id: randomUUID(),
		name: 'Carlos "Sub" Mendoza',
		slug: 'carlos-sub-mendoza',
		nationality: 'CO' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=carlos-sub&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Lucia "Bench" Vargas',
		slug: 'lucia-bench-vargas',
		nationality: 'CL' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lucia-bench&backgroundColor=ffdfbf'
	},
	// Desert Lions substitutes
	{
		id: randomUUID(),
		name: 'Amara "Backup" Hassan',
		slug: 'amara-backup-hassan',
		nationality: 'SA' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=amara-backup&backgroundColor=b6e3f4'
	},
	{
		id: randomUUID(),
		name: 'Omar "Reserve" Al-Zahra',
		slug: 'omar-reserve-al-zahra',
		nationality: 'KW' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=omar-reserve&backgroundColor=ffd5dc'
	},
	// Tiger Dragons substitutes
	{
		id: randomUUID(),
		name: 'Rohan "Sub" Gupta',
		slug: 'rohan-sub-gupta',
		nationality: 'IN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=rohan-sub&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Sakura "Bench" Tanaka',
		slug: 'sakura-bench-tanaka',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sakura-bench&backgroundColor=d1d4f9'
	},
	// Rose Thunder substitutes
	{
		id: randomUUID(),
		name: 'Gabriela "Backup" Lima',
		slug: 'gabriela-backup-lima',
		nationality: 'BR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=gabriela-backup&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Diego "Reserve" Castro',
		slug: 'diego-reserve-castro',
		nationality: 'AR' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=diego-reserve&backgroundColor=b6e3f4'
	},
	// Aurora Vikings substitutes
	{
		id: randomUUID(),
		name: 'Bjorn "Sub" Andersen',
		slug: 'bjorn-sub-andersen',
		nationality: 'DK' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=bjorn-sub&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Elina "Bench" Virtanen',
		slug: 'elina-bench-virtanen',
		nationality: 'FI' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=elina-bench&backgroundColor=c0aede'
	},
	// Shadow Phoenixes substitutes (2 players)
	{
		id: randomUUID(),
		name: 'Ryo "Backup" Sato',
		slug: 'ryo-backup-sato',
		nationality: 'JP' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=ryo-backup&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Fatima "Reserve" Al-Mansouri',
		slug: 'fatima-reserve-al-mansouri',
		nationality: 'AE' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=fatima-reserve&backgroundColor=ffdfbf'
	},
	// Storm Eagles substitutes (2 players)
	{
		id: randomUUID(),
		name: 'Malik "Sub" Ahmed',
		slug: 'malik-sub-ahmed',
		nationality: 'EG' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=malik-sub&backgroundColor=b6e3f4'
	},
	{
		id: randomUUID(),
		name: 'Priyanka "Bench" Sharma',
		slug: 'priyanka-bench-sharma',
		nationality: 'IN' as TCountryCode,
		avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=priyanka-bench&backgroundColor=ffd5dc'
	}
] as schema.Player[];

export const PLAYER_ADDITIONAL_NATIONALITIES = [
	{
		playerId: PLAYERS[0].id, // Alex "Thunder" Rodriguez (US)
		nationality: 'MX' as TCountryCode // Adding Mexican nationality
	},
	{
		playerId: PLAYERS[3].id, // Jin "Dragon" Kim (KR)
		nationality: 'US' as TCountryCode // Adding US nationality
	},
	{
		playerId: PLAYERS[5].id, // Emma "Frost" Williams (CA)
		nationality: 'US' as TCountryCode // Adding US nationality
	},
	{
		playerId: PLAYERS[2].id, // Marcus "Shadow" Johnson (US)
		nationality: 'CA' as TCountryCode // Adding Canadian nationality
	},
	{
		playerId: PLAYERS[9].id, // Wei "Storm" Zhang (CN)
		nationality: 'HK' as TCountryCode // Adding Hong Kong nationality
	},
	{
		playerId: PLAYERS[15].id, // Lukas "Wolf" Mueller (DE)
		nationality: 'AT' as TCountryCode // Adding Austrian nationality
	},
	{
		playerId: PLAYERS[22].id, // Li "Tiger" Wei (CN)
		nationality: 'TW' as TCountryCode // Adding Taiwanese nationality
	},
	{
		playerId: PLAYERS[28].id, // Jack "Kangaroo" Wilson (AU)
		nationality: 'NZ' as TCountryCode // Adding New Zealand nationality
	},
	{
		playerId: PLAYERS[35].id, // Dmitry "Bear" Petrov (RU)
		nationality: 'UA' as TCountryCode // Adding Ukrainian nationality
	},
	{
		playerId: PLAYERS[42].id, // Magnus "Viking" Hansen (NO)
		nationality: 'SE' as TCountryCode // Adding Swedish nationality
	},
	{
		playerId: PLAYERS[49].id, // Rafael "Jaguar" Silva (BR)
		nationality: 'PT' as TCountryCode // Adding Portuguese nationality
	},
	{
		playerId: PLAYERS[56].id, // Ahmed "Desert" Al-Mahmoud (SA)
		nationality: 'AE' as TCountryCode // Adding UAE nationality
	},
	{
		playerId: PLAYERS[63].id, // Priya "Tiger" Patel (IN)
		nationality: 'GB' as TCountryCode // Adding British nationality
	},
	{
		playerId: PLAYERS[70].id, // Isabella "Rose" Santos (BR)
		nationality: 'AR' as TCountryCode // Adding Argentine nationality
	},
	{
		playerId: PLAYERS[77].id, // Emma "Frost" Johansson (SE)
		nationality: 'NO' as TCountryCode // Adding Norwegian nationality
	},
	// Additional nationalities for new players
	{
		playerId: PLAYERS[84].id, // Akira "Shadow" Nakamura (JP)
		nationality: 'US' as TCountryCode // Adding US nationality
	},
	{
		playerId: PLAYERS[85].id, // Zara "Phoenix" Al-Rashid (AE)
		nationality: 'SA' as TCountryCode // Adding Saudi nationality
	},
	{
		playerId: PLAYERS[90].id, // Hassan "Storm" Ibrahim (EG)
		nationality: 'LB' as TCountryCode // Adding Lebanese nationality
	},
	{
		playerId: PLAYERS[93].id, // Aria "Lightning" Kumar (IN)
		nationality: 'GB' as TCountryCode // Adding British nationality
	},
	{
		playerId: PLAYERS[98].id, // Kenta "Sub" Yamamoto (JP)
		nationality: 'KR' as TCountryCode // Adding Korean nationality
	},
	{
		playerId: PLAYERS[105].id, // Dao "Sub" Nguyen (VN)
		nationality: 'US' as TCountryCode // Adding US nationality
	},
	{
		playerId: PLAYERS[112].id, // Viktor "Falcon" Petrov (BG)
		nationality: 'RU' as TCountryCode // Adding Russian nationality
	},
	{
		playerId: PLAYERS[119].id, // Carlos "Sub" Mendoza (CO)
		nationality: 'US' as TCountryCode // Adding US nationality
	}
] as schema.PlayerAdditionalNationality[];
