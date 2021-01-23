/// <reference lib="esnext.array" />

import { utf8Length, utf8Substring } from '@d-fischer/shared-utils';
import { ChatEmote } from 'twitch-common';
import type { CheermoteDisplayInfo } from 'twitch-common';

export interface ParsedMessageTextPart {
	type: 'text';
	position: number;
	length: number;
	text: string;
}

export interface ParsedMessageCheerPart {
	type: 'cheer';
	position: number;
	length: number;
	name: string;
	amount: number;
	displayInfo: CheermoteDisplayInfo;
}

export interface ParsedMessageEmotePart {
	type: 'emote';
	position: number;
	length: number;
	id: string;
	name: string;
	displayInfo: ChatEmote;
}

export type ParsedMessagePart = ParsedMessageTextPart | ParsedMessageCheerPart | ParsedMessageEmotePart;

/** @private */
export function parseEmoteOffsets(emotes?: string): Map<string, string[]> {
	if (!emotes) {
		return new Map<string, string[]>();
	}

	return new Map(
		emotes
			.split('/')
			.map(emote => {
				const [emoteId, placements] = emote.split(':', 2);
				if (!placements) {
					return null;
				}
				return [emoteId, placements.split(',')] as [string, string[]];
			})
			.filter((e): e is [string, string[]] => e !== null)
	);
}

/** @private */
export function parseEmotePositions(message: string, emoteOffsets: Map<string, string[]>): ParsedMessageEmotePart[] {
	return [...emoteOffsets.entries()]
		.flatMap(([emote, placements]) =>
			placements.map(
				(placement): ParsedMessageEmotePart => {
					const [startStr, endStr] = placement.split('-');
					const start = +startStr;
					const end = +endStr;
					const name = utf8Substring(message, start, end + 1);

					return {
						type: 'emote',
						position: start,
						length: end - start + 1,
						id: emote,
						name,
						displayInfo: new ChatEmote({
							code: name,
							id: parseInt(emote, 10),
							emoticon_set: -1
						})
					};
				}
			)
		)
		.sort((a, b) => a.position - b.position);
}

/** @private */
export function fillTextPositions(message: string, otherPositions: ParsedMessagePart[]): ParsedMessagePart[] {
	const messageLength = utf8Length(message);
	if (!otherPositions.length) {
		return [
			{
				type: 'text',
				position: 0,
				length: messageLength,
				text: message
			}
		];
	}

	const result: ParsedMessagePart[] = [];
	let currentPosition = 0;

	for (const token of otherPositions) {
		if (token.position > currentPosition) {
			result.push({
				type: 'text',
				position: currentPosition,
				length: token.position - currentPosition,
				text: utf8Substring(message, currentPosition, token.position)
			});
		}
		result.push(token);
		currentPosition = token.position + token.length;
	}

	if (currentPosition < messageLength) {
		result.push({
			type: 'text',
			position: currentPosition,
			length: messageLength - currentPosition,
			text: utf8Substring(message, currentPosition)
		});
	}

	return result;
}
