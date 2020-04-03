/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useI18n } from '@automattic/react-i18n';
import { useHistory } from 'react-router-dom';
import { Spring, animated } from 'react-spring/renderprops';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import designs from '../../available-designs';
import { usePath, Step } from '../../path';
import { isEnabled } from '../../../../config';
import Link from '../../components/link';
import { SubTitle, Title } from '../../components/titles';

import './style.scss';

type Design = import('../../stores/onboard/types').Design;

// Values for springs:
const ZOOM_OFF = { transform: 'scale(1)' };
const ZOOM_ON = { transform: 'scale(1.015)' };
const SHADOW_OFF = { boxShadow: '0 0px 0px rgba(0,0,0,.12)' };
const SHADOW_ON = { boxShadow: '0 2px 12px rgba(0,0,0,.12)' };

const DesignSelector: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { push } = useHistory();
	const makePath = usePath();
	const { setSelectedDesign, setFonts, resetOnboardStore } = useDispatch( ONBOARD_STORE );

	const getDesignUrl = ( design: Design ) => {
		// We temporarily show pre-generated screenshots until we can generate tall versions dynamically using mshots.
		// See `bin/generate-gutenboarding-design-thumbnails.js` for generating screenshots.
		// https://github.com/Automattic/mShots/issues/16
		// https://github.com/Automattic/wp-calypso/issues/40564
		if ( ! isEnabled( 'gutenboarding/mshot-preview' ) ) {
			return `/calypso/page-templates/design-screenshots/${ design.slug }_${ design.template }_${ design.theme }.jpg`;
		}

		const mshotsUrl = 'https://s.wordpress.com/mshots/v1/';
		const previewUrl = addQueryArgs( design.src, {
			font_headings: design.fonts.headings,
			font_base: design.fonts.base,
		} );
		return mshotsUrl + encodeURIComponent( previewUrl );
	};

	// Track hover/focus
	const [ hoverDesign, setHoverDesign ] = React.useState< string >();
	const [ focusDesign, setFocusDesign ] = React.useState< string >();

	return (
		<div className="design-selector">
			<div className="design-selector__header">
				<div className="design-selector__heading">
					<Title>{ NO__( 'Choose a starting design' ) }</Title>
					<SubTitle>
						{ NO__(
							'Get started with one of our top website layouts. You can always change it later'
						) }
					</SubTitle>
				</div>
				<Link
					className="design-selector__start-over-button"
					onClick={ () => resetOnboardStore() }
					to={ makePath( Step.IntentGathering ) }
					isLink
				>
					{ NO__( 'Start over' ) }
				</Link>
			</div>
			<div className="design-selector__design-grid">
				<div className="design-selector__grid">
					{ designs.featured.map( design => {
						const isFocused = hoverDesign === design.slug || focusDesign === design.slug;
						return (
							<Spring
								native
								key={ design.slug }
								from={ ZOOM_OFF }
								to={ isFocused ? ZOOM_ON : ZOOM_OFF }
							>
								{ ( props: React.CSSProperties ) => (
									<animated.button
										style={ props }
										onMouseEnter={ () => setHoverDesign( design.slug ) }
										onMouseLeave={ () =>
											setHoverDesign( s => ( s === design.slug ? undefined : s ) )
										}
										onFocus={ () => setFocusDesign( design.slug ) }
										onBlur={ () => setFocusDesign( s => ( s === design.slug ? undefined : s ) ) }
										className="design-selector__design-option"
										onClick={ () => {
											setSelectedDesign( design );

											// Update fonts to the design defaults
											setFonts( design.fonts );

											if ( isEnabled( 'gutenboarding/style-preview' ) ) {
												push( makePath( Step.Style ) );
											}
										} }
									>
										<Spring
											native
											key={ design.slug }
											from={ SHADOW_OFF }
											to={ isFocused ? SHADOW_ON : SHADOW_OFF }
										>
											{ ( props2: React.CSSProperties ) => (
												<animated.span style={ props2 } className="design-selector__image-frame">
													<img alt={ design.title } src={ getDesignUrl( design ) } />
												</animated.span>
											) }
										</Spring>
										<span className="design-selector__option-overlay">
											<span className="design-selector__option-name">{ design.title }</span>
										</span>
									</animated.button>
								) }
							</Spring>
						);
					} ) }
				</div>
			</div>
		</div>
	);
};

export default DesignSelector;
