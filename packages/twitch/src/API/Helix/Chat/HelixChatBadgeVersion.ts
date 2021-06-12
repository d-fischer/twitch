import { Enumerable } from '@d-fischer/shared-utils';
import { rtfm } from 'twitch-common';

export type HelixChatBadgeScale = 1 | 2 | 4;

/** @private */
export interface HelixChatBadgeVersionData {
	id: string;
	image_url_1x: string;
	image_url_2x: string;
	image_url_4x: string;
}

/**
 * A version of a chat badge.
 */
@rtfm<HelixChatBadgeVersion>('twitch', 'HelixChatBadgeVersion', 'id')
export class HelixChatBadgeVersion {
	@Enumerable(false) private readonly _data: HelixChatBadgeVersionData;

	/** @private */
	constructor(data: HelixChatBadgeVersionData) {
		this._data = data;
	}

	/**
	 * The badge version ID.
	 */
	get id(): string {
		return this._data.id;
	}

	/**
	 * Gets an image URL for the given scale.
	 *
	 * @param scale The scale of the badge image.
	 */
	getImageUrl(scale: HelixChatBadgeScale): string {
		// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
		return this._data[`image_url_${scale}x` as const];
	}
}
