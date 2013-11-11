var EvolverUtils = {
	arrayContains : function(array, value){
	    var i = array.length;
	    while (i--) {
	       if (array[i] === value) {
	           return true;
	       }
	    }
	    return false;
	},
	
	binarySearchArray : function(array, value){
		var mid = 0;
		var low = 0;
		var hi = array.length -1;
		while (low <= hi)
		{
			mid = (low + hi) >>> 1;
			var d = array[mid];
			if (d == value){
				return mid;
			}
			else if (d > value){
				hi = mid - 1;
			}
			else{
				low = ++mid;
			}
		}
		return -mid - 1;
	}, 

	getAdjustedFitness : function(fitness, isNatural){
		if(isNatural){
			return fitness;
		}
		else{
			return fitness == 0? 0 : 1/fitness;
		}
	},

	rouletteWheelSelector : function(evaluatedPopulation, selectionSize){
		var cumulativeFitnesses = [];
		cumulativeFitnesses[0] = EvolverUtils.getAdjustedFitness(evaluatedPopulation[0].fitness, evaluatedPopulation[0].isNatural);
		for (var i = 1; i < evaluatedPopulation.length; i++)
		{
			var fitness = EvolverUtils.getAdjustedFitness(evaluatedPopulation[i].fitness,
			evaluatedPopulation[i].isNatural);
			cumulativeFitnesses[i] = cumulativeFitnesses[i - 1] + fitness;
		}

		var selection = [];
		for (var i = 0; i < selectionSize; i++)
		{
			var randomFitness = Math.random() * cumulativeFitnesses[cumulativeFitnesses.length - 1];
			var index = EvolverUtils.binarySearchArray(cumulativeFitnesses, randomFitness);
			if (index < 0)
			{
				// Convert negative insertion point to array index.
				index = Math.abs(index + 1);
			}
			selection.push(evaluatedPopulation[index].candidate);
		}
		return selection;

	},

	operatorPipeline : function(){
		var operators = arguments;
		return function(population){
			for(var i = 0; i < operators.length; i++){
				var operator = operators[i];
				population = operator(population);
			}
			return population;
		}
	},

	wrapMutator : function(mutator){
		return function(population){
			var newPopulation = [];
			for(var i = 0; i < population.length; i++){
				var candidate = population[i];
				newPopulation.push(mutator(candidate));
			}
			return newPopulation;
		}
	},

	shuffle : function(list) {
		var i, j, t;
		for (i = 1; i < list.length; i++) {
			j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
			if (j != i) {
				t = list[i];                        // swap list[i] and list[j]
				list[i] = list[j];
				list[j] = t;
			}
		}
	},

	wrapMater : function(mater){
		return function(population){
			EvolverUtils.shuffle(population);
			var newPopulation = [];
			for(var i = 0; i < population.length; i += 2){
				if(population[i+1] !== undefined){
					var parent1 = population[i];
					var parent2 = population[i+1];
					newPopulation.push(mater(parent1, parent2));
					newPopulation.push(mater(parent2, parent1));

				}
				else{
					newPopulation.push(population[i]);
				}
			}
			return newPopulation;
		}
	}
};



function Evolver(candidateCreator, fitnessEvaluator, evolutionOperator){
	this.candidateCreator = candidateCreator;
	if(typeof fitnessEvaluator === 'function'){
		this.fitnessEvaluator = {
			isNatural:false, 
			evaluate:fitnessEvaluator
		}
	}
	else{
		this.fitnessEvaluator = fitnessEvaluator;
	}
	this.evolutionOperator = evolutionOperator;
	this.generationCount = 0;
	this.isTerminated = false;
	this.sortFunction = fitnessEvaluator.isNatural?
	function(a,b){
			var fitnessDiff = b.fitness-a.fitness;
			return fitnessDiff != 0 ? fitnessDiff : a.age - b.age;
		} :
	function(a,b){
			var fitnessDiff = a.fitness-b.fitness;
			return fitnessDiff != 0 ? fitnessDiff : a.age - b.age;
		};
}

Evolver.prototype.evolve = function(opts){
	this.opts = opts = opts || {};
	this.populationSize = opts.populationSize || 20;
	this.selectFunction = opts.selectFunction || EvolverUtils.rouletteWheelSelector;
	this.eliteCount = opts.eliteCount || 1;
	this.generationHook = opts.generationHook || function(evolver){
		console.log('Generation: ' + evolver.generationCount + ' - ' + evolver.bestCandidate + ' (' + evolver.bestFitness + ')');
	}
	this.terminator = opts.terminator || function(evolver){
		if(evolver.fitnessEvaluator.isNatural){
			return evolver.generation == 5000;
		}
		else{
			return evolver.bestFitness == 0;
		}
	}
	this.population = [];

	for(var i = 0; i < this.populationSize; i++){
		var candidate = this.candidateCreator(opts);
		var fitness = this.fitnessEvaluator.evaluate(candidate);
		this.population.push({candidate: candidate, fitness: fitness, isNatural: this.fitnessEvaluator.isNatural, age: 1});
	} 
	this.population.sort(this.sortFunction);
	this.bestFitness = this.population[0].fitness;
	this.bestCandidate = this.population[0].candidate;
	this.bestAge = this.population[0].age;
	this.runEvolutionStep();
}

Evolver.prototype.runEvolutionStep = function(){
	var elite = this.population.slice(0, this.eliteCount);
	for(var i = 0; i< elite.length;i++){
		elite[i].age += 1;
	}

	var selection = this.selectFunction(this.population, this.population.length - this.eliteCount);

	var nextGen = this.evolutionOperator(selection);

	var evaluatedNextGen = [];
	for(var i = 0; i < nextGen.length; i++){
		var candidate = nextGen[i];
		var fitness = this.fitnessEvaluator.evaluate(candidate);
		evaluatedNextGen.push({candidate: candidate, fitness: fitness, isNatural: this.fitnessEvaluator.isNatural, age: 1});
	}

	this.population = elite.concat(evaluatedNextGen);	

	this.population.sort(this.sortFunction);
	this.bestFitness = this.population[0].fitness;
	this.bestCandidate = this.population[0].candidate;
	this.bestAge = this.population[0].age;

	if(this.terminator(this)){
		this.isTerminated = true;
	}
	this.generationHook(this);
	
	this.generationCount++
	var scope = this;
	if(!this.isTerminated){
		setTimeout(function(){scope.runEvolutionStep()}, 20);
	}
}



