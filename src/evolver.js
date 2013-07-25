Array.prototype.binarySearch = function(value){
	var mid = 0;
	var low = 0;
	var hi = this.length -1;
	while (low <= hi)
	{
		mid = (low + hi) >>> 1;
		var d = this[mid];
		if (d == value){
			return mid;
		}
		else if (d > value){
			hi = mid - 1;
		}
		else{
			// This gets the insertion point right on the last loop.
			low = ++mid;
		}
	}
	return -mid - 1;
};

var EvolverUtils = {
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
		cumulativeFitnesses[0] = EvolverUtils.getAdjustedFitness(evaluatedPopulation[0].fitness,
                                                    evaluatedPopulation[0].isNatural);
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
            var index = cumulativeFitnesses.binarySearch(randomFitness);
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
		}
	}
};



function Evolver(candidateCreator, fitnessEvaluator, evolutionOperator){
	this.candidateCreator = candidateCreator;
	this.fitnessEvaluator = fitnessEvaluator;
	this.evolutionOperator = evolutionOperator;
	this.generationCount = 0;
	this.sortFunction = fitnessEvaluator.isNatural?
		function(a,b){return b.fitness-a.fitness} :
		function(a,b){return a.fitness-b.fitness};
}

Evolver.prototype.evolve = function(opts){
	this.opts = opts = opts || {};
	this.populationSize = opts.populationSize || 20;
	this.selectFunction = opts.selectFunction || EvolverUtils.rouletteWheelSelector;
	this.eliteCount = opts.eliteCount || 1;
	this.evolutionHook = opts.evolutionHook || function(evolver){
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
		this.population.push({candidate: candidate, fitness: fitness, isNatural: this.fitnessEvaluator.isNatural});
	} 
	this.population.sort(this.sortFunction);
	this.bestFitness = this.population[0].fitness;
	this.bestCandidate = this.population[0].candidate;
	this.runEvolutionStep();
}

Evolver.prototype.runEvolutionStep = function(){
	var elite = this.population.slice(0, this.eliteCount);
	
	var selection = this.selectFunction(this.population, this.population.length - this.eliteCount);
	
	var nextGen = this.evolutionOperator(selection);
	
	var evaluatedNextGen = [];
	for(var i = 0; i < nextGen.length; i++){
		var candidate = nextGen[i];
		var fitness = this.fitnessEvaluator.evaluate(candidate);
		evaluatedNextGen.push({candidate: candidate, fitness: fitness, isNatural: this.fitnessEvaluator.isNatural});
	}
		
	this.population = elite.concat(evaluatedNextGen);	
	
	this.population.sort(this.sortFunction);
	this.bestFitness = this.population[0].fitness;
	this.bestCandidate = this.population[0].candidate;
	
	this.evolutionHook(this);
	if(this.terminator(this)){
		return this.population[0];
	}
	this.generationCount++
	var scope = this;
	setTimeout(function(){scope.runEvolutionStep()}, 20);
}



