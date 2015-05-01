jQuery.sap.declare("<%= fioriComponentNamespace %>.util.Formatter");

<%= fioriComponentNamespace %>.util.Formatter = {

	uppercaseFirstChar : function(sStr) {
		return sStr.charAt(0).toUpperCase() + sStr.slice(1);
	},


	currencyValue : function (value) {
		return parseFloat(value).toFixed(2);
	}
};