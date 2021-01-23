import { TwitchApiCallType } from 'twitch-api-call';
import type { UserIdResolvable, UserNameResolvable } from 'twitch-common';
import { extractUserId, extractUserName, HellFreezesOverError, rtfm } from 'twitch-common';
import { BaseApi } from '../../BaseApi';
import { HelixPaginatedRequestWithTotal } from '../HelixPaginatedRequestWithTotal';
import type { HelixPaginatedResultWithTotal } from '../HelixPaginatedResult';
import { createPaginatedResultWithTotal } from '../HelixPaginatedResult';
import type { HelixPaginatedResponse, HelixPaginatedResponseWithTotal, HelixResponse } from '../HelixResponse';
import type { HelixInstalledExtensionListData } from './Extensions/HelixInstalledExtensionList';
import { HelixInstalledExtensionList } from './Extensions/HelixInstalledExtensionList';
import type { HelixUserExtensionData } from './Extensions/HelixUserExtension';
import { HelixUserExtension } from './Extensions/HelixUserExtension';
import type { HelixUserExtensionUpdatePayload } from './Extensions/HelixUserExtensionUpdatePayload';
import type { HelixFollowData, HelixFollowFilter } from './HelixFollow';
import { HelixFollow } from './HelixFollow';
import type { HelixPrivilegedUserData } from './HelixPrivilegedUser';
import { HelixPrivilegedUser } from './HelixPrivilegedUser';
import type { HelixUserData } from './HelixUser';
import { HelixUser } from './HelixUser';

/** @private */
export enum UserLookupType {
	Id = 'id',
	Login = 'login'
}

/**
 * User data to update using {@HelixUserApi#updateUser}.
 */
export interface HelixUserUpdate {
	description?: string;
}

/**
 * The Helix API methods that deal with users.
 *
 * Can be accessed using `client.helix.users` on an {@ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient(new StaticAuthProvider(clientId, accessToken));
 * const user = await api.helix.users.getUserById('125328655');
 * ```
 */
@rtfm('twitch', 'HelixUserApi')
export class HelixUserApi extends BaseApi {
	/**
	 * Retrieves the user data for the given list of user IDs.
	 *
	 * @param userIds The user IDs you want to look up.
	 */
	async getUsersByIds(userIds: UserIdResolvable[]): Promise<HelixUser[]> {
		return this._getUsers(UserLookupType.Id, userIds.map(extractUserId));
	}

	/**
	 * Retrieves the user data for the given list of user names.
	 *
	 * @param userNames The user names you want to look up.
	 */
	async getUsersByNames(userNames: UserNameResolvable[]): Promise<HelixUser[]> {
		return this._getUsers(UserLookupType.Login, userNames.map(extractUserName));
	}

	/**
	 * Retrieves the user data for the given user ID.
	 *
	 * @param userId The user ID you want to look up.
	 */
	async getUserById(userId: UserIdResolvable): Promise<HelixUser | null> {
		const users = await this._getUsers(UserLookupType.Id, [extractUserId(userId)]);
		return users.length ? users[0] : null;
	}

	/**
	 * Retrieves the user data for the given user name.
	 *
	 * @param userName The user name you want to look up.
	 */
	async getUserByName(userName: UserNameResolvable): Promise<HelixUser | null> {
		const users = await this._getUsers(UserLookupType.Login, [extractUserName(userName)]);
		return users.length ? users[0] : null;
	}

	/**
	 * Retrieves the user data of the currently authenticated user.
	 *
	 * @param withEmail Whether you need the user's email address.
	 */
	async getMe(withEmail: boolean = false): Promise<HelixPrivilegedUser> {
		const result = await this._client.callApi<HelixResponse<HelixPrivilegedUserData>>({
			type: TwitchApiCallType.Helix,
			url: 'users',
			scope: withEmail ? 'user:read:email' : ''
		});

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!result.data?.length) {
			throw new HellFreezesOverError('Could not get authenticated user');
		}

