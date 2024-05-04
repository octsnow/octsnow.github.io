$(window).ready(function () {

	$('#logo')
		.css({opacity: '0'})
		.delay( 300 )
		.animate({'opacity': '1'}, 1000 );

	/*
	 * メニューバーの処理
	 */

	// 画面上にくっついてくるメニューバー
	let nav = $('#main-nav');
	let navTop = nav.offset().top;
	$(window).scroll(function () {
		let winTop = $(this).scrollTop();
		if (winTop >= navTop) {
			nav.addClass('fixed');
		} else if (winTop <= navTop) {
			nav.removeClass('fixed');
		}
	});
});
