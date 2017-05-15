/**
 * External dependencies
 */
import superagent from 'superagent';

/***
 * Internal dependencies
 */
import { extendAction } from 'state/utils';
import { HTTP_REQUEST } from 'state/action-types';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';

const isAllHeadersValid = headers =>
	headers.every( headerPair => Array.isArray( headerPair ) &&
			headerPair.length === 2 &&
			typeof headerPair[ 0 ] === 'string' &&
			typeof headerPair[ 1 ] === 'string'
	);

/***
 * Handler to perform an http request based on `HTTP_REQUEST` action parameters:
 * {String} url the url to request
 * {String} method the method we should use in the request: GET, POST etc.
 * {Array<Array<String>>} headers array of [ 'key', 'value' ] pairs for the request headers
 * {Object} body data send as body
 * {Boolean} withCredentials save cookie set on request
 * {Action} onSuccess action to dispatch on success with data meta
 * {Action} onFailure action to dispatch on failure with error meta
 *
 * @param {Function} dispatch redux store dispatch
 * @param {Function} action dispatched action we need to handle
 * @returns {Promise} promise of the handled request
 */
const httpHandler = ( { dispatch }, action ) => {
	const {
		url,
		method,
		body,
		withCredentials,
		onSuccess,
		onFailure
	} = action;

	const headers = action.headers || [];

	if ( ! isAllHeadersValid( headers ) ) {
		const error = new Error( "Not all headers were of an array pair: [ 'key', 'value' ]" );
		dispatch( extendAction( onFailure, failureMeta( error ) ) );
		return Promise.reject( error );
	}

	let request = superagent( method, url );

	if ( withCredentials ) {
		request = request.withCredentials();
	}

	request = headers.reduce(
		( localRequest, [ headerKey, headerValue ] ) => localRequest.set( headerKey, headerValue ),
		request
	);

	request = request.accept( 'application/json' );

	if ( body ) {
		request = request.send( body );
	}

	return request.then(
		data => dispatch( extendAction( onSuccess, successMeta( data ) ) ),
		error => {
			dispatch( extendAction( onFailure, failureMeta( error ) ) );
			return Promise.reject( error );
		}
	);
};

export default {
	[ HTTP_REQUEST ]: [ httpHandler ]
};
