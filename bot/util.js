var utilBot = {
    bind: function bind(method) {
        if(method) {
            var self = this;
            return(function(){return(method.apply(self, arguments));});
        }
    },
    signal: function signal(sig, args) {
		if(args === undefined) {
			$(document).trigger(sig);
		} else {
			$(document).trigger(sig,args);
		}
    },
    listen: function listen(sig,meth) {
        $(document).bind(sig,this.bind(meth));
    },
	numberToString: function numberToString(num) {
		num = parseInt(num,10);
		if(num >= 1000000000) {
			num = Math.floor(num / 100000000);
			num /= 10;
			num += " B";
		} else if(num >= 1000000) {
			num = Math.floor(num / 100000);
			num /= 10;
			num += " M";
		} else if(num >= 1000) {
			num = Math.floor(num / 100);
			num /= 10;
			num += " K";
		}
		return num;
	}
};