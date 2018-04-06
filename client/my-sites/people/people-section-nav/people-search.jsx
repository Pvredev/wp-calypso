/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import urlSearch from 'lib/url-search';

export const PeopleSearch = ( { doSearch, search } ) => (
	<Search
		pinned
		fitsContainer
		onSearch={ doSearch }
		initialValue={ search }
		delaySearch
		analyticsGroup="People"
	/>
);

PeopleSearch.propTypes = {
	doSearch: PropTypes.func.isRequired,
	search: PropTypes.string,
};

export default urlSearch( PeopleSearch );
