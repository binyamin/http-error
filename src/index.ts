import {
	isClientErrorStatus,
	STATUS_TEXT,
	type ErrorStatus,
	type StatusText,
} from './status.ts';

export interface HttpErrorOptions extends ErrorOptions {
	expose?: boolean;
	data?: Record<string, unknown>;
}

export interface HttpErrorPayload {
	name: Pick<StatusText, ErrorStatus>[ErrorStatus];
	code: ErrorStatus;
	message?: string;
	data?: Record<string, unknown>;
}

export class HttpError extends Error {
	#status: ErrorStatus;
	#expose: boolean;
	#json: HttpErrorPayload;

	constructor(
		status: ErrorStatus = 500,
		message?: string,
		options?: HttpErrorOptions,
	) {
		super(message ?? STATUS_TEXT[status], options);
		this.#status = status;
		this.#expose = options?.expose ?? isClientErrorStatus(this.status);

		this.#json = {
			name: STATUS_TEXT[this.status],
			code: this.status,
			message,
			data: options?.data,
		};
	}

	get status(): ErrorStatus {
		return this.#status;
	}

	/**
	 * Whether the error details should be visible to end-users.
	 *
	 * By default, the value is `false` when {@linkcode status} is a server (5xx) error.
	 */
	get expose(): boolean {
		return this.#expose;
	}

	toJSON(): HttpErrorPayload {
		return this.#json;
	}

	static from(error: Error, status: ErrorStatus = 500): HttpError {
		if (error instanceof HttpError) {
			return error;
		}

		return new HttpError(status, error.message, {
			cause: error,
		});
	}
}
