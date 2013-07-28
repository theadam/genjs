function initBoard(){
	
}

function NQueens(size){
	return {
		creator : function(opts){
			var candidate = [];
			for (var i = 0; i < size; i++) {
				candidate[i] = i;
			}
			EvolverUtils.shuffle(candidate);
			return candidate;
		},
		
		fitnessEvaluator : {
			isNatural : false,
			evaluate : function(candidate) {
				tlTobr = [];
				blTotr = [];
				var i;
				for (i = 0; i < candidate.length; i++) {
					if(tlTobr[candidate[i] + i] === undefined){
						tlTobr[candidate[i] + i] = 0;
					}
					if(blTotr[(candidate[i] - i) + candidate.length - 1] === undefined){
						blTotr[(candidate[i] - i) + candidate.length - 1] = 0;
					}
					tlTobr[candidate[i] + i] += 1;
					blTotr[(candidate[i] - i) + candidate.length - 1] += 1;
				}
				var ret = 0;
				for (i = 0; i < candidate.length * 2 - 1; i++) {
					if (tlTobr[i] > 1) {
						ret += (tlTobr[i] - 1);
					}
					if (blTotr[i] > 1) {
						ret += (blTotr[i] - 1);
					}
				}
				return ret;
			}
		},

		pipeline : EvolverUtils.operatorPipeline(
			EvolverUtils.wrapMater(function(parent1, parent2){
				child = [];
				var s, f;
				for (var i = 0; i < parent1.length; i++) {
					if (i % 2 == 0) {
						f = parent1;
						s = parent2;
					} 
					else {
						s = parent2;
						f = parent1;
					}
					
					if (!EvolverUtils.arrayContains(child, f[i])) {
						child[i] = f[i];
					} 
					else if (!EvolverUtils.arrayContains(child, s[i])) {
						child[i] = s[i];
					} 
					else {
						for (var j = 0; j < size; j++) {
							if (!EvolverUtils.arrayContains(child, j)) {
								child[i] = j;
								break;
							}
						}
					}	
				}
				return child;
			}), 
			function(probability){
				return EvolverUtils.wrapMutator(function(candidate){
					if(Math.random() <= probability){
						var i = Math.floor(Math.random() * (candidate.length));
						var j = i;
						while (j == i) {
							j = Math.floor(Math.random() * (candidate.length));
						}
						var temp = candidate[i];
						candidate[i] = candidate[j];
						candidate[j] = temp;
					}
					return candidate;
				});
			}(0.2)
		),

		hook : function(evolver){
			var candidate = evolver.bestCandidate;
			var fitness = evolver.bestFitness;
			$('#generation').html("<p>Generation: " + evolver.generationCount + "</p>");
			$('#fitness').html("<p>Best Fitness: " + fitness + "</p>");
			$('.red').removeClass('red');
			for (var i = 0; i < candidate.length; i++) {
				$('#' + i + '_' + candidate[i]).addClass('red');
			}
		},
		
		initDom : function(){
			var width = (Math.min(window.innerWidth, window.innerHeight) - 200) / size;
			$('#genjs-display').html("<div id='generation'/><div id='fitness'/><div id='board'/>");
			var htmlString = '';
			for (var i = 0; i < size; i++) {
				htmlString += "<div class='row'>";
				var j;
				for (j = 0; j < size; j++) {
					var classString = "cell";
	 				if((i + j) % 2 == 1){
						classString += " black";
					}
					var idString = i + "_" + j;
					htmlString += "<div id='" + idString + "' style='width: " + width + "px; height: " + width + "px' class='" + classString + "'/>";
				}
				htmlString += "</div>";
			}
			$('#board').html(htmlString);
		}
	}
}

