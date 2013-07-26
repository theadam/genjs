function StringEvolverDescriptor(goal){
	return {
		fitnessEvaluator : {
			isNatural : false,
			evaluate : function(candidate){
				var total = 0;
				for(var i = 0; i < goal.length; i++){
					total += (goal.charCodeAt(i) - candidate.charCodeAt(i)) * (goal.charCodeAt(i) - candidate.charCodeAt(i));
				}
				return total;
			}
		},

		creator : function(opts){
			var value = '';
			for(var i = 0; i < goal.length; i++){
				value += String.fromCharCode(Math.floor(Math.random() * 255));
			}
			return value;
		},

		pipeline : EvolverUtils.operatorPipeline(
			EvolverUtils.wrapMater(function(parent1, parent2){
				var index = Math.floor(Math.random() * parent1.length);
				var value = parent1.substr(0, index) + parent2.substr(index);
				return value;
			}), 
			function(probability){
				return EvolverUtils.wrapMutator(function(candidate){
					if(Math.random() <= probability){
						var index = Math.floor(Math.random() * candidate.length);
						var twiddle = Math.random() <= 0.5 ? 1 : -1;
						var newChar = String.fromCharCode(candidate.charCodeAt(index) + twiddle);
						candidate = candidate.substr(0, index) + newChar + candidate.substr(index + 1);
					}
					return candidate;
				});
			}(0.5)
		),

		hook : function(evolver){
			var population = evolver.population;
			var htmlString = '';
			htmlString += 'Generation: ' + evolver.generationCount;
			htmlString += '<ul>';
			for(var i = 0; i < population.length; i++){
				var member = population[i];
				htmlString += '<li>' + member.candidate +' (' + member.fitness + ')</li>';
			}
			htmlString += '</ul>';
			document.getElementById('genjs-display').innerHTML = htmlString;
		}
	}
}

