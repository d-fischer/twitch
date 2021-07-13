import { Enumerable } from '@d-fischer/shared-utils';
import type { ApiClient, HelixUser } from 'twitch';
import { rtfm } from 'twitch-common';
import type { PubSubBasicMessageInfo, PubSubChatMessage } from './PubSubMessage';

/** @private */
export interface PubSubSubscriptionDetail {
	context: 'sub' | 'resub';
	cumulative_months: number;
	streak_months: number;
}

/** @private */
export interface PubSubSubscriptionGiftDetail {
	context: 'subgift' | 'anonsubgift' | 'resubgift' | 'anonresubgift';
	recipient_id: string;
	recipient_user_name: string;
	recipient_display_name: string;
	months: number;
	multi_month_duration: number;
}

/** @private */
export type PubSubSubscriptionMessageData = PubSubBasicMessageInfo & {
	display_name: string;
	sub_plan: 'Prime' | '1000' | '2000' | '3000';
	sub_plan_name: string;
	sub_message: PubSubChatMessage;
} & (PubSubSubscriptionDetail | PubSubSubscriptionGiftDetail);

/**
 * A message that informs about a user subscribing to a channel.
 */
@rtfm<PubSubSubscriptionMessage>('twitch-pubsub-client', 'PubSubSubscriptionMessage', 'userId')
export class PubSubSubscriptionMessage {
	@Enumerable(false) private readonly _apiClient: ApiClient;
	@Enumerable(false) private readonly _data: PubSubSubscriptionMessageData;

	/** @private */
	constructor(data: PubSubSubscriptionMessageData, apiClient: ApiClient) {
		this._data = data;
		this._apiClient = apiClient;
	}

	/**
	 * The ID of the user subscribing to the channel.
	 */
	get userId(): string {
		return this._data.context === 'subgift'
			|| this._data.context === 'anonsubgift'
			|| this._data.context === 'resubgift'
			|| this._data.context === 'anonresubgift'
			? this._data.recipient_id
			: this._data.user_id;
	}

	/**
	 * The name of the user subscribing to the channel.
	 */
	get userName(): string {
		return this._data.context === 'subgift'
			|| this._data.context === 'anonsubgift'
			|| this._data.context === 'resubgift'
			|| this._data.context === 'anonresubgift'
			? this._data.recipient_user_name
			: this._data.user_name;
	}

	/**
	 * The display name of the user subscribing to the channel.
	 */
	get userDisplayName(): string {
		return this._data.context === 'subgift'
			|| this._data.context === 'anonsubgift'
			|| this._data.context === 'resubgift'
			|| this._data.context === 'anonresubgift'
			? this._data.recipient_display_name
			: this._data.display_name;
	}

	/**
	 * The streak amount of months the user has been subscribed for.
	 *
	 * Returns 0 if a gift sub or the streaks months.
	 */
	get streakMonths(): number {
		return this._data.context === 'subgift'
			|| this._data.context === 'anonsubgift'
			|| this._data.context === 'resubgift'
			|| this._data.context === 'anonresubgift'
			? 0
			: (this._data as PubSubSubscriptionDetail).streak_months;
	}

	/**
	 * The cumulative amount of months the user has been subscribed for.
	 *
	 * Returns the months if a gift sub or the cumulative months.
	 */
	get cumulativeMonths(): number {
		return this._data.context === 'subgift'
			|| this._data.context === 'anonsubgift'
			|| this._data.context === 'resubgift'
			|| this._data.context === 'anonresubgift'
			? this._data.months
			: (this._data as PubSubSubscriptionDetail).cumulative_months;
	}

	/**
	 * The cumulative amount of months the user has been subscribed for.
	 *
	 * Returns the months if a gift sub or the cumulative months.
	 */
	get months(): number {
		return this.cumulativeMonths;
	}

	/**
	 * The time the user subscribed.
	 */
	get time(): Date {
		return new Date(this._data.time);
	}

	/**
	 * The message sent with the subscription.
	 *
	 * Returns null if the subscription is a gift subscription.
	 */
	get message(): PubSubChatMessage | null {
		return this._data.context === 'subgift' || this._data.context === 'anonsubgift' ? null : this._data.sub_message;
	}

	/**
	 * The plan of the subscription.
	 */
	get subPlan(): string {
		return this._data.sub_plan;
	}

	/**
	 * Whether the subscription is a resub.
	 */
	get isResub(): boolean {
		return this._data.context === 'resub';
	}

	/**
	 * Whether the subscription is a gift.
	 */
	get isGift(): boolean {
		return this._data.context === 'subgift' || this._data.context === 'resubgift';
	}

	/**
	 * Whether the subscription is from an anonymous gifter.
	 */
	get isAnonymous(): boolean {
		return this._data.context === 'anonsubgift' || this._data.context === 'anonresubgift';
	}

	/**
	 * The ID of the user gifting the subscription.
	 *
	 * Returns null if the subscription is not a gift.
	 */
	get gifterId(): string | null {
		return this.isGift ? this._data.user_id : null;
	}

	/**
	 * The name of the user gifting the subscription.
	 *
	 * Returns null if the subscription is not a gift.
	 */
	get gifterName(): string | null {
		return this.isGift ? this._data.user_name : null;
	}

	/**
	 * The display name of the user gifting the subscription.
	 *
	 * Returns null if the subscription is not a gift.
	 */
	get gifterDisplayName(): string | null {
		return this.isGift ? this._data.display_name : null;
	}

	/**
	 * The duration of the gifted subscription, in months.
	 *
	 * Returns null if the subscription is not a gift.
	 */
	get giftDuration(): number | null {
		return this._data.context === 'subgift'
			|| this._data.context === 'resubgift'
			|| this._data.context === 'anonsubgift'
			|| this._data.context === 'anonresubgift'
			? this._data.multi_month_duration
			: null;
	}

	/**
	 * Retrieves more information about the subscribing user.
	 *
	 * @deprecated Use {@HelixUserApi#getUserById} instead.
	 */
	async getUser(): Promise<HelixUser | null> {
		return this._apiClient.helix.users.getUserById(this.userId);
	}

	/**
	 * Retrieves more information about the gifting user.
	 *
	 * Returns null if the subscription is not a gift.
	 *
	 * @deprecated Use {@HelixUserApi#getUserById} instead.
	 */
	async getGifter(): Promise<HelixUser | null> {
		if (!this.isGift) {
			return null;
		}

		return this._apiClient.helix.users.getUserById(this.gifterId!);
	}
}
