/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact, get } from 'lodash';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryJetpackOnboardingSettings from 'components/data/query-jetpack-onboarding-settings';
import Wizard from 'components/wizard';
import {
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from './constants';
import {
	getJetpackOnboardingSettings,
	getRequest,
	getUnconnectedSiteIdBySlug,
} from 'state/selectors';
import { requestJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	// TODO: Add lifecycle methods to redirect if no siteId

	render() {
		const {
			isRequestingSettings,
			recordJpoEvent,
			settings,
			siteId,
			siteSlug,
			stepName,
			steps,
		} = this.props;
		return (
			<Main className="jetpack-onboarding">
				<QueryJetpackOnboardingSettings siteId={ siteId } />
				<Wizard
					basePath="/jetpack/onboarding"
					baseSuffix={ siteSlug }
					components={ COMPONENTS }
					hideNavigation={ stepName === STEPS.SUMMARY }
					isRequestingSettings={ isRequestingSettings }
					recordJpoEvent={ recordJpoEvent }
					siteId={ siteId }
					settings={ settings }
					stepName={ stepName }
					steps={ steps }
				/>
			</Main>
		);
	}
}
export default connect(
	( state, { siteSlug } ) => {
		const siteId = getUnconnectedSiteIdBySlug( state, siteSlug );
		const settings = getJetpackOnboardingSettings( state, siteId );
		const isBusiness = get( settings, 'siteType' ) === 'business';
		const isRequestingSettings = getRequest( state, requestJetpackOnboardingSettings( siteId ) )
			.isLoading;

		// Note: here we can select which steps to display, based on user's input
		const steps = compact( [
			STEPS.SITE_TITLE,
			STEPS.SITE_TYPE,
			STEPS.HOMEPAGE,
			STEPS.CONTACT_FORM,
			isBusiness && STEPS.BUSINESS_ADDRESS,
			isBusiness && STEPS.WOOCOMMERCE,
			STEPS.SUMMARY,
		] );
		return {
			isRequestingSettings,
			siteId,
			siteSlug,
			settings,
			steps,
		};
	},
	{ recordTracksEvent },
	( { siteId, ...stateProps }, { recordTracksEvent: recordTracksEventAction }, ownProps ) => ( {
		siteId,
		...stateProps,
		recordJpoEvent: ( event, additionalProperties ) =>
			recordTracksEventAction( event, {
				blog_id: siteId,
				site_id_type: 'jpo',
				...additionalProperties,
			} ),
		...ownProps,
	} )
)( JetpackOnboardingMain );
