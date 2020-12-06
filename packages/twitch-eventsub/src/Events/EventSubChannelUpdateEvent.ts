import { Enumerable } from '@d-fischer/shared-utils';
import type { ApiClient, HelixUser } from 'twitch';

export interface EventSubChannelUpdateEventData {
	user_id: string;
	user_name: string;
	title: string;
	language: string;
	category_id: string;
	category_name: string;
	isMature: boolean;
}
/**
 * An EventSub Event representing a change in channel metadata
 */
export class EventSubChannelUpdateEvent {
	/** @private */
	@Enumerable(false) protected readonly _client: ApiClient;

	constructor(private readonly _data: EventSubChannelUpdateEvent, client: ApiClient) {
		this._client = client;
	}

	/**
	 * The User ID of channel
	 */
	get userId(): string {
		return this._data.user_id;
	}

	/**
	 * The display name of the user
	 */
	get userDisplayName(): string {
		return this._data.user_name;
	}

	/**
	 * The title of the channel
	 */
	get streamTitle(): string {
		return this._data.title;
	}

	/**
	 * The language of the channel
	 */
	get streamLanguage(): string {
		return this._data.language;
	}

	/**
	 * The ID of the Category the channel is under
	 */
	get categoryId(): string {
		return this._data.category_id;
	}

	/**
	 * The name of the Category the channel is under
	 */
	get categoryName(): string {
		return this._data.category_name;
	}

	get isMature(): boolean {
		return this._data.isMature;
	}
}