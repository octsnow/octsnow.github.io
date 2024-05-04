$(function(){
	let ul = $( '#contents-list > ul' );
	
	$( '#memo' ).each( ( i, e ) => {
		let title = $( e ).find( 'h3' ).text();
		$( e ).attr( 'id', i );
		$( ul )
			.append( $( '<li></li>' )
			.append( $( '<a></a>' )
			.attr( 'href', '#' + i )
			.text( title ) ) );
	});
});