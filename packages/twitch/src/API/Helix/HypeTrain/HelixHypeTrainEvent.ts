import { Enumerable } from '@d-fischer/shared-utils';
import { rtfm } from 'twitch-common';
import type { ApiClient } from '../../../ApiClient';
import type { HelixEventData } from '../HelixEvent';
import type { HelixUser } from '../User/HelixUser';
import type { HelixHypeTrainContributionData } from './HelixHypeTrainContribution';
import { HelixHypeTrainContribution } from './HelixHypeTrainContribution';

/** @private */
export interface HelixHypeTrainEventData {
	id: string;
	broadcaster_id: string;
	cooldown_end_time: string;
	expires_at: string;
	goal: number;
	last_contribution: HelixHypeTrainContributionData;
	level: number;
	started_at: string;
	top_contributions: HelixHypeTrainContributionData[];
	total: number;
}

/**
 * The different types a Hype Train event can have.
 */
export type HelixHypeTrainEventType = 'hypetrain.progression';

/**
 * A Hype Train event.
 */
@rtfm<HelixHypeTrainEvent>('twitch', 'HelixHypeTrainEvent', 'id')
export class HelixHypeTrainEvent {
	@Enumerable(false) private readonly _data: HelixEventData<HelixHypeTrainEventData, HelixHypeTrainEventType>;
	@Enumerable(false) private readonly _client: ApiClient;

	/** @private */
	constructor(data: HelixEventData<HelixHypeTrainEventData, HelixHypeTrainEventType>, client: ApiClient) {
		this._data = data;
		this._client = client;
	}

	/**
	 * The unique ID of the Hype Train event.
	 */
	get eventId(): string {
		return this._data.id;
	}

	/**
	 * The type of the Hype Train event.
	 */
	get eventType(): HelixHypeTrainEventType {
		return this._data.event_type;
	}

	/**
	 * The date of the Hype Train event.
	 */
	get eventDate(): Date {
		return new Date(this._data.event_timestamp);
	}

	/**
	 * The version of the Hype Train event.
	 */
	get eventVersion(): string {
		return this._data.version;
	}

	/**
	 * The unique ID of the Hype Train.
	 */
	get id(): string {
		return this._data.id;
	}

	/**
	 * The user ID of the broadcaster where the Hype Train event was triggered.
	 */
	get broadcasterId(): string {
		return this._data.event_data.broadcaster_id;
	}

	/**
	 * Retrieves more information about the broadcaster where the Hype Train event was triggered.
	 */
	async getBroadcaster(): Promise<HelixUser | null> {
		return this._client.helix.users.getUserById(this._data.event_data.broadcaster_id);
	}

	/**
	 * The level of the Hype Train event.
	 */
	get level(): number {
		return this._data.event_data.level;
	}

	/**
	 * The time when the Hype Train started.
	 */
	get startDate(): Date {
		return new Date(this._data.event_data.started_at);
	}

	/**
	 * The time when the Hype Train is set to expire.
	 */
	get expiryDate(): Date {
		return new Date(this._data.event_data.expires_at);
	}

	/**
	 * The time when the Hype Train cooldown will end.
	 */
	get cooldownDate(): Date {
		return new Date(this._data.event_data.cooldown_end_time);
	}

	/**
	 * The total amount of progress points of the Hype Train event.
	 */
	get total(): number {
		return this._data.event_data.total;
	}

	/**
	 * The progress points goal to reach the next Hype Train level.
	 */
	get goal(): number {
		return this._data.event_data.goal;
	}

	/**
	 * The last contribution to the Hype Train event.
	 */
	get lastContribution(): HelixHypeTrainContribution {
		return new HelixHypeTrainContribution(this._data.event_data.last_contribution, this._client);
	}

	/**
	 * Array list of the top contributions to the Hype Train event for bits and subs.
	 */
	get topContributions(): HelixHypeTrainContribution[] {
		return this._data.event_data.top_contributions.map(cont => new HelixHypeTrainContribution(cont, this._client));
	}
}
