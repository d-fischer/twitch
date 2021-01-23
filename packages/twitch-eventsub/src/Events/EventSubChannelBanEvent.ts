import { Enumerable } from '@d-fischer/shared-utils';
import type { ApiClient, HelixUser } from 'twitch';
import { rtfm } from 'twitch-common';

/** @private */
export interface EventSubChannelBanEventData {
	user_id: string;
	user_login: string;
	user_name: string;
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
}

/**
 * An EventSub event representing a user being banned in a channel.
 */
@rtfm<EventSubChannelBanEvent>('twitch-eventsub', 'EventSubChannelBanEvent', 'userId')
export class EventSubChannelBanEvent {
	/** @private */
	@Enumerable(false) protected readonly _client: ApiClient;

	/** @private */
	constructor(private readonly _data: EventSubChannelBanEventData, client: ApiClient) {
		this._client = client;
	}

	/**
	 * The ID of the banned user.
	 */
	get userId(): string {
		return this._data.user_id;
	}

	/**
	 * The name of the banned user.
	 */
	get userName(): string {
		return this._data.user_login;
	}

	/**
	 * The display name of the banned user.
	 */
	get userDisplayName(): string {
		return this._data.user_name;
	}

	/**
	 * Retrieves more information about the banned user.
	 */
	async getUser(): Promise<HelixUser> {
		return (await this._client.helix.users.getUserById(this._data.user_id))!;
	}

	/**
	 * The ID of the broadcaster from whose chat the user was banned.
	 */
	get broadcasterId(): string {
		return this._data.broadcaster_user_id;
	}

	/**
	 * The name of the broadcaster from whose chat the user was banned.
	 */
	get broadcasterName(): string {
		return this._data.broadcaster_user_login;
	}

	/**
	 * The display name of the broadcaster from whose chat the user was banned.
	 */
	get broadcasterDisplayName(): string {
		return this._data.broadcaster_user_name;
	}

	/**
	 * Retrieves more information about the broadcaster.
	 */
	async getBroadcaster(): Promise<HelixUser> {
		return (await this._client.helix.users.getUserById(this._data.broadcaster_user_id))!;
	}
}
