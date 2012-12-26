/**
 * Default bootstrap-datepicker backend; performs date operations manually.
 */
;(function($){
	var dates = $.fn.datepicker.dates;

	function dspThaiYear(language){
		return language.search('-th')>=0;
	}
	function smartThai(language){
		return language.search('th')>=0;
	}
	function smartFullYear(v,language){
		if (smartThai(language) && v>=2400) v -= 543; // thaiyear 24xx -
		if (dspThaiYear(language) && v < 2400-543) v -= 543 ;
		
		return v;
	}
	
	function smartShortYear(v,language){
		if (v<100){
			if (v>=70) v -= 100; // 1970 - 1999
			if (smartThai(language) && v>=40) v -= 43; // thaiyear [2540..2569] -> [1997..2026]
			v += 2000 ;
		}
		return v ;
	}
	function smartYear(v,language){
		return smartFullYear(smartShortYear(v,language),language);
	}
	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	/*function UTCToday(){
		var today = new Date();
		return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
	}*/
	

	// inherit default backend
	var DPGlobal = $.fn.datepicker.getBackend();
	if (!DPGlobal.name || DPGlobal.name.search(/.th$/)>0)
		return
		
	var	_basebackend_ = $.extend({},DPGlobal);
	$.extend(DPGlobal,{
		name: _basebackend_.name + '.th',
		parseDate: function(date, format, language) {
			if (date==''){
				date = new Date();
				date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			}
			if (smartThai(language) && !((date instanceof Date) || /^[-+].*/.test(date))){
				var formats = this.parseFormat(format),
					parts = date && date.match(this.nonpunctuation) || [];
				if (parts.length == formats.parts.length) {
					var seps = $.extend([], formats.separators),
						xdate = [] ;
					for (var i=0, cnt = formats.parts.length; i < cnt; i++) {
						if (['yyyy','yy'].indexOf(formats.parts[i])>=0)
							parts[i] = ''+smartYear(parseInt(parts[i], 10),language);
						if (seps.length)
							xdate.push(seps.shift())
						xdate.push(parts[i]);
					}
					date = xdate.join('');
				}
			}
			return _basebackend_.parseDate.call(this,date,format,language);
		},	
		formatDate: function(date, format, language){
			var fmtdate = _basebackend_.formatDate.call(this,date,format,language);
			if (dspThaiYear(language)){
				var formats = this.parseFormat(format),
					parts = fmtdate && fmtdate.match(this.nonpunctuation) || [],
					trnfrm = {
						yy: (543+date.getUTCFullYear()).toString().substring(2),
						yyyy: (543+date.getUTCFullYear()).toString()
						};
				if (parts.length == formats.parts.length) {
					var seps = $.extend([], formats.separators),
						xdate = [] ;
					for (var i=0, cnt = formats.parts.length; i < cnt; i++) {
						if (seps.length)
							xdate.push(seps.shift())
						xdate.push(trnfrm[formats.parts[i]] || parts[i]);
					}
					fmtdate = xdate.join('');
				}
			
			}
			return fmtdate;
		},
	});

	// inherit core datepicker
	var DatePicker = $.fn.datepicker.Constructor ;
	if (!DatePicker.prototype.fillThai){
		var _basemethod_ = $.extend({},DatePicker.prototype) ;
		$.extend(DatePicker.prototype,{
			fillThai: function(){
				var thaiyear = 543;
				var d = new Date(this.viewDate),
					year = d.getUTCFullYear(),
					month = d.getUTCMonth();

				var elem = this.picker.find('.datepicker-days th:eq(1)') ;
				//console.log(elem.text(),''+year,''+(year+thaiyear));
				elem.text(elem.text().replace(''+year,''+(year+thaiyear))) ;

				this.picker
					.find('.datepicker-months')
						.find('th:eq(1)').text(''+(year+thaiyear)) ;
				year = parseInt((year+thaiyear)/10, 10) * 10;
				this.picker
					.find('.datepicker-years')
						.find('th:eq(1)')
							.text(year + '-' + (year + 9))
							.end()
							.find('td')
								.find('span.year')
								.each(function(){$(this).text(Number($(this).text())+thaiyear);});
			},
			fill: function(){
				_basemethod_.fill.call(this);
				if (dspThaiYear(this.language))
					this.fillThai();
			},
			clickThai: function(e){
				var target = $(e.target).closest('span');
				if (target.length === 1 && target.is('.year'))
					target.text(Number(target.text())-543);
			},
			click: function(e){
				if (dspThaiYear(this.language))
					this.clickThai(e);
				_basemethod_.click.call(this,e);
			},
			hide: function(e){
				if (this.picker.is(':visible'))
					_basemethod_.hide.call(this,e);
			},
			keydown: function(e){
				if (this.picker.is(':not(:visible)')) {
					if (e.keyCode == 40){ // allow key down to re-show picker
						if ($(e.target).is('[autocomplete="off"]')){
							this.show();
							return;
						}
					}
				}
				_basemethod_.keydown.call(this,e);
			}
			
		});
	}
}(jQuery));