		return new HelixPrivilegedUser(result.data[0], this._client);
	}

	/**
	 * Updates the currently authenticated user's data.
	 *
	 * @param data The data to update.
	 */
	async updateUser(data: HelixUserUpdate): Promise<HelixPrivilegedUser> {
		const result = await this._client.callApi<HelixResponse<HelixPrivilegedUserData>>({
			type: TwitchApiCallType.Helix,
			url: 'users',
			method: 'PUT',
			scope: 'user:edit',
			query: {
				description: data.description
			}
		});

		return new HelixPrivilegedUser(result.data[0], this._client);
	}

	/**
	 * Retrieves a list of follow relations.
	 *
	 * @param filter Several filtering and pagination parameters. See the {@HelixFollowFilter} documentation.
	 */
	async getFollows(filter: HelixFollowFilter): Promise<HelixPaginatedResultWithTotal<HelixFollow>> {
		const query = HelixUserApi._makeFollowsQuery(filter);

		const result = await this._client.callApi<HelixPaginatedResponseWithTotal<HelixFollowData>>({
			url: 'users/follows',
			type: TwitchApiCallType.Helix,
			query
		});

		return createPaginatedResultWithTotal(result, HelixFollow, this._client);
	}

	/**
	 * Creates a paginator for follow relations.
	 *
	 * @param filter Several filtering and pagination parameters. See the {@HelixFollowFilter} documentation.
	 */
	getFollowsPaginated(filter: HelixFollowFilter): HelixPaginatedRequestWithTotal<HelixFollowData, HelixFollow> {
		const query = HelixUserApi._makeFollowsQuery(filter);

		return new HelixPaginatedRequestWithTotal(
			{
				url: 'users/follows',
				query
			},
			this._client,
			(data: HelixFollowData) => new HelixFollow(data, this._client)
		);
	}

	/**
	 * Retrieves the follow relation bewteen a given user and a given broadcaster.
	 *
	 * @param user The user to retrieve the follow relation for.
	 * @param broadcaster The broadcaster to retrieve the follow relation for.
	 */
	async getFollowFromUserToBroadcaster(
		user: UserIdResolvable,
		broadcaster: UserIdResolvable
	): Promise<HelixFollow | null> {
		const { data: result } = await this.getFollows({ user, followedUser: broadcaster });

		return result.length ? result[0] : null;
	}

	/**
	 * Checks whether the given user follows the given broadcaster.
	 *
	 * @param user The user to check the follow for.
	 * @param broadcaster The broadcaster to check the follow for.
	 */
	async userFollowsBroadcaster(user: UserIdResolvable, broadcaster: UserIdResolvable): Promise<boolean> {
		return (await this.getFollowFromUserToBroadcaster(user, broadcaster)) !== null;
	}

	/**
	 * Creates a new follow from a user to another user.
	 *
	 * @param fromUser The user to create the follow for.
	 * @param toUser The user to follow.
	 * @param allowNotifications Whether email or push notifications are allowed to be created.
	 *
	 * The user `fromUser` still needs to have this enabled in their settings as well.
	 */
	async createFollow(
		fromUser: UserIdResolvable,
		toUser: UserIdResolvable,
		allowNotifications?: boolean
	): Promise<void> {
		await this._client.callApi({
			type: TwitchApiCallType.Helix,
			url: 'users/follows',
			method: 'POST',
			scope: 'user:edit:follows',
			jsonBody: {
				from_id: extractUserId(fromUser),
				to_id: extractUserId(toUser),
				allow_notifications: allowNotifications
			}
		});
	}

	/**
	 * Removes a follow from a user to another user.
	 *
	 * @param fromUser The user to remove the follow for.
	 * @param toUser The user to unfollow.
	 */
	async deleteFollow(fromUser: UserIdResolvable, toUser: UserIdResolvable): Promise<void> {
		await this._client.callApi({
			type: TwitchApiCallType.Helix,
			url: 'users/follows',
			method: 'DELETE',
			scope: 'user:edit:follows',
			jsonBody: {
				from_id: extractUserId(fromUser),
				to_id: extractUserId(toUser)
			}
		});
	}

	/**
	 * Get a list of all extensions for the authenticated user.
	 */
	async getMyExtensions(): Promise<HelixUserExtension[]> {
		const result = await this._client.callApi<HelixResponse<HelixUserExtensionData>>({
			type: TwitchApiCallType.Helix,
			url: 'users/extensions/list'
		});

		return result.data.map(data => new HelixUserExtension(data));
	}

	/**
	 * Get a list of all installed extensions for the given user.
	 *
	 * @param user The user to get the installed extensions for.
	 *
	 * If not given, get the installed extensions for the authenticated user.
	 */
	async getActiveExtensions(user?: UserIdResolvable): Promise<HelixInstalledExtensionList> {
		const userId = user ? extractUserId(user) : undefined;
		const result = await this._client.callApi<{ data: HelixInstalledExtensionListData }>({
			type: TwitchApiCallType.Helix,
			url: 'users/extensions',
			query: {
				user_id: userId
			}
		});

		return new HelixInstalledExtensionList(result.data);
	}

	/**
	 * Updates the installed extensions for the authenticated user.
	 *
	 * @param data The extension installation payload.
	 *
	 * The format is shown on the [Twitch documentation](https://dev.twitch.tv/docs/api/reference#update-user-extensions).
	 * Don't use the "data" wrapper though.
	 */
	async updateMyActiveExtensions(data: HelixUserExtensionUpdatePayload): Promise<HelixInstalledExtensionList> {
		const result = await this._client.callApi<{ data: HelixInstalledExtensionListData }>({
			type: TwitchApiCallType.Helix,
			url: 'users/extensions',
			jsonBody: { data }
		});

		return new HelixInstalledExtensionList(result.data);
	}

	private static _makeFollowsQuery(filter: HelixFollowFilter) {
		const query: Record<string, string | undefined> = {};
		let hasUserIdParam = false;
		if (filter.user) {
			query.from_id = extractUserId(filter.user);
			hasUserIdParam = true;
		}
		if (filter.followedUser) {
			query.to_id = extractUserId(filter.followedUser);
			hasUserIdParam = true;
		}

		if (!hasUserIdParam) {
			throw new TypeError('At least one of user and followedUser have to be set');
		}

		return query;
	}

	private async _getUsers(lookupType: UserLookupType, param: string[]) {
		if (param.length === 0) {
			return [];
		}
		const query: Record<string, string | string[] | undefined> = { [lookupType]: param };
		const result = await this._client.callApi<HelixPaginatedResponse<HelixUserData>>({
			type: TwitchApiCallType.Helix,
			url: 'users',
			query
		});

		return result.data.map(userData => new HelixUser(userData, this._client));
	}
}
