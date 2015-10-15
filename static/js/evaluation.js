var debug = false;

/*
 * Object specifying all expression types
 */
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

/*
 * Evaulates the given expression with existing scope. 
 * Scope is a map of variables to objects.
 *
 * @param {Expression} expr - expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaluate(expr, scope){
	//Calls the correct function to evaluate the expression
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
		return evaulateVarAccess(expr.vari, expr.field, scope);
	} else if(expr.type == expressionTypes.CONST){
		return expr.val; //Return the constants value
	} else if(expr.type == expressionTypes.IFF){
		return evaulateEqual(expr.first, expr.second, scope);
	} else if (expr.type == expressionTypes.XOR){
		return evaulateInequal(expr.first, expr.second, scope);
	}
}

/*
 * Evaluate there exists.
 *
 * @param {Expression} some - the there exists expression to evaluate
 * @param {object} scope - maps variables to values 
 */
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

/*
 * Evaluate for all.
 *
 * @param {Expression} all - the for all expression to evaluate
 * @param {object} scope - maps variables to values 
 */
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

/*
 * Evaluate and expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateAnd(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) && evaluate(expr2, scope));
}

/*
 * Evaluate or expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateOr(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) || evaluate(expr2, scope));
}

/*
 * Evaluate equals expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateEqual(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) === evaluate(expr2, scope));
}

/*
 * Evaluate inequal expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateInequal(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) !== evaluate(expr2, scope));
}

/*
 * Evaluate less than expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateLessThan(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) < evaluate(expr2, scope));
}

/*
 * Evaluate greater than expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateGreaterThan(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) > evaluate(expr2, scope));
}

/*
 * Evaluate less than or equals expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateLessThanEqual(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) <= evaluate(expr2, scope));
}

/*
 * Evaluate greater than or equals expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateGreaterThanEqual(expr1, expr2, scope){
	return !!(evaluate(expr1, scope) >= evaluate(expr2, scope));
}

/*
 * Evaluate implies expressions.
 *
 * @param {Expression} expr1 - the left expression to evaluate
 * @param {Expression} expr2 - the right expression to evaluate
 * @param {object} scope - maps variables to values 
 */
function evaulateImplies(expr1, expr2, scope){
	var x = evaluate(expr1, scope);
	if (!x) return true;
	var y = evaluate(expr2, scope);

	return  !!((!x) || (x && y));
}

/*
 * Evaluate a variable access.
 *
 * @param {string} vari - the variable name
 * @param {string} field - the field name (can be null)
 * @param {object} scope - maps variables to values 
 */
function evaulateVarAccess(vari, field, scope){
	//If field is null then return the variable object
	if (field === null) {
		return scope[vari];
	}
	
	//Otherwise return the field value of the variable
	return scope[vari][field]
}