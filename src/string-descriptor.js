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
	
		/*var mate = function(population){
			var index = Math.floor(Math.random() * this.value.length);
			var child = new StringGene(this.opts);
			child.value = this.value.substr(0, index) + other.value.substr(index);
			return child;
		},*/

		mutator : function(probability){
			return function(population){
				var newPopulation = [];
				for(var i = 0; i < population.length; i++){
					var string = population[i];
					if(Math.random() >= probability){
						var index = Math.floor(Math.random() * string.length);
						var twiddle = Math.random() <= 0.5 ? 1 : -1;
						var newChar = String.fromCharCode(string.charCodeAt(index) + twiddle);
						string = string.substr(0, index) + newChar + string.substr(index + 1);
					}
					newPopulation.push(string);
				}
				return newPopulation;
			}
		}(0.5),
		
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
			document.body.innerHTML = htmlString;
		}
	}
}