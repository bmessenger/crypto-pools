(function($) {
	
	/* Our main function that takes the API endpoint and a marker to determine if it's the first time calling */
	function getInit(url, set) {
		
		/* Looping through our data */
		$.getJSON(url, function(data) {
			
			/* This is our main array that will hold all of the pool Objects */
			var vspPools = [];
			var toAppend = [];
			
			$.each(data, function(key, val) {
				
				/* Occasionally we have an long exponential value, this cleans that up */
				$eRate = val['earningRates']['14'];
				$eNum = Number( $eRate );
				if ( $eRate.toString().includes('e') ) {
					$eRate = $eNum.toPrecision(3);
					$eRate = $eRate.toString();
					$eRate = $eRate.split('e')[0];
				};
				
				/* 
				* If the risk level is 3 or less it's considered 'conservative'
				* If the risk level is 4 or more it's 'aggressive'
				*/
				if ( val['riskLevel'] <= 3 ) {
					$risk = 'conservative';
				} else if ( val['riskLevel'] >= 4 ) {
					$risk = 'aggressive';
				}
				
				/* 
				* Here we're building each pool object and pushing it to our main array.
				* We force the rates to Numbers so we can easily sort and compare
				*/
				
				if ( !(val['name'] == 'vVSP' || val['type'] == 'earn') ) {
					vspPools.push({
						name: val['name'],
						eRate: Number( $eRate ),
						type: val['type'],
						url: 'https://app.generic.finance/eth/' + val['address'],
						icon: val['logoURI'],
						risk: $risk,
						tag: val['asset']['symbol']
					});
				}
				/*
				* We only run this to update the values after the initial
				* pools have been added to the page, checking every 10 seconds
				*/
				if ( set == false ) {
					
					/* When comparing the HTML rate to the new rate we switch back to a string and add a % */
					$newRate = $eRate + '%';
					
					/* Compare existing rate with incoming rate to detect a change, style as needed */
					if ( $('.' + val['name'] + '-rate').find('.rate').html() != '' ) { //If the HTML rate field isn't empty
						if ( $('.' + val['name'] + '-rate').find('.rate').html() !== $newRate ) { // Compare the current HTML in the pool to the new rate coming in
							$('.' + val['name'] + '-rate').addClass('eyes'); // adds a small outline while the rate is changing
							$('.' + val['name'] + '-rate').find('.rate').html($eRate + '%');
							setTimeout( function() {
								$('.vRate').removeClass('eyes');
							}, 1000);
						}
					}
				}
					
			});
			
			/* Sort or main array of objects in Descending order based on the Earning Rate */
			vspPools.sort( (a,b) => b.eRate - a.eRate );
			
			/* 
			* If this is our first time calling the API we go ahead and
			* print the pool card to the page, filling in the HTMl with our object values.
			*/
			if ( set == true) {
				
				vspPools.forEach( function(item,index) {
					
					toAppend.push('<div class="col-12 col-sm-6 col-md-6 col-lg-4 ' + item.name + '-rate vRate mb-4 ' + item.type + '"><a href="' + item.url + '" target="_blank"><div class="wp-block-group pool match ' + item.risk + '"><div class="wp-block-group__inner-container"><figure class="wp-block-image size-full is-resized mb-3"><img loading="lazy" src="' + item.icon + '" alt="' + item.name + ' Icon" class="pool-img" width="49" height="49"></figure><h5>' + item.tag + ' <span class="risk ' + item.risk + '">' + item.risk  + '</span></h5><span class="rate">' + item.eRate + '%</span><p class="label mb-1">Earning Rate</p></div></div></a></div>');
					
				});
				
				$('.pools > div > .row.grid').append( toAppend.join("") );
				
				/* Only show first x pools, wrap the rest in a div and hide */
				$v = 0;
				$('.vRate').each(function() {
					if ( $(window).width() <= 767 ) {
						$v >= 4?$(this).addClass('vis'):'';
					} else {
						$v >= 3?$(this).addClass('vis'):'';
					}
					$v++;
				});
				$('.vis').wrapAll('<div class="row break hidden-pools px-0 mx-auto" />');
				
			}
		});
	};

	/* Call the API for the first time and print our pool cards to the page */
	getInit('https://api.generic.finance/pools', true );
	
	/* Call every 10 seconds after the initial page load */
	setInterval(function() {
		getInit('https://api.generic.finance/pools', false);
	}, 10000);

})(jQuery);