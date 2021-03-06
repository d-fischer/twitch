import { Enumerable } from '@d-fischer/shared-utils';
import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
import type { ApiClient } from '../../../ApiClient';
import type { ChannelData } from '../channel/Channel';
import { Channel } from '../channel/Channel';

/**
 * The possible sizes for a stream preview.
 */
export type StreamPreviewSize = 'small' | 'medium' | 'large' | 'template';

/** @private */
export type StreamPreviewUrlList = {
	[size in StreamPreviewSize]: string;
};

/** @private */
export interface StreamDataWrapper {
	stream: StreamData | null;
}

/** @private */
export interface StreamData {
	_id: string | number;
	game: string;
	viewers: number;
	video_height: number;
	average_fps: number;
	delay: number;
	created_at: string;
	is_playlist: boolean;
	stream_type: StreamType;
	preview: StreamPreviewUrlList;
	channel: ChannelData;
}

/**
 * The type of a stream.
 */
export type StreamType = 'live' | 'premiere' | 'rerun' | 'all';

/**
 * A Twitch stream.
 */
@rtfm<Stream>('api', 'Stream', 'id')
export class Stream extends DataObject<StreamData> {
	@Enumerable(false) private readonly _client: ApiClient;

	/** @private */
	constructor(data: StreamData, client: ApiClient) {
		super(data);
		this._client = client;
	}

	/**
	 * The ID of the stream.
	 */
	get id(): string {
		return this[rawDataSymbol]._id.toString();
	}

	/**
	 * The game played on the stream.
	 */
	get game(): string {
		return this[rawDataSymbol].game;
	}

	/**
	 * The current number of concurrent viewers.
	 */
	get viewers(): number {
		return this[rawDataSymbol].viewers;
	}

	/**
	 * The height of the stream video.
	 */
	get videoHeight(): number {
		return this[rawDataSymbol].video_height;
	}

	/**
	 * The average FPS (frames per second) that are shown on the stream.
	 */
	get averageFps(): number {
		return this[rawDataSymbol].average_fps;
	}

	/**
	 * The delay of the stream, in seconds.
	 */
	get delay(): number {
		return this[rawDataSymbol].delay;
	}

	/**
	 * The time when the stream started.
	 */
	get startDate(): Date {
		return new Date(this[rawDataSymbol].created_at);
	}

	/**
	 * Whether the stream is running a playlist.
	 */
	get isPlaylist(): boolean {
		return this[rawDataSymbol].is_playlist;
	}

	/**
	 * The type of the stream.
	 */
	get type(): StreamType {
		return this[rawDataSymbol].stream_type;
	}

	/**
	 * Gets the URL of a preview image for the stream.
	 *
	 * @param size The size of the image.
	 */
	getPreviewUrl(size: StreamPreviewSize): string {
		return this[rawDataSymbol].preview[size];
	}

	/**
	 * The channel where the stream is shown.
	 */
	get channel(): Channel {
		return new Channel(this[rawDataSymbol].channel, this._client);
	}
}
