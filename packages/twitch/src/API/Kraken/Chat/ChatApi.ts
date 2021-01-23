import { Cacheable, Cached } from '@d-fischer/cache-decorators';
import { rtfm } from 'twitch-common';
import { BaseApi } from '../../BaseApi';
import type { ChatEmoteData } from 'twitch-common';
import { ChatEmoteList } from './ChatEmoteList';

/**
 * The API methods that deal with chat and chatrooms.
 *
 * Can be accessed using `client.kraken.chat` on an {@ApiClient} instance.
 *
 * ## Example
 * ```ts
 * const api = new ApiClient(new StaticAuthProvider(clientId, accessToken));
 * const emotes = await api.kraken.chat.getEmotesBySets('1');
 * ```
 */
@Cacheable
@rtfm('twitch', 'ChatApi')
export class ChatApi extends BaseApi {
	/**
	 * Retrieves a list of emotes for a given list of enote set IDs.
	 *
	 * @param emotesets The list of emote set IDs, either as array of strings or as a comma separated string.
	 */
	@Cached(3600)
	async getEmotesBySets(emotesets: string[] | string): Promise<ChatEmoteList> {
		if (typeof emotesets !== 'string') {
			emotesets = emotesets.join(',');
		}

		const data = await this._client.callApi<{ emoticons: ChatEmoteData[] }>({
			url: 'chat/emoticon_images',
			query: {
				emotesets
			}
		});

		return new ChatEmoteList(data.emoticons);
	}
}
