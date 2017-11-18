/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import GuidedTransfer from './guided-transfer';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isEligibleForGuidedTransfer } from 'state/sites/guided-transfer/selectors';

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		isEligibleForGuidedTransfer: isEligibleForGuidedTransfer( state, siteId ),
	};
}

export default connect( mapStateToProps )( GuidedTransfer );
