var debug = false;

var expressionTypes = {
	AND: 'AND',
	OR: 'OR',
	NOT: 'NOT',
	SOME: 'SOME',
	ALL: 'ALL',
	EQUALS: 'EQUALS',
	NOT_EQUALS: 'NOT_EQUALS',
	LESS_THAN: 'LESS_THAN',
	GREATER_THAN: 'GREATER_THAN',
	LTE: 'LTE',
	GTE: 'GTE',
	IMPLIES: 'IMPLIES',
	INDEPENDENT: 'INDEPENDENT',
	VAR_ACCESS : 'VAR_ACCESS',
	CONST: 'CONST',
	IFF: 'IFF',
	XOR: 'XOR'
} //FUTURE: arthimetric expressions

function evaluate(expr, scope){
	if (expr.type === expressionTypes.SOME) { 
		return evaluateSome(expr, scope);
	} else if (expr.type === expressionTypes.ALL) {
		return evaluateAll(expr, scope);
	} else if (expr.type === expressionTypes.NOT) {
		return !evaluate(expr.first, scope);
	} else if(expr.type == expressionTypes.AND){
		return evaulateAnd(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.OR){
		return evaulateOr(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.EQUALS){
		return evaulateEqual(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.NOT_EQUALS){
		return evaulateInequal(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.LESS_THAN){
		return evaulateLessThan(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.GREATER_THAN){
		return evaulateGreaterThan(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.LTE){
		return evaulateLessThanEqual(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.GTE){
		return evaulateGreaterThanEqual(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.IMPLIES){
		return evaulateImplies(expr.first, expr.second, scope);
	} else if(expr.type == expressionTypes.VAR_ACCESS){
		return evaulateVarAccess(expr.val, expr.field, scope);
	} else if(expr.type == expressionTypes.CONST){
		return expr.val;
	} else if(expr.type == expressionTypes.IFF){
		return evaulateEqual(expr.first, expr.second, scope);
	} else if (expr.type == expressionTypes.XOR){
		return evaulateInequal(expr.first, expr.second, scope);
	}

}

function evaluateSome(some, scope){
	var v = some.first;
	if (scope[v]) {
		//TODO: Overwriting variable
	} else {
		return function (sc) {
			var s = sc;
			return world.some(function(obj) {
				var newScope = Object.create(s);
				newScope[v] = obj; 
				return evaluate(some.second, newScope);
			});
		}(scope);
	}
}

function evaluateAll(all, scope){
	var v = all.first;
	if (scope[v]) {
		//TODO: Overwriting variable
	} else {
		return function (sc) {
			var s = sc;
			return world.reduce(function(prev, curr) {
				var newScope = Object.create(s);
				newScope[v] = curr; 
				return prev && evaluate(all.second, newScope);
			}, true);
		}(scope);
	}
}

function evaulateAnd(expr1, expr2, scope){
	return evaluate(expr1, scope) && evaluate(expr2, scope);
}

function evaulateOr(expr1, expr2, scope){
	return evaluate(expr1, scope) || evaluate(expr2, scope);
}

function evaulateEqual(expr1, expr2, scope){
	return evaluate(expr1, scope) === evaluate(expr2, scope);
}

function evaulateInequal(expr1, expr2, scope){
	return evaluate(expr1, scope) !== evaluate(expr2, scope);
}

function evaulateLessThan(expr1, expr2, scope){
	return evaluate(expr1, scope) < evaluate(expr2, scope);
}

function evaulateGreaterThan(expr1, expr2, scope){
	return evaluate(expr1, scope) > evaluate(expr2, scope);
}

function evaulateLessThanEqual(expr1, expr2, scope){
	return evaluate(expr1, scope) <= evaluate(expr2, scope);
}

function evaulateGreaterThanEqual(expr1, expr2, scope){
	return evaluate(expr1, scope) >= evaluate(expr2, scope);
}

function evaulateImplies(expr1, expr2, scope){
	var x = evaluate(expr1, scope);
	if (!x) return true;
	var y = evaluate(expr2, scope);

	return  ((!x) || (x && y));
}

function evaulateVarAccess(vari, field, scope){
	console.log(vari, field, scope);
	if (field === null) {
		return scope[vari];
	}
	console.log(scope[vari]);
	return scope[vari][field]
}

//TODO Fix
function toString(expr){
	if (expr.type === expressionTypes.SOME 
		|| expr.type === expressionTypes.ALL 
		|| expr.type === expressionTypes.NOT) {
		var sum = "";
		expr.children.forEach(function (child) {
			sum += ' ' + toString(child);
		});
		var x = expr.type + sum;
	}
	else{
		return toString(expr.children[0]) + ' ' + expr.type + ' ' + toString(expr.children[1]);
	}
}
